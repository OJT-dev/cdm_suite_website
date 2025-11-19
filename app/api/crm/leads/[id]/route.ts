
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/auth-helpers';
import { calculateLeadScore } from '@/lib/crm-utils';
import { Lead } from '@/lib/crm-types';

// GET /api/crm/leads/[id] - Get a single lead
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        },
        sequences: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // All employees can view all leads (per EMPLOYEE_ACCESS_FIX)
    // Access restrictions only apply to non-employee users
    if (!user.role && !user.employeeProfile) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/leads/[id] - Update a lead
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check permissions
    const canEditLeads = user.role === 'admin' || 
      (user.employeeProfile && hasPermission(user.employeeProfile, 'canEditLeads'));

    if (!canEditLeads) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      company,
      status,
      priority,
      assignedToId,
      budget,
      timeline,
      notes,
      tags,
      nextFollowUpAt,
      lastContactedAt
    } = body;

    // Track changes for activity log
    const changes: string[] = [];
    if (status && status !== lead.status) changes.push(`Status changed from ${lead.status} to ${status}`);
    if (priority && priority !== lead.priority) changes.push(`Priority changed from ${lead.priority} to ${priority}`);
    if (assignedToId && assignedToId !== lead.assignedToId) changes.push('Lead reassigned');
    if (name && name !== lead.name) changes.push(`Name changed from "${lead.name}" to "${name}"`);
    if (phone && phone !== lead.phone) changes.push(`Phone changed from "${lead.phone}" to "${phone}"`);
    if (company && company !== lead.company) changes.push(`Company changed from "${lead.company}" to "${company}"`);
    if (budget && budget !== lead.budget) changes.push(`Budget changed from "${lead.budget}" to "${budget}"`);
    if (timeline && timeline !== lead.timeline) changes.push(`Timeline changed from "${lead.timeline}" to "${timeline}"`);

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        company,
        status,
        priority,
        assignedToId,
        budget,
        timeline,
        notes,
        tags,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : undefined,
        lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : undefined,
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Recalculate score
    const score = calculateLeadScore(updatedLead as unknown as Lead);
    await prisma.lead.update({
      where: { id: params.id },
      data: { score }
    });

    // Create activity log for significant changes
    if (changes.length > 0) {
      await prisma.leadActivity.create({
        data: {
          leadId: params.id,
          type: 'status_change',
          title: 'Lead updated',
          description: changes.join(', '),
          createdById: user.employeeProfile?.id
        }
      });
    }

    return NextResponse.json({ lead: { ...updatedLead, score } });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/leads/[id] - Delete a lead
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the master user (fray@cdmsuite.com) can delete leads
    if (session.user.email !== 'fray@cdmsuite.com') {
      return NextResponse.json({ error: 'Only the master user can delete leads' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get lead details before deletion for audit
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: {
        email: true,
        name: true,
        company: true,
        status: true
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Delete the lead (cascade will delete activities and other relations)
    await prisma.lead.delete({
      where: { id: params.id }
    });

    // Log the deletion (create a system-wide audit log if needed in the future)
    console.log(`Lead deleted by ${user.email}: ${lead.name || lead.email} (${lead.company || 'No company'})`);

    return NextResponse.json({ 
      message: 'Lead deleted successfully',
      deletedLead: {
        name: lead.name,
        email: lead.email,
        company: lead.company
      }
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead', details: error.message },
      { status: 500 }
    );
  }
}
