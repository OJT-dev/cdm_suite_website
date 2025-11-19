
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, bidIds } = await request.json();

    if (!action || !bidIds || !Array.isArray(bidIds) || bidIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide action and bidIds array' },
        { status: 400 }
      );
    }

    console.log(`[Bulk Action] User ${session.user.id} performing ${action} on ${bidIds.length} bids`);

    let result: any = {};

    switch (action) {
      case 'delete':
        // Delete multiple bid proposals
        const deleteResult = await prisma.bidProposal.deleteMany({
          where: {
            id: { in: bidIds },
            createdById: session.user.id // Only allow users to delete their own bids
          }
        });
        
        result = {
          success: true,
          message: `Successfully deleted ${deleteResult.count} bid proposal(s)`,
          deletedCount: deleteResult.count
        };
        break;

      case 'update_status':
        // Update submission status for multiple bids
        const { status } = await request.json();
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required for update_status action' },
            { status: 400 }
          );
        }

        const updateResult = await prisma.bidProposal.updateMany({
          where: {
            id: { in: bidIds },
            createdById: session.user.id
          },
          data: {
            submissionStatus: status,
            lastEditedById: session.user.id,
            lastEditedAt: new Date()
          }
        });

        result = {
          success: true,
          message: `Successfully updated ${updateResult.count} bid proposal(s)`,
          updatedCount: updateResult.count
        };
        break;

      case 'update_workflow_stage':
        // Update workflow stage for multiple bids
        const body = await request.json();
        const { workflowStage } = body;
        if (!workflowStage) {
          return NextResponse.json(
            { error: 'Workflow stage is required for update_workflow_stage action' },
            { status: 400 }
          );
        }

        const workflowResult = await prisma.bidProposal.updateMany({
          where: {
            id: { in: bidIds },
            createdById: session.user.id
          },
          data: {
            workflowStage: workflowStage,
            lastEditedById: session.user.id,
            lastEditedAt: new Date()
          }
        });

        result = {
          success: true,
          message: `Successfully updated workflow stage for ${workflowResult.count} bid proposal(s)`,
          updatedCount: workflowResult.count
        };
        break;

      case 'export':
        // Export bid data as JSON
        const bids = await prisma.bidProposal.findMany({
          where: {
            id: { in: bidIds },
            createdById: session.user.id
          },
          select: {
            id: true,
            title: true,
            solicitationNumber: true,
            referenceNumber: true,
            description: true,
            issuingOrg: true,
            solicitationType: true,
            location: true,
            closingDate: true,
            submissionStatus: true,
            workflowStage: true,
            proposedPrice: true,
            envelope1Status: true,
            envelope2Status: true,
            createdAt: true,
            updatedAt: true
          }
        });

        return NextResponse.json({
          success: true,
          data: bids,
          message: `Exported ${bids.length} bid proposal(s)`
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bulk action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
