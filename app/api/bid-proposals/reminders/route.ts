export const runtime = 'nodejs'; // Changed from 'edge' to support Prisma Client

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// This endpoint should be called by a cron job (e.g., daily at 9 AM)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (basic authentication)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find bids with upcoming deadlines that haven't been fully submitted
    const upcomingBids = await prisma.bidProposal.findMany({
      where: {
        submissionStatus: {
          not: 'fully_submitted'
        },
        closingDate: {
          gte: now,
          lte: sevenDaysFromNow
        }
      },
      select: {
        id: true,
        title: true,
        solicitationNumber: true,
        issuingOrg: true,
        closingDate: true,
        submissionStatus: true,
        createdById: true
      }
    });

    // Get user emails for each bid
    const userIds = [...new Set(upcomingBids.map((bid: any) => bid.createdById))];
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    const userMap: Map<string, any> = new Map(users.map((u: any) => [u.id, u]));
    const remindersSent: string[] = [];

    for (const bid of upcomingBids) {
      const user = userMap.get(bid.createdById) as any;
      if (!user?.email || !bid.closingDate) continue;

      const closingDate = new Date(bid.closingDate);
      const daysUntilClosing = Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminder based on days until closing
      let shouldSendReminder = false;
      let urgencyLevel = '';

      if (daysUntilClosing <= 1) {
        shouldSendReminder = true;
        urgencyLevel = 'URGENT';
      } else if (daysUntilClosing <= 3) {
        shouldSendReminder = true;
        urgencyLevel = 'High Priority';
      } else if (daysUntilClosing <= 7) {
        shouldSendReminder = true;
        urgencyLevel = 'Upcoming';
      }

      if (shouldSendReminder) {
        const subject = `${urgencyLevel}: Bid Proposal Due in ${daysUntilClosing} Day${daysUntilClosing !== 1 ? 's' : ''}`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1D2B53;">Bid Proposal Deadline Reminder</h2>
            
            <div style="background-color: ${daysUntilClosing <= 1 ? '#FEE2E2' : daysUntilClosing <= 3 ? '#FEF3C7' : '#DBEAFE'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: ${daysUntilClosing <= 1 ? '#DC2626' : daysUntilClosing <= 3 ? '#D97706' : '#2563EB'};">
                ${daysUntilClosing === 1 ? 'Due Tomorrow!' : daysUntilClosing === 0 ? 'Due Today!' : `${daysUntilClosing} Days Remaining`}
              </p>
            </div>

            <h3 style="color: #374151;">${bid.title}</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Solicitation Number:</td>
                <td style="padding: 8px 0; font-weight: bold;">${bid.solicitationNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Organization:</td>
                <td style="padding: 8px 0;">${bid.issuingOrg || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Closing Date:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${daysUntilClosing <= 1 ? '#DC2626' : '#374151'};">
                  ${closingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Submission Status:</td>
                <td style="padding: 8px 0;">${bid.submissionStatus.replace(/_/g, ' ').toUpperCase()}</td>
              </tr>
            </table>

            <div style="margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/bid-proposals/${bid.id}" 
                 style="display: inline-block; background-color: #1D2B53; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View & Submit Proposal
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              This is an automated reminder from CDM Suite. To stop receiving reminders for this bid, please submit it or mark it as completed.
            </p>
          </div>
        `;

        try {
          await sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
          });

          remindersSent.push(`${bid.title} (${user.email})`);
          console.log(`Sent reminder for bid ${bid.id} to ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send reminder for bid ${bid.id}:`, emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${upcomingBids.length} upcoming bids, sent ${remindersSent.length} reminders`,
      remindersSent
    });
  } catch (error) {
    console.error('Error in reminders cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
