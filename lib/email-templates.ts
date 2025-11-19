
// Email templates for audit results and sales

interface AuditEmailData {
  name: string;
  websiteUrl: string;
  overallScore: number;
  seoScore: number;
  performanceScore: number;
  mobileScore: number;
  securityScore: number;
  criticalIssues: string[];
  recommendations: any[];
  suggestedServices: any[];
}

export function generateAuditResultEmail(data: AuditEmailData): string {
  const { name, websiteUrl, overallScore, seoScore, performanceScore, mobileScore, securityScore, criticalIssues, recommendations, suggestedServices } = data;
  
  const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444';
  const urgencyLevel = overallScore < 60 ? 'CRITICAL' : overallScore < 75 ? 'IMPORTANT' : 'GOOD';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Website Audit Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #001F3F 0%, #003A70 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Website Audit Results</h1>
              <p style="margin: 10px 0 0 0; color: #93C5FD; font-size: 16px;">${websiteUrl}</p>
            </td>
          </tr>

          <!-- Overall Score -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #F8FAFC;">
              <div style="display: inline-block; width: 140px; height: 140px; border-radius: 50%; background: ${scoreColor}; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                <div>
                  <div style="color: #ffffff; font-size: 48px; font-weight: bold; line-height: 1;">${overallScore}</div>
                  <div style="color: #ffffff; font-size: 14px; font-weight: 600;">/100</div>
                </div>
              </div>
              <h2 style="margin: 0 0 10px 0; color: #1E293B; font-size: 24px;">Overall Health Score</h2>
              <p style="margin: 0; color: #64748B; font-size: 18px; font-weight: 600;">${urgencyLevel} - Action ${overallScore < 75 ? 'Required' : 'Recommended'}</p>
            </td>
          </tr>

          <!-- Detailed Scores -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #1E293B; font-size: 20px; text-align: center;">Detailed Analysis</h3>
              
              ${generateScoreBar('SEO Optimization', seoScore)}
              ${generateScoreBar('Performance', performanceScore)}
              ${generateScoreBar('Mobile Experience', mobileScore)}
              ${generateScoreBar('Security', securityScore)}
            </td>
          </tr>

          <!-- Critical Issues -->
          ${criticalIssues.length > 0 ? `
          <tr>
            <td style="padding: 30px; background-color: #FEF2F2;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 18px;">⚠️ Critical Issues Found</h3>
              ${criticalIssues.map(issue => `
                <div style="margin-bottom: 10px; padding: 12px; background-color: #ffffff; border-left: 4px solid #DC2626; border-radius: 4px;">
                  <p style="margin: 0; color: #1E293B; font-size: 14px;">${issue}</p>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- The Hook - What This Means for Your Business -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);">
              <h3 style="margin: 0 0 15px 0; color: #92400E; font-size: 22px; text-align: center;">💰 What This Means for Your Business</h3>
              <p style="margin: 0 0 15px 0; color: #451A03; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 15px 0; color: #451A03; font-size: 16px; line-height: 1.6;">
                ${overallScore < 60 
                  ? `Your website is currently <strong>losing you money</strong>. With a score of ${overallScore}/100, you're likely losing 60-80% of potential customers before they even contact you.`
                  : overallScore < 75
                  ? `Your website has solid foundations, but there are <strong>hidden opportunities</strong> being missed. Small improvements could increase your leads by 40-60%.`
                  : `Your website performs well, but even <strong>small optimizations</strong> at this level can translate to significant revenue increases.`
                }
              </p>
              <p style="margin: 0; color: #451A03; font-size: 16px; line-height: 1.6;">
                <strong>The good news?</strong> Every issue we found is fixable, and we've helped hundreds of businesses just like yours turn these problems into profit.
              </p>
            </td>
          </tr>

          <!-- Social Proof -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #F8FAFC;">
              <p style="margin: 0 0 10px 0; color: #64748B; font-size: 14px; font-style: italic;">"We increased our leads by 347% in just 90 days after CDM Suite fixed our website issues."</p>
              <p style="margin: 0; color: #94A3B8; font-size: 12px;">— Sarah Johnson, TechStart Solutions</p>
            </td>
          </tr>

          <!-- Main CTA - Limited Time Offer -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 24px;">🎯 Limited Time: Free Strategy Session</h3>
              <p style="margin: 0 0 25px 0; color: #D1FAE5; font-size: 16px; line-height: 1.6;">
                Book a <strong>FREE 30-minute strategy call</strong> in the next 48 hours and receive:<br>
                ✅ Personalized action plan (Value: $500)<br>
                ✅ Priority implementation timeline<br>
                ✅ ROI projections for your specific website
              </p>
              <a href="https://cdmsuite.abacusai.app/contact?source=audit&score=${overallScore}" style="display: inline-block; padding: 18px 40px; background-color: #FBBF24; color: #1E293B; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Claim Your Free Strategy Session →
              </a>
              <p style="margin: 15px 0 0 0; color: #D1FAE5; font-size: 13px;">⏰ Only 3 spots left this week</p>
            </td>
          </tr>

          <!-- Recommended Services -->
          ${suggestedServices.length > 0 ? `
          <tr>
            <td style="padding: 40px 30px;">
              <h3 style="margin: 0 0 25px 0; color: #1E293B; font-size: 22px; text-align: center;">Recommended Solutions for ${websiteUrl}</h3>
              
              ${suggestedServices.map((service, index) => `
                <div style="margin-bottom: 20px; padding: 20px; border: 2px solid ${index === 0 ? '#10B981' : '#E2E8F0'}; border-radius: 8px; ${index === 0 ? 'background-color: #ECFDF5;' : ''}">
                  ${index === 0 ? '<div style="display: inline-block; background-color: #10B981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px;">MOST POPULAR</div>' : ''}
                  <h4 style="margin: 0 0 10px 0; color: #1E293B; font-size: 18px;">${service.name}</h4>
                  <p style="margin: 0 0 15px 0; color: #64748B; font-size: 14px; line-height: 1.5;">${service.reason}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #059669; font-size: 20px; font-weight: bold;">${service.price}</span>
                    <a href="https://cdmsuite.abacusai.app/services/${service.slug}?ref=audit" style="padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">Learn More →</a>
                  </div>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- Urgency & Scarcity -->
          <tr>
            <td style="padding: 30px; background-color: #FEF2F2; text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 20px;">⚡ Don't Wait - Every Day Costs You Money</h3>
              <p style="margin: 0 0 20px 0; color: #991B1B; font-size: 15px; line-height: 1.6;">
                ${overallScore < 60 
                  ? 'Your competitors are capturing the customers you\'re losing. The longer you wait, the more market share they gain.'
                  : 'Your competitors are constantly improving. Staying ahead means taking action today, not tomorrow.'
                }
              </p>
              <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: bold;">
                📞 Call us now: <a href="tel:8622727623" style="color: #DC2626; text-decoration: none;">(862) 272-7623</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 10px 0; color: #1E293B; font-size: 16px; font-weight: 600;">CDM Suite</p>
              <p style="margin: 0 0 5px 0; color: #64748B; font-size: 14px;">Helping businesses grow since 2010</p>
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

function generateScoreBar(label: string, score: number): string {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const width = Math.max(score, 5); // Minimum 5% width for visibility
  
  return `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #1E293B; font-size: 14px; font-weight: 600;">${label}</span>
        <span style="color: ${color}; font-size: 14px; font-weight: bold;">${score}/100</span>
      </div>
      <div style="width: 100%; height: 12px; background-color: #E2E8F0; border-radius: 6px; overflow: hidden;">
        <div style="width: ${width}%; height: 100%; background-color: ${color}; border-radius: 6px; transition: width 0.3s ease;"></div>
      </div>
    </div>
  `;
}

export function generateLeadNotificationEmail(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead from Website Audit</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #1E293B; margin-bottom: 20px;">🎯 New Lead: Website Audit</h2>
    
    <div style="background-color: #F8FAFC; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
      <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name || 'Not provided'}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p style="margin: 5px 0;"><strong>Company:</strong> ${data.company || 'Not provided'}</p>
      <p style="margin: 5px 0;"><strong>Website:</strong> ${data.websiteUrl}</p>
      <p style="margin: 5px 0;"><strong>Overall Score:</strong> <span style="color: ${data.score >= 75 ? '#10b981' : data.score >= 60 ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${data.score}/100</span></p>
    </div>

    <div style="background-color: ${data.score < 60 ? '#FEE2E2' : data.score < 75 ? '#FEF3C7' : '#D1FAE5'}; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; color: #1E293B;">
        ${data.score < 60 ? '🔥 HIGH PRIORITY - Critical issues found' : data.score < 75 ? '⚡ GOOD OPPORTUNITY - Multiple improvement areas' : '✅ QUALITY LEAD - Website performing well, upsell potential'}
      </p>
    </div>

    ${data.goals && data.goals.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <p style="font-weight: bold; margin-bottom: 10px;">Goals:</p>
      <ul style="margin: 0; padding-left: 20px;">
        ${data.goals.map((goal: string) => `<li>${goal}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
      <p style="margin: 0; color: #64748B; font-size: 14px;">
        <strong>Action Required:</strong> Follow up within 1 hour for best conversion rates.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ROI Calculator Email Template
export function generateROICalculatorEmail(data: any): string {
  const { name, monthlyVisitors, conversionRate, averageOrderValue, yearlyAdditionalRevenue, additionalRevenue } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ROI Projection</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #1E293B; font-size: 28px; font-weight: bold;">Your Revenue Potential</h1>
              <p style="margin: 10px 0 0 0; color: #422006; font-size: 16px;">Based on Conservative Industry Estimates</p>
            </td>
          </tr>

          <!-- Big Number -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);">
              <p style="margin: 0 0 10px 0; color: #78350F; font-size: 18px; font-weight: 600;">Hi ${name},</p>
              <p style="margin: 0 0 20px 0; color: #92400E; font-size: 16px;">You Could Generate An Additional</p>
              <div style="margin: 20px 0;">
                <p style="margin: 0; font-size: 56px; font-weight: bold; color: #059669; line-height: 1;">${formatCurrency(yearlyAdditionalRevenue)}</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 600; color: #065F46;">Per Year</p>
              </div>
              <p style="margin: 20px 0 0 0; color: #92400E; font-size: 15px;">That's ${formatCurrency(additionalRevenue)} extra per month!</p>
            </td>
          </tr>

          <!-- Your Current Metrics -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #1E293B; font-size: 20px; text-align: center;">Your Current Metrics</h3>
              <table width="100%" cellpadding="10">
                <tr>
                  <td style="padding: 15px; background-color: #F8FAFC; border-radius: 6px; text-align: center;">
                    <p style="margin: 0 0 5px 0; color: #64748B; font-size: 14px;">Monthly Visitors</p>
                    <p style="margin: 0; color: #1E293B; font-size: 24px; font-weight: bold;">${formatNumber(monthlyVisitors)}</p>
                  </td>
                  <td style="padding: 15px; background-color: #F8FAFC; border-radius: 6px; text-align: center;">
                    <p style="margin: 0 0 5px 0; color: #64748B; font-size: 14px;">Conversion Rate</p>
                    <p style="margin: 0; color: #1E293B; font-size: 24px; font-weight: bold;">${conversionRate}%</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 15px; background-color: #F8FAFC; border-radius: 6px; text-align: center;">
                    <p style="margin: 0 0 5px 0; color: #64748B; font-size: 14px;">Average Order Value</p>
                    <p style="margin: 0; color: #1E293B; font-size: 24px; font-weight: bold;">${formatCurrency(averageOrderValue)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- The Hook -->
          <tr>
            <td style="padding: 40px 30px; background-color: #FEF2F2;">
              <h3 style="margin: 0 0 15px 0; color: #DC2626; font-size: 22px; text-align: center;">⚡ But Here's the Problem...</h3>
              <p style="margin: 0 0 15px 0; color: #991B1B; font-size: 16px; line-height: 1.6;">
                Right now, you're leaving <strong>${formatCurrency(yearlyAdditionalRevenue)}</strong> on the table every single year.
              </p>
              <p style="margin: 0 0 15px 0; color: #991B1B; font-size: 16px; line-height: 1.6;">
                While your competitors are capturing these customers, you're losing them to:
              </p>
              <ul style="margin: 0 0 15px 20px; color: #991B1B; font-size: 15px; line-height: 1.8;">
                <li>Poor website design that doesn't convert</li>
                <li>Weak SEO that keeps you invisible on Google</li>
                <li>No follow-up system to nurture leads</li>
                <li>Missing trust signals and social proof</li>
              </ul>
              <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: bold;">
                Every day you wait costs you ${formatCurrency(additionalRevenue / 30)}.
              </p>
            </td>
          </tr>

          <!-- Social Proof -->
          <tr>
            <td style="padding: 30px; background-color: #F0FDF4;">
              <p style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-style: italic; text-align: center;">"We used CDM Suite's strategy and increased our monthly revenue by $94K in just 4 months. The calculator was actually conservative!"</p>
              <p style="margin: 0; color: #15803D; font-size: 13px; text-align: center;">— Jennifer L., Service Business Owner</p>
            </td>
          </tr>

          <!-- Main CTA -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 24px;">🎯 Let's Turn This Into Reality</h3>
              <p style="margin: 0 0 25px 0; color: #D1FAE5; font-size: 16px; line-height: 1.6;">
                Book a <strong>FREE 30-minute strategy call</strong> this week and get:<br>
                ✅ Custom action plan to reach your revenue goals (Value: $500)<br>
                ✅ ROI projections specific to your business<br>
                ✅ Priority implementation timeline
              </p>
              <a href="https://cdmsuite.abacusai.app/contact?source=roi-calculator" style="display: inline-block; padding: 18px 40px; background-color: #FBBF24; color: #1E293B; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Claim Your Free Strategy Session →
              </a>
              <p style="margin: 15px 0 0 0; color: #D1FAE5; font-size: 13px;">⏰ Limited spots available - First come, first served</p>
            </td>
          </tr>

          <!-- Tripwire Offer -->
          <tr>
            <td style="padding: 40px 30px; background-color: #EFF6FF; border: 3px solid #3B82F6;">
              <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 22px; text-align: center;">🚀 Want Results FASTER?</h3>
              <p style="margin: 0 0 20px 0; color: #1E3A8A; font-size: 16px; line-height: 1.6; text-align: center;">
                Get our <strong>"Quick Win Marketing Package"</strong> - specifically designed to help businesses like yours start generating additional revenue within 30 days.
              </p>
              <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; color: #1E293B; font-size: 18px; font-weight: bold;">Includes:</p>
                <ul style="margin: 0 0 20px 20px; color: #334155; font-size: 15px; line-height: 1.8;">
                  <li>Conversion-optimized landing page</li>
                  <li>30-day email nurture sequence</li>
                  <li>Google Ads setup ($500 ad credit included)</li>
                  <li>Weekly performance reports</li>
                </ul>
                <div style="text-align: center;">
                  <p style="margin: 0 0 10px 0;"><span style="color: #94A3B8; font-size: 16px; text-decoration: line-through;">Regular Price: $2,997</span></p>
                  <p style="margin: 0 0 20px 0; color: #059669; font-size: 36px; font-weight: bold;">Today Only: $997</p>
                  <a href="https://cdmsuite.abacusai.app/services/quick-win?source=roi-calculator" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 17px; font-weight: bold;">
                    Get Started Now →
                  </a>
                  <p style="margin: 15px 0 0 0; color: #64748B; font-size: 12px;">💰 30-day money-back guarantee • ⚡ Setup starts immediately</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Urgency -->
          <tr>
            <td style="padding: 20px 30px; background-color: #FEF2F2; text-align: center; border-top: 2px solid #DC2626;">
              <p style="margin: 0; color: #991B1B; font-size: 14px; font-weight: bold;">
                ⏰ Time is money. Every week you delay costs you ${formatCurrency((additionalRevenue * 12) / 52)}.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 10px 0; color: #1E293B; font-size: 16px; font-weight: 600;">CDM Suite</p>
              <p style="margin: 0 0 5px 0; color: #64748B; font-size: 14px;">Helping businesses grow since 2010</p>
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
