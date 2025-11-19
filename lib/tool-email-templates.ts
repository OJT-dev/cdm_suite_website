// Additional Email Templates for Free Tools

import { getResendClient } from '@/lib/resend-client';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// SEO Checker Email Template
export function generateSEOCheckerEmail(data: any): string {
  const { name, url, keyword, score, issues, recommendations } = data;
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SEO Analysis Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your SEO Analysis</h1>
              <p style="margin: 10px 0 0 0; color: #D1FAE5; font-size: 16px;">${url}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #F8FAFC;">
              <p style="margin: 0 0 15px 0; color: #334155; font-size: 18px;">Hi ${name},</p>
              <p style="margin: 0 0 20px 0; color: #64748B; font-size: 16px;">We analyzed your site for "<strong>${keyword}</strong>"</p>
              <div style="display: inline-block; width: 140px; height: 140px; border-radius: 50%; background: ${scoreColor}; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                <div>
                  <div style="color: #ffffff; font-size: 48px; font-weight: bold; line-height: 1;">${score}</div>
                  <div style="color: #ffffff; font-size: 14px; font-weight: 600;">/100</div>
                </div>
              </div>
              <p style="margin: 0; color: #1E293B; font-size: 20px; font-weight: 600;">SEO Score</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #FEF2F2;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 22px; text-align: center;">⚠️ Critical Issues Holding You Back</h3>
              <ul style="margin: 0; padding-left: 20px; color: #991B1B; font-size: 15px; line-height: 1.8;">
                ${issues.map((issue: string) => `<li style="margin-bottom: 10px;">${issue}</li>`).join('')}
              </ul>
              <p style="margin: 20px 0 0 0; color: #DC2626; font-size: 16px; font-weight: bold; text-align: center;">
                These issues are costing you visitors and customers every single day.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F0FDF4;">
              <p style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-style: italic; text-align: center;">"We went from page 5 to page 1 in 90 days using CDM Suite's SEO strategy. Traffic increased 340%."</p>
              <p style="margin: 0; color: #15803D; font-size: 13px; text-align: center;">— Mike R., SaaS Founder</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 24px;">🎯 Get Professional SEO Help</h3>
              <p style="margin: 0 0 25px 0; color: #D1FAE5; font-size: 16px; line-height: 1.6;">
                Book a <strong>FREE SEO strategy call</strong> and get:<br>
                ✅ Detailed roadmap to rank on page 1 (Value: $750)<br>
                ✅ Competitor analysis report<br>
                ✅ 90-day action plan
              </p>
              <a href="https://cdmsuite.abacusai.app/contact?source=seo-checker&score=${score}" style="display: inline-block; padding: 18px 40px; background-color: #FBBF24; color: #1E293B; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Claim Your Free SEO Strategy →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #EFF6FF; border: 3px solid #3B82F6;">
              <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 24px; text-align: center;">🚀 SEO Service - Utility Pricing</h3>
              <p style="margin: 0 0 20px 0; color: #1E3A8A; font-size: 16px; line-height: 1.6; text-align: center;">
                Get professional SEO optimization with our <strong>no-contract, utility-style pricing</strong>.
              </p>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #10b981;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <p style="margin: 0 0 10px 0; color: #10b981; font-size: 48px; font-weight: bold;">$100<span style="font-size: 20px; color: #64748B;">/month</span></p>
                  <div style="display: inline-block; background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); padding: 10px 20px; border-radius: 25px; margin-bottom: 15px;">
                    <p style="margin: 0; color: #92400E; font-weight: bold;">⚡ Launched in less than 7 days</p>
                  </div>
                  <p style="margin: 0; color: #64748B; font-size: 14px;">Cancel anytime. No setup fees.</p>
                </div>
                <p style="margin: 0 0 15px 0; color: #1E293B; font-size: 18px; font-weight: bold; text-align: center;">What's Included:</p>
                <ul style="margin: 0 0 25px 20px; color: #334155; font-size: 15px; line-height: 1.8;">
                  <li>Complete on-page SEO optimization</li>
                  <li>Keyword research & implementation</li>
                  <li>Content optimization for your key pages</li>
                  <li>Monthly ranking reports & updates</li>
                  <li>Technical SEO fixes</li>
                  <li>Ongoing monthly optimization</li>
                </ul>
                <div style="background-color: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                  <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                    <strong>Choose Your Style:</strong><br>
                    ✅ <strong>Done-For-You:</strong> We handle everything<br>
                    ✅ <strong>Self-Service:</strong> Access our platform + tutorials
                  </p>
                </div>
                <div style="text-align: center;">
                  <a href="https://cdmsuite.abacusai.app/contact?source=seo-checker&service=seo-utility" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Start SEO Service - $100/mo →
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 10px 0; color: #1E293B; font-size: 16px; font-weight: 600;">CDM Suite</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">
                <a href="https://cdmsuite.abacusai.app" style="color: #3B82F6; text-decoration: none;">Visit Our Website</a> | 
                <a href="tel:8622727623" style="color: #3B82F6; text-decoration: none;">(862) 272-7623</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Email Subject Line Tester Template
export function generateEmailTesterEmail(data: any): string {
  const { name, subjectLine, openRatePrediction, recommendations } = data;
  const rateColor = openRatePrediction >= 25 ? '#10b981' : openRatePrediction >= 18 ? '#f59e0b' : '#ef4444';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Email Subject Line Analysis</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Email Analysis</h1>
              <p style="margin: 10px 0 0 0; color: #F5D0FE; font-size: 16px;">Subject Line Performance Report</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #FCE7F3 0%, #F3E8FF 100%);">
              <p style="margin: 0 0 15px 0; color: #334155; font-size: 18px;">Hi ${name},</p>
              <p style="margin: 0 0 20px 0; color: #64748B; font-size: 16px;">We analyzed your subject line:</p>
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
                <p style="margin: 0; color: #1E293B; font-size: 16px; font-style: italic;">"${subjectLine}"</p>
              </div>
              <div style="margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #64748B; font-size: 14px;">Predicted Open Rate</p>
                <p style="margin: 0; font-size: 56px; font-weight: bold; color: ${rateColor}; line-height: 1;">${openRatePrediction}%</p>
                <p style="margin: 10px 0 0 0; color: #64748B; font-size: 14px;">Industry average is 21%</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #FEF2F2;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 22px; text-align: center;">📉 The Truth About Email Marketing</h3>
              <p style="margin: 0 0 15px 0; color: #991B1B; font-size: 16px; line-height: 1.6;">
                The average business loses <strong>$50,000-$100,000 per year</strong> from poor email marketing alone.
              </p>
              <p style="margin: 0 0 15px 0; color: #991B1B; font-size: 16px; line-height: 1.6;">
                Every percentage point increase in open rates = thousands in additional revenue.
              </p>
              <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: bold; text-align: center;">
                Your competitors are getting this right. Are you?
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F0FDF4;">
              <p style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-style: italic; text-align: center;">"CDM Suite's email campaigns consistently get 40%+ open rates and 12% click rates. They're email wizards!"</p>
              <p style="margin: 0; color: #15803D; font-size: 13px; text-align: center;">— Rachel K., E-commerce Brand</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 24px;">🎯 Get Professional Email Marketing</h3>
              <p style="margin: 0 0 25px 0; color: #F5D0FE; font-size: 16px; line-height: 1.6;">
                Book a <strong>FREE email marketing consultation</strong> and get:<br>
                ✅ 50 proven subject line templates (Value: $297)<br>
                ✅ Email sequence audit & recommendations<br>
                ✅ A/B testing strategy blueprint
              </p>
              <a href="https://cdmsuite.abacusai.app/contact?source=email-tester" style="display: inline-block; padding: 18px 40px; background-color: #FBBF24; color: #1E293B; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Claim Your Free Templates →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #EFF6FF; border: 3px solid #3B82F6;">
              <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 24px; text-align: center;">🚀 Email Marketing - Utility Pricing</h3>
              <p style="margin: 0 0 20px 0; color: #1E3A8A; font-size: 16px; line-height: 1.6; text-align: center;">
                Professional email marketing with <strong>no-contract, utility-style pricing</strong>.
              </p>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #8B5CF6;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <p style="margin: 0 0 10px 0; color: #8B5CF6; font-size: 48px; font-weight: bold;">$100<span style="font-size: 20px; color: #64748B;">/month</span></p>
                  <div style="display: inline-block; background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); padding: 10px 20px; border-radius: 25px; margin-bottom: 15px;">
                    <p style="margin: 0; color: #92400E; font-weight: bold;">⚡ First campaign live in less than 7 days</p>
                  </div>
                  <p style="margin: 0; color: #64748B; font-size: 14px;">Cancel anytime. No setup fees.</p>
                </div>
                <p style="margin: 0 0 15px 0; color: #1E293B; font-size: 18px; font-weight: bold; text-align: center;">What's Included:</p>
                <ul style="margin: 0 0 25px 20px; color: #334155; font-size: 15px; line-height: 1.8;">
                  <li>High-converting email sequences (welcome, nurture, re-engagement)</li>
                  <li>Subject line optimization & A/B testing</li>
                  <li>List segmentation & personalization</li>
                  <li>4 campaigns per month + automation setup</li>
                  <li>Monthly analytics & performance reports</li>
                  <li>Template design & copywriting</li>
                </ul>
                <div style="background-color: #F5F3FF; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8B5CF6;">
                  <p style="margin: 0; color: #5B21B6; font-size: 14px; line-height: 1.6;">
                    <strong>Choose Your Style:</strong><br>
                    ✅ <strong>Done-For-You:</strong> We write, design & send everything<br>
                    ✅ <strong>Self-Service:</strong> Access our templates + automation platform
                  </p>
                </div>
                <div style="text-align: center;">
                  <a href="https://cdmsuite.abacusai.app/contact?source=email-tester&service=email-utility" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Start Email Marketing - $100/mo →
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 10px 0; color: #1E293B; font-size: 16px; font-weight: 600;">CDM Suite</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">
                <a href="https://cdmsuite.abacusai.app" style="color: #3B82F6; text-decoration: none;">Visit Our Website</a> | 
                <a href="tel:8622727623" style="color: #3B82F6; text-decoration: none;">(862) 272-7623</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Budget Calculator Email Template
export function generateBudgetCalculatorEmail(data: any): string {
  const { name, annualRevenue, totalBudget, expectedROI, projectedRevenue, channels } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Marketing Budget Plan</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #DC2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Marketing Budget Blueprint</h1>
              <p style="margin: 10px 0 0 0; color: #FED7AA; font-size: 16px;">Strategic Investment Plan</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%);">
              <p style="margin: 0 0 20px 0; color: #78350F; font-size: 18px;">Hi ${name},</p>
              <p style="margin: 0 0 15px 0; color: #92400E; font-size: 16px;">Recommended Annual Budget</p>
              <p style="margin: 0; font-size: 56px; font-weight: bold; color: #DC2626; line-height: 1;">${formatCurrency(totalBudget)}</p>
              <p style="margin: 15px 0 0 0; color: #92400E; font-size: 15px;">Expected ROI: <strong>${expectedROI}%</strong> = ${formatCurrency(projectedRevenue)} in revenue</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #1E293B; font-size: 20px; text-align: center;">Recommended Channel Allocation</h3>
              ${channels.map((channel: any) => `
                <div style="margin-bottom: 15px; padding: 15px; background-color: #F8FAFC; border-radius: 6px; border-left: 4px solid ${channel.color};">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #1E293B; font-weight: 600;">${channel.name}</span>
                    <span style="color: ${channel.color}; font-weight: bold;">${formatCurrency(channel.amount)}</span>
                  </div>
                  <p style="margin: 0; color: #64748B; font-size: 13px;">${channel.percentage}% of budget</p>
                </div>
              `).join('')}
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #FEF2F2;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 22px; text-align: center;">⚠️ Most Businesses Waste 40-60% of Their Marketing Budget</h3>
              <p style="margin: 0 0 15px 0; color: #991B1B; font-size: 16px; line-height: 1.6;">
                They invest in the <strong>wrong channels</strong>, at the <strong>wrong time</strong>, with the <strong>wrong messaging</strong>.
              </p>
              <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: bold; text-align: center;">
                That's throwing away ${formatCurrency(totalBudget * 0.5)} every year!
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 24px;">🎯 Get Expert Budget Planning</h3>
              <p style="margin: 0 0 25px 0; color: #D1FAE5; font-size: 16px; line-height: 1.6;">
                Book a <strong>FREE budget planning session</strong> and get:<br>
                ✅ Month-by-month execution roadmap (Value: $1,000)<br>
                ✅ ROI tracking dashboard setup<br>
                ✅ Channel optimization recommendations
              </p>
              <a href="https://cdmsuite.abacusai.app/contact?source=budget-calculator" style="display: inline-block; padding: 18px 40px; background-color: #FBBF24; color: #1E293B; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Claim Your Free Planning Session →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #EFF6FF; border: 3px solid #3B82F6;">
              <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 24px; text-align: center;">🚀 Marketing Management - Utility Pricing</h3>
              <p style="margin: 0 0 20px 0; color: #1E3A8A; font-size: 16px; line-height: 1.6; text-align: center;">
                Professional marketing with <strong>no-contract, utility-style pricing</strong>.
              </p>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #F59E0B;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <p style="margin: 0 0 10px 0; color: #F59E0B; font-size: 48px; font-weight: bold;">$100<span style="font-size: 20px; color: #64748B;">/month per channel</span></p>
                  <div style="display: inline-block; background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); padding: 10px 20px; border-radius: 25px; margin-bottom: 15px;">
                    <p style="margin: 0; color: #92400E; font-weight: bold;">⚡ First campaigns live in less than 7 days</p>
                  </div>
                  <p style="margin: 0; color: #64748B; font-size: 14px;">Cancel anytime. No setup fees.</p>
                </div>
                <p style="margin: 0 0 15px 0; color: #1E293B; font-size: 18px; font-weight: bold; text-align: center;">Choose Your Channels (mix & match):</p>
                <ul style="margin: 0 0 25px 20px; color: #334155; font-size: 15px; line-height: 1.8;">
                  <li><strong>$100/mo:</strong> Social Media Management (12 posts + analytics)</li>
                  <li><strong>$100/mo:</strong> Ad Campaign Management (Meta, Google, TikTok)</li>
                  <li><strong>$100/mo:</strong> Content Marketing (4 blogs + SEO optimization)</li>
                  <li><strong>$100/mo:</strong> Email Marketing (campaigns + automation)</li>
                </ul>
                <div style="background-color: #FFFBEB; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F59E0B;">
                  <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                    <strong>💰 Bundle Discount:</strong> Add 3+ channels and get 20% off total price<br>
                    <strong>Choose Your Style:</strong><br>
                    ✅ <strong>Done-For-You:</strong> We manage everything<br>
                    ✅ <strong>Self-Service:</strong> Access our tools + training
                  </p>
                </div>
                <div style="text-align: center;">
                  <a href="https://cdmsuite.abacusai.app/contact?source=budget-calculator&service=marketing-utility" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Start Marketing - $100/mo per channel →
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 10px 0; color: #1E293B; font-size: 16px; font-weight: 600;">CDM Suite</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">
                <a href="https://cdmsuite.abacusai.app" style="color: #3B82F6; text-decoration: none;">Visit Our Website</a> | 
                <a href="tel:8622727623" style="color: #3B82F6; text-decoration: none;">(862) 272-7623</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Conversion Analyzer Email Template
export function generateConversionAnalyzerEmail(data: any): string {
  const { name, visitors, overallConversion, potentialRevenue, stages, biggestLeaks } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Funnel Analysis</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Funnel Analysis</h1>
              <p style="margin: 10px 0 0 0; color: #DBEAFE; font-size: 16px;">Where Are You Losing Customers?</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);">
              <p style="margin: 0 0 20px 0; color: #334155; font-size: 18px;">Hi ${name},</p>
              <p style="margin: 0 0 15px 0; color: #64748B; font-size: 16px;">Your Overall Conversion Rate</p>
              <p style="margin: 0; font-size: 56px; font-weight: bold; color: ${overallConversion >= 5 ? '#10b981' : overallConversion >= 2 ? '#f59e0b' : '#ef4444'}; line-height: 1;">${overallConversion.toFixed(2)}%</p>
              <p style="margin: 15px 0 0 0; color: #64748B; font-size: 15px;">Industry average: 2-4%</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #FEF2F2;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 22px; text-align: center;">💰 You're Leaving Money on the Table</h3>
              <p style="margin: 0 0 20px 0; color: #991B1B; font-size: 18px; font-weight: bold; text-align: center;">
                Potential Additional Monthly Revenue: ${formatCurrency(potentialRevenue)}
              </p>
              <p style="margin: 0 0 15px 0; color: #991B1B; font-size: 16px; line-height: 1.6;">
                That's <strong>${formatCurrency(potentialRevenue * 12)}</strong> per year you're losing because of funnel leaks.
              </p>
              <div style="background-color: #FEE2E2; padding: 15px; border-radius: 6px; border-left: 4px solid #DC2626;">
                <p style="margin: 0 0 10px 0; color: #DC2626; font-weight: bold;">Your Biggest Issues:</p>
                <ul style="margin: 0; padding-left: 20px; color: #991B1B; font-size: 14px;">
                  ${biggestLeaks.map((leak: string) => `<li style="margin-bottom: 5px;">${leak}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F0FDF4;">
              <p style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-style: italic; text-align: center;">"We used CDM Suite's CRO strategy and increased conversions by 47% in 60 days. That's an extra $180K per year!"</p>
              <p style="margin: 0; color: #15803D; font-size: 13px; text-align: center;">— Tom H., E-commerce Business</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%); text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 24px;">🎯 Get Professional CRO Help</h3>
              <p style="margin: 0 0 25px 0; color: #DBEAFE; font-size: 16px; line-height: 1.6;">
                Book a <strong>FREE conversion optimization audit</strong> and get:<br>
                ✅ Stage-by-stage optimization plan (Value: $1,200)<br>
                ✅ A/B testing recommendations<br>
                ✅ User behavior heat maps
              </p>
              <a href="https://cdmsuite.abacusai.app/contact?source=conversion-analyzer" style="display: inline-block; padding: 18px 40px; background-color: #FBBF24; color: #1E293B; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Claim Your Free CRO Audit →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; background-color: #EFF6FF; border: 3px solid #3B82F6;">
              <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 24px; text-align: center;">🚀 CRO Service - Utility Pricing</h3>
              <p style="margin: 0 0 20px 0; color: #1E3A8A; font-size: 16px; line-height: 1.6; text-align: center;">
                Conversion optimization with <strong>no-contract, utility-style pricing</strong>.
              </p>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 2px solid #6366F1;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <p style="margin: 0 0 10px 0; color: #6366F1; font-size: 48px; font-weight: bold;">$100<span style="font-size: 20px; color: #64748B;">/month</span></p>
                  <div style="display: inline-block; background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); padding: 10px 20px; border-radius: 25px; margin-bottom: 15px;">
                    <p style="margin: 0; color: #92400E; font-weight: bold;">⚡ First optimizations live in less than 7 days</p>
                  </div>
                  <p style="margin: 0; color: #64748B; font-size: 14px;">Cancel anytime. No setup fees.</p>
                </div>
                <p style="margin: 0 0 15px 0; color: #1E293B; font-size: 18px; font-weight: bold; text-align: center;">What's Included:</p>
                <ul style="margin: 0 0 25px 20px; color: #334155; font-size: 15px; line-height: 1.8;">
                  <li>Landing page optimization (1 page per month)</li>
                  <li>A/B testing setup & analysis (2 tests/month)</li>
                  <li>User behavior tracking & heatmaps</li>
                  <li>Conversion funnel analysis & recommendations</li>
                  <li>Monthly optimization reports with insights</li>
                  <li>Continuous improvements based on data</li>
                </ul>
                <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6366F1;">
                  <p style="margin: 0; color: #1E40AF; font-size: 14px; line-height: 1.6;">
                    <strong>Choose Your Style:</strong><br>
                    ✅ <strong>Done-For-You:</strong> We optimize everything for you<br>
                    ✅ <strong>Self-Service:</strong> Access our CRO platform + training
                  </p>
                </div>
                <div style="text-align: center;">
                  <a href="https://cdmsuite.abacusai.app/contact?source=conversion-analyzer&service=cro-utility" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Start CRO Service - $100/mo →
                  </a>
                  <p style="margin: 15px 0 0 0; color: #64748B; font-size: 12px;">💰 Results-focused or your money back</p>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 10px 0; color: #1E293B; font-size: 16px; font-weight: 600;">CDM Suite</p>
              <p style="margin: 0; color: #64748B; font-size: 14px;">
                <a href="https://cdmsuite.abacusai.app" style="color: #3B82F6; text-decoration: none;">Visit Our Website</a> | 
                <a href="tel:8622727623" style="color: #3B82F6; text-decoration: none;">(862) 272-7623</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}


// Generate follow-up actions based on tool and assessment data
export function generateToolFollowUpActions(source: string, score: number, assessmentData: any): string[] {
  const actions: string[] = [];

  if (source === 'website-need-checker') {
    // Priority actions based on score
    if (score >= 80) {
      actions.push('🔥 URGENT: Schedule discovery call within 24 hours');
      actions.push('📧 Send case study matching their industry');
      actions.push('💰 Prepare custom proposal with pricing options');
    } else if (score >= 60) {
      actions.push('📞 Schedule consultation call within 48 hours');
      actions.push('📧 Send educational content about website benefits');
      actions.push('📊 Share ROI calculator results');
    } else {
      actions.push('📧 Send nurture email sequence (value-focused)');
      actions.push('📚 Share relevant blog posts and resources');
      actions.push('📅 Follow up in 1 week with success stories');
    }

    // Specific actions based on assessment data
    if (assessmentData) {
      if (assessmentData.hasWebsite === 'no') {
        actions.push('🎨 Showcase website templates in their industry');
        actions.push('💡 Highlight quick launch timeline (7 days)');
      }
      
      if (assessmentData.currentLeadGen === 'referrals' || assessmentData.currentLeadGen === 'none') {
        actions.push('📈 Emphasize lead generation capabilities');
        actions.push('🎯 Share lead generation case study');
      }

      if (assessmentData.goals?.includes('more-customers')) {
        actions.push('🚀 Discuss conversion optimization strategies');
        actions.push('💼 Offer free marketing assessment');
      }

      if (assessmentData.competitors === 'most') {
        actions.push('⚡ Emphasize competitive advantage of modern website');
        actions.push('🔍 Offer competitor analysis report');
      }
    }
  }

  // Add other tool-specific actions here
  if (source === 'seo-checker') {
    actions.push('📊 Send detailed SEO audit report');
    actions.push('🎯 Schedule SEO strategy call');
    actions.push('📈 Share SEO case studies and results');
  }

  if (source === 'website-auditor') {
    actions.push('🔧 Send fix recommendations PDF');
    actions.push('💬 Schedule technical review call');
    actions.push('⚡ Offer quick-win improvements list');
  }

  return actions;
}

// Send email notifications to team and lead
export async function sendToolLeadNotifications({
  lead,
  source,
  score,
  assessmentData,
  followUpActions,
  isUpdate,
}: {
  lead: any;
  source: string;
  score: number;
  assessmentData: any;
  followUpActions: string[];
  isUpdate: boolean;
}) {
  try {
    // Send internal notification to team
    const teamEmail = await sendTeamNotification({
      lead,
      source,
      score,
      assessmentData,
      followUpActions,
      isUpdate,
    });

    // Send thank you email to lead
    const leadEmail = await sendLeadThankYouEmail({
      lead,
      source,
      score,
      assessmentData,
    });

    console.log('✅ Email notifications sent:', { teamEmail, leadEmail });
    return { teamEmail, leadEmail };
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    throw error;
  }
}

// Send team notification
async function sendTeamNotification({
  lead,
  source,
  score,
  assessmentData,
  followUpActions,
  isUpdate,
}: {
  lead: any;
  source: string;
  score: number;
  assessmentData: any;
  followUpActions: string[];
  isUpdate: boolean;
}) {
  const priority = score >= 80 ? '🔥 HIGH' : score >= 60 ? '⚡ MEDIUM' : '📋 LOW';
  const action = isUpdate ? 'Updated' : 'New';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${action} Lead: ${lead.name || lead.email}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <h1 style="margin: 0 0 10px 0; color: #1e293b; font-size: 24px;">${priority} ${action} Lead from ${source}</h1>
      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px;">Score: ${score}/100</p>

      <!-- Lead Info -->
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 16px;">Lead Information</h3>
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;"><strong>Name:</strong> ${lead.name || 'Not provided'}</p>
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;"><strong>Email:</strong> ${lead.email || 'Not provided'}</p>
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;"><strong>Phone:</strong> ${lead.phone || 'Not provided'}</p>
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;"><strong>Company:</strong> ${lead.company || 'Not provided'}</p>
        <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Interest:</strong> ${lead.interest || 'Not provided'}</p>
      </div>

      <!-- Assessment Data -->
      ${assessmentData ? `
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">Assessment Results</h3>
        ${formatAssessmentForEmail(assessmentData, source)}
      </div>
      ` : ''}

      <!-- Follow-up Actions -->
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px;">🎯 Recommended Follow-Up Actions</h3>
        <ul style="margin: 0; padding-left: 20px; color: #451a03; font-size: 14px; line-height: 1.6;">
          ${followUpActions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://cdmsuite.com/dashboard/crm" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
          View in CRM →
        </a>
      </div>

    </div>
  </div>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.log('📧 Team Notification (Dev Mode):\n', emailHtml.substring(0, 500));
    return { success: true, mode: 'dev' };
  }

  const result = await resend.emails.send({
    from: 'CDM Suite CRM <leads@cdmsuite.com>',
    to: process.env.TEAM_EMAIL || 'team@cdmsuite.com',
    subject: `${priority} ${action} Lead: ${lead.name || lead.email} (${source})`,
    html: emailHtml,
  });

  return result;
}

// Send thank you email to lead
async function sendLeadThankYouEmail({
  lead,
  source,
  score,
  assessmentData,
}: {
  lead: any;
  source: string;
  score: number;
  assessmentData: any;
}) {
  if (!lead.email) {
    console.log('⚠️  No email provided for lead, skipping thank you email');
    return null;
  }

  const toolNames: { [key: string]: string } = {
    'website-need-checker': 'Website Need Assessment',
    'seo-checker': 'SEO Analysis',
    'website-auditor': 'Website Audit',
    'email-tester': 'Email Subject Line Test',
    'budget-calculator': 'Marketing Budget Calculator',
    'conversion-analyzer': 'Conversion Funnel Analysis',
    'roi-calculator': 'ROI Calculator',
  };

  const toolName = toolNames[source] || source;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your ${toolName} Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <h1 style="margin: 0 0 10px 0; color: #1e293b; font-size: 24px;">Thank you for completing the ${toolName}!</h1>
      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px;">Hi ${lead.name || 'there'},</p>

      <!-- Score -->
      ${score > 0 ? `
      <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Your Score</p>
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: ${score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}; line-height: 1;">${score}</p>
        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">/100</p>
      </div>
      ` : ''}

      <!-- Message -->
      <div style="margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0; color: #475569; font-size: 16px; line-height: 1.6;">
          ${score >= 80 
            ? 'Your results indicate significant opportunities for improvement. Our team will be reaching out within 24 hours to discuss how we can help you achieve your goals.'
            : score >= 60
            ? 'Your results show good potential with room for optimization. We\'d love to discuss strategies that could take you to the next level.'
            : 'Thank you for taking the assessment. We\'ll review your results and be in touch with personalized recommendations.'
          }
        </p>
        <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
          In the meantime, feel free to explore our resources or schedule a free consultation.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://cdmsuite.com/contact?source=${source}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 0 10px 10px 0;">
          Schedule Free Consultation
        </a>
        <a href="https://cdmsuite.com/services" style="display: inline-block; padding: 14px 28px; background-color: #64748b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">
          View Our Services
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Questions? We're here to help!</p>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          <a href="tel:8622727623" style="color: #3b82f6; text-decoration: none;">(862) 272-7623</a> | 
          <a href="mailto:team@cdmsuite.com" style="color: #3b82f6; text-decoration: none;">team@cdmsuite.com</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.log('📧 Lead Thank You Email (Dev Mode):\n', emailHtml.substring(0, 500));
    return { success: true, mode: 'dev' };
  }

  const result = await resend.emails.send({
    from: 'CDM Suite <hello@cdmsuite.com>',
    to: lead.email,
    subject: `Your ${toolName} Results - CDM Suite`,
    html: emailHtml,
  });

  return result;
}

// Helper to format assessment data for email
function formatAssessmentForEmail(data: any, source: string): string {
  if (source === 'website-need-checker') {
    const valueLabels: { [key: string]: { [key: string]: string } } = {
      hasWebsite: {
        no: '❌ No website',
        yes: '⚠️ Outdated website',
        modern: '✅ Modern website',
      },
      industry: {
        'retail': 'Retail / E-commerce',
        'professional-services': 'Professional Services',
        'restaurant': 'Restaurant / Food Service',
        'health': 'Healthcare / Wellness',
        'construction': 'Construction / Home Services',
        'other': 'Other',
      },
      businessAge: {
        'startup': 'Less than 1 year',
        '1-3': '1-3 years',
        '3-5': '3-5 years',
        '5+': '5+ years',
      },
      customerType: {
        'b2c': 'Business to Consumer (B2C)',
        'b2b': 'Business to Business (B2B)',
        'both': 'Both B2C and B2B',
      },
      currentLeadGen: {
        'referrals': 'Referrals only',
        'social': 'Social Media',
        'ads': 'Paid Advertising',
        'seo': 'SEO / Organic',
        'none': 'No active lead generation',
      },
      monthlyRevenue: {
        '0-1k': '$0 - $1,000',
        '1k-5k': '$1,000 - $5,000',
        '5k-10k': '$5,000 - $10,000',
        '10k+': '$10,000+',
      },
      competitors: {
        'none': 'No direct competitors',
        'some': 'Some competitors',
        'most': 'Highly competitive market',
      },
    };

    let formatted = '';
    const fields = [
      { key: 'hasWebsite', label: 'Current Website' },
      { key: 'industry', label: 'Industry' },
      { key: 'businessAge', label: 'Business Age' },
      { key: 'customerType', label: 'Customer Type' },
      { key: 'currentLeadGen', label: 'Lead Generation' },
      { key: 'monthlyRevenue', label: 'Monthly Revenue' },
      { key: 'competitors', label: 'Competition' },
    ];

    fields.forEach(field => {
      if (data[field.key]) {
        const value = valueLabels[field.key]?.[data[field.key]] || data[field.key];
        formatted += `<p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;"><strong>${field.label}:</strong> ${value}</p>`;
      }
    });

    if (data.goals && Array.isArray(data.goals)) {
      formatted += `<p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>Goals:</strong> ${data.goals.join(', ')}</p>`;
    }

    return formatted;
  }

  // Default formatting
  return `<p style="margin: 0; color: #1e40af; font-size: 14px;">${JSON.stringify(data, null, 2)}</p>`;
}
