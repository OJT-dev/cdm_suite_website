
// Sequence Activation Endpoint - Critical Bug #2 Fix
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logError, APIError, ERROR_CODES } from '@/lib/error-logger';
export const runtime = 'edge';


/**
 * POST /api/crm/sequences/[id]/activate
 * Activate a sequence (change status from pending/approved to active)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = `/api/crm/sequences/${params.id}/activate`;
  
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      await logError({
        level: 'warning',
        message: 'Unauthorized activation attempt',
        endpoint,
        context: { sequenceId: params.id },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.UNAUTHORIZED, 
          message: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // 2. Get user with role information
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeProfile: {
          select: {
            employeeRole: true,
            capabilities: true,
          },
        },
      },
    });

    if (!user) {
      await logError({
        level: 'error',
        message: 'User not found in database despite valid session',
        endpoint,
        userEmail: session.user.email,
        context: { sequenceId: params.id },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.FORBIDDEN, 
          message: 'User not found' 
        },
        { status: 403 }
      );
    }

    // 3. Permission check - only admin and employees can activate sequences
    const isAdmin = user.role?.toLowerCase() === 'admin';
    const isEmployee = user.role?.toLowerCase() === 'employee' || !!user.employeeProfile;
    
    if (!isAdmin && !isEmployee) {
      await logError({
        level: 'warning',
        message: 'Insufficient permissions to activate sequence',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: {
          sequenceId: params.id,
          userRole: user.role,
        },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: 'Only admins and employees can activate sequences' 
        },
        { status: 403 }
      );
    }

    // 4. Get the sequence
    const sequence = await prisma.sequence.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            steps: true,
            assignments: true,
          },
        },
      },
    });

    if (!sequence) {
      await logError({
        level: 'warning',
        message: 'Sequence not found',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: { sequenceId: params.id },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.RECORD_NOT_FOUND,
          message: 'Sequence not found' 
        },
        { status: 404 }
      );
    }

    // 5. Validate sequence has steps
    if (sequence.steps.length === 0) {
      await logError({
        level: 'warning',
        message: 'Cannot activate sequence without steps',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: {
          sequenceId: params.id,
          sequenceName: sequence.name,
        },
      });
      
      return NextResponse.json(
        {
          error: ERROR_CODES.SEQUENCE_NO_STEPS,
          message: 'Sequence must have at least one active step before activation',
          details: {
            sequenceName: sequence.name,
            stepsCount: sequence.steps.length,
          },
        },
        { status: 400 }
      );
    }

    // 6. Check current status - can only activate from pending or approved
    const allowedStatuses = ['pending', 'approved', 'paused'];
    if (!allowedStatuses.includes(sequence.status)) {
      await logError({
        level: 'warning',
        message: 'Invalid status transition for sequence activation',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: {
          sequenceId: params.id,
          sequenceName: sequence.name,
          currentStatus: sequence.status,
          allowedStatuses,
        },
      });
      
      return NextResponse.json(
        {
          error: ERROR_CODES.INVALID_STATUS_TRANSITION,
          message: `Cannot activate sequence with status "${sequence.status}". Must be pending, approved, or paused.`,
          details: {
            currentStatus: sequence.status,
            allowedStatuses,
          },
        },
        { status: 400 }
      );
    }

    // 7. Activate the sequence
    const now = new Date();
    const updatedSequence = await prisma.sequence.update({
      where: { id: params.id },
      data: {
        status: 'active',
        activatedAt: now,
        approvedById: user.id,
        approvedAt: sequence.approvedAt || now, // Set approved if not already
        updatedAt: now,
      },
      include: {
        steps: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            steps: true,
            assignments: true,
          },
        },
      },
    });

    // 8. Log success
    await logError({
      level: 'info',
      message: 'Sequence activated successfully',
      endpoint,
      userId: user.id,
      userEmail: user.email,
      context: {
        sequenceId: params.id,
        sequenceName: sequence.name,
        stepsCount: sequence.steps.length,
        assignmentsCount: sequence._count.assignments,
      },
    });

    // 9. Return success response
    return NextResponse.json({
      success: true,
      message: 'Sequence activated successfully',
      sequence: updatedSequence,
    });

  } catch (error: any) {
    // Log unexpected errors
    await logError({
      level: 'error',
      message: error.message || 'Unknown error activating sequence',
      stack: error.stack,
      endpoint,
      context: {
        sequenceId: params.id,
        errorName: error.name,
        errorCode: error.code,
      },
    });

    // Return error response
    if (error instanceof APIError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      {
        error: 'ACTIVATION_FAILED',
        message: 'Failed to activate sequence',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/crm/sequences/[id]/activate
 * Deactivate/pause a sequence
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = `/api/crm/sequences/${params.id}/activate`;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true, employeeProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: ERROR_CODES.FORBIDDEN, message: 'User not found' },
        { status: 403 }
      );
    }

    const isAdmin = user.role?.toLowerCase() === 'admin';
    const isEmployee = user.role?.toLowerCase() === 'employee' || !!user.employeeProfile;
    
    if (!isAdmin && !isEmployee) {
      return NextResponse.json(
        { error: ERROR_CODES.INSUFFICIENT_PERMISSIONS, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'pause' or 'archive'

    if (!['pause', 'archive'].includes(action)) {
      return NextResponse.json(
        { error: ERROR_CODES.VALIDATION_FAILED, message: 'Invalid action. Must be "pause" or "archive"' },
        { status: 400 }
      );
    }

    const now = new Date();
    const updatedSequence = await prisma.sequence.update({
      where: { id: params.id },
      data: {
        status: action === 'pause' ? 'paused' : 'archived',
        deactivatedAt: now,
        updatedAt: now,
      },
      include: {
        steps: { where: { active: true }, orderBy: { order: 'asc' } },
        approvedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { steps: true, assignments: true } },
      },
    });

    await logError({
      level: 'info',
      message: `Sequence ${action}d successfully`,
      endpoint,
      userId: user.id,
      userEmail: user.email,
      context: {
        sequenceId: params.id,
        sequenceName: updatedSequence.name,
        action,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sequence ${action}d successfully`,
      sequence: updatedSequence,
    });

  } catch (error: any) {
    await logError({
      level: 'error',
      message: error.message || 'Unknown error updating sequence status',
      stack: error.stack,
      endpoint,
      context: { sequenceId: params.id },
    });

    return NextResponse.json(
      { error: 'UPDATE_FAILED', message: 'Failed to update sequence status', details: error.message },
      { status: 500 }
    );
  }
}

