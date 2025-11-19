
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


// GET /api/crm/leads/export - Export leads to CSV
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const leadIds = searchParams.get('leadIds'); // Comma-separated IDs for selective export
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');

    const where: any = {};
    
    if (leadIds) {
      where.id = { in: leadIds.split(',') };
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Status',
      'Priority',
      'Source',
      'Interest',
      'Budget',
      'Timeline',
      'Assigned To',
      'Created At',
      'Updated At',
      'Notes',
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows  = leads.map((lead: any) => [
      lead.id,
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.status,
      lead.priority,
      lead.source,
      lead.interest || '',
      lead.budget || '',
      lead.timeline || '',
      lead.assignedTo?.user ? `${lead.assignedTo.user.name} (${lead.assignedTo.user.email})` : '',
      new Date(lead.createdAt).toISOString(),
      new Date(lead.updatedAt).toISOString(),
      lead.notes || '',
    ].map(escapeCSV));

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 });
  }
}
