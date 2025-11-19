

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseBulkLeadData, mapServicesToProposalItems } from '@/lib/bulk-import-parser';
import { generateProposalNumber, DEFAULT_TERMS } from '@/lib/proposal-types';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { data, generateProposals = true } = body;

    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Parse the bulk data
    const parsedLeads = parseBulkLeadData(data);

    if (parsedLeads.length === 0) {
      return NextResponse.json({ error: 'No valid leads found in the data' }, { status: 400 });
    }

    const createdLeads = [];
    const createdProposals = [];
    const errors = [];

    for (const parsedLead of parsedLeads) {
      try {
        // Check if lead already exists by email
        let existingLead = null;
        if (parsedLead.email) {
          existingLead = await prisma.lead.findFirst({
            where: { email: parsedLead.email },
          });
        }

        let lead;
        if (existingLead) {
          // Update existing lead
          lead = await prisma.lead.update({
            where: { id: existingLead.id },
            data: {
              name: parsedLead.name || existingLead.name,
              phone: parsedLead.phone || existingLead.phone,
              company: parsedLead.company || existingLead.company,
              interest: parsedLead.interest || existingLead.interest,
              notes: existingLead.notes
                ? `${existingLead.notes}\n\nBulk Import Update: ${parsedLead.rawText}`
                : `Bulk Import: ${parsedLead.rawText}`,
            },
          });

          // Log activity
          await prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              type: 'note',
              title: 'Lead Updated via Bulk Import',
              description: `Lead information updated from bulk import`,
              createdById: user.id,
            },
          });
        } else {
          // Create new lead
          lead = await prisma.lead.create({
            data: {
              email: parsedLead.email || `noemail-${Date.now()}@placeholder.com`,
              name: parsedLead.name,
              phone: parsedLead.phone,
              company: parsedLead.company,
              source: 'bulk-import',
              interest: parsedLead.interest,
              status: 'new',
              priority: 'medium',
              notes: `Bulk Import: ${parsedLead.rawText}`,
              score: 0,
              tags: JSON.stringify(['bulk-import']),
            },
          });

          // Create activity log
          await prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              type: 'note',
              title: 'Lead Created via Bulk Import',
              description: `Lead imported from bulk data`,
              createdById: user.id,
            },
          });
        }

        createdLeads.push(lead);

        // Generate proposal if requested and we have valid contact info
        if (generateProposals && parsedLead.email && parsedLead.serviceKeywords.length > 0) {
          try {
            const items = mapServicesToProposalItems(parsedLead.serviceKeywords);

            // Calculate totals
            const subtotal = items.reduce((sum, item) => sum + item.total, 0);
            const tax = 0;
            const discount = 0;
            const total = subtotal;

            const proposalNumber = generateProposalNumber();

            const proposal = await prisma.proposal.create({
              data: {
                proposalNumber,
                leadId: lead.id,
                clientName: parsedLead.name,
                clientEmail: parsedLead.email,
                clientPhone: parsedLead.phone,
                clientCompany: parsedLead.company,
                title: `Proposal for ${parsedLead.name}`,
                description: `Auto-generated proposal based on expressed interest: ${parsedLead.interest}`,
                status: 'draft',
                items: JSON.stringify(items),
                subtotal,
                tax,
                discount,
                total,
                terms: DEFAULT_TERMS,
                notes: `Auto-generated from bulk import. Please review and customize before sending.`,
                createdById: user.id,
              },
            });

            createdProposals.push(proposal);

            // Log activity
            await prisma.leadActivity.create({
              data: {
                leadId: lead.id,
                type: 'note',
                title: 'Draft Proposal Created',
                description: `Auto-generated proposal ${proposalNumber} from bulk import`,
                createdById: user.id,
              },
            });
          } catch (proposalError) {
            console.error('Error creating proposal:', proposalError);
            errors.push({
              lead: parsedLead.name,
              error: 'Failed to create proposal',
            });
          }
        }
      } catch (leadError: any) {
        console.error('Error processing lead:', leadError);
        errors.push({
          lead: parsedLead.name,
          error: leadError.message || 'Failed to process lead',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${createdLeads.length} leads and created ${createdProposals.length} draft proposals`,
      leadsCreated: createdLeads.length,
      proposalsCreated: createdProposals.length,
      errors: errors.length > 0 ? errors : undefined,
      leads: createdLeads,
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ error: 'Failed to process bulk import' }, { status: 500 });
  }
}

