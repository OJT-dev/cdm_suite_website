
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/proposals/[id]/pdf - Generate and download PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const items = JSON.parse(proposal.items);

    // Generate HTML for PDF
    const html = generateProposalHTML(proposal, items);

    // Use Puppeteer or a PDF generation service here
    // For now, we'll return the HTML that can be converted to PDF on the client
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="proposal-${proposal.proposalNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generateProposalHTML(proposal: any, items: any[]): string {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal ${proposal.proposalNumber}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .company-name {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .tagline {
      color: #64748b;
      font-size: 14px;
    }
    .proposal-title {
      font-size: 28px;
      font-weight: bold;
      margin: 30px 0 10px 0;
    }
    .proposal-number {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 15px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .info-value {
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f1f5f9;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .item-description {
      font-size: 13px;
      color: #64748b;
      margin-top: 5px;
      white-space: pre-line;
    }
    .totals {
      margin-top: 30px;
      border-top: 2px solid #cbd5e1;
      padding-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-label {
      font-weight: 600;
    }
    .grand-total {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      border-top: 3px solid #2563eb;
      padding-top: 15px;
      margin-top: 15px;
    }
    .terms {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .terms-content {
      font-size: 13px;
      line-height: 1.8;
      white-space: pre-line;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">CDM Suite</div>
    <div class="tagline">Full Service Digital Marketing Agency</div>
  </div>

  <div class="proposal-title">${proposal.title}</div>
  <div class="proposal-number">Proposal #${proposal.proposalNumber}</div>

  ${proposal.description ? `
    <div class="section">
      <div class="section-title">Overview</div>
      <p>${proposal.description}</p>
    </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Client Information</div>
    <div class="info-grid">
      <div>
        <div class="info-item">
          <div class="info-label">Client Name</div>
          <div class="info-value">${proposal.clientName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${proposal.clientEmail}</div>
        </div>
      </div>
      <div>
        ${proposal.clientPhone ? `
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${proposal.clientPhone}</div>
          </div>
        ` : ''}
        ${proposal.clientCompany ? `
          <div class="info-item">
            <div class="info-label">Company</div>
            <div class="info-value">${proposal.clientCompany}</div>
          </div>
        ` : ''}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Proposal Details</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Created Date</div>
        <div class="info-value">${formatDate(proposal.createdAt)}</div>
      </div>
      ${proposal.validUntil ? `
        <div class="info-item">
          <div class="info-label">Valid Until</div>
          <div class="info-value">${formatDate(proposal.validUntil)}</div>
        </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Services & Pricing</div>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th style="text-align: center">Qty</th>
          <th style="text-align: right">Unit Price</th>
          <th style="text-align: right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>
              <div><strong>${item.name}</strong></div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            </td>
            <td style="text-align: center">${item.quantity}</td>
            <td style="text-align: right">$${item.unitPrice.toFixed(2)}</td>
            <td style="text-align: right"><strong>$${item.total.toFixed(2)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span class="total-label">Subtotal:</span>
        <span>$${proposal.subtotal.toFixed(2)}</span>
      </div>
      ${proposal.discount > 0 ? `
        <div class="total-row" style="color: #16a34a;">
          <span class="total-label">Discount:</span>
          <span>-$${proposal.discount.toFixed(2)}</span>
        </div>
      ` : ''}
      ${proposal.tax > 0 ? `
        <div class="total-row">
          <span class="total-label">Tax:</span>
          <span>$${proposal.tax.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>$${proposal.total.toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${proposal.terms ? `
    <div class="section">
      <div class="section-title">Terms & Conditions</div>
      <div class="terms">
        <div class="terms-content">${proposal.terms}</div>
      </div>
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>CDM Suite</strong> | Full Service Digital Marketing Agency</p>
    <p>Phone: (862) 272-7623 | Email: info@cdmsuite.com</p>
    <p>Thank you for your business!</p>
  </div>
</body>
</html>
  `.trim();
}
