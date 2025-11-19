
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch bid proposal
    const bid = await prisma.bidProposal.findUnique({
      where: { id: params.id }
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    if (!bid.closingDate) {
      return NextResponse.json(
        { error: 'This bid proposal does not have a closing date' },
        { status: 400 }
      );
    }

    // Generate Google Calendar event URL
    const closingDate = new Date(bid.closingDate);
    
    // Format dates for Google Calendar
    const startDate = closingDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Set event duration to 1 hour
    const endDate = new Date(closingDate.getTime() + 60 * 60 * 1000)
      .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(`Bid Submission: ${bid.title}`);
    const description = encodeURIComponent(
      `Solicitation: ${bid.solicitationNumber || 'N/A'}\n` +
      `Organization: ${bid.issuingOrg || 'N/A'}\n` +
      `Type: ${bid.solicitationType || 'N/A'}\n\n` +
      `Description: ${bid.description || 'No description'}\n\n` +
      `View Details: ${process.env.NEXTAUTH_URL}/dashboard/bid-proposals/${bid.id}`
    );
    
    const location = encodeURIComponent(bid.location || 'Online Submission');
    
    const calendarUrl = 
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${title}` +
      `&dates=${startDate}/${endDate}` +
      `&details=${description}` +
      `&location=${location}` +
      `&trp=false`;
    
    return NextResponse.json({
      success: true,
      calendarUrl,
      message: 'Calendar event URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar event' },
      { status: 500 }
    );
  }
}
