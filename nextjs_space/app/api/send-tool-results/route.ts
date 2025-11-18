
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// This API handles sending tool results via email and capturing leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, toolName, toolData, results } = body;

    if (!email || !name || !toolName) {
      return NextResponse.json(
        { error: 'Email, name, and tool name are required' },
        { status: 400 }
      );
    }

    // Save lead to CRM
    try {
      await prisma.lead.create({
        data: {
          email,
          name,
          phone: phone || null, // Phone is optional
          source: toolName,
          status: 'NEW',
          tags: [toolName.toLowerCase().replace(/\s+/g, '-'), 'free-tool-user'],
          notes: JSON.stringify({ toolData, results }),
        },
      });
    } catch (error) {
      console.error('Error saving lead:', error);
      // Continue even if lead save fails - we still want to send results
    }

    // Get tripwire offer
    const tripwireOffer = getTripwireOffer(toolName);
    
    // Generate email content using new HTML template
    try {
      const { sendEmail, getToolResultsEmail } = await import('@/lib/email');
      const emailContent = getToolResultsEmail(toolName, name, email, results, tripwireOffer);
      
      await sendEmail({
        to: email,
        subject: `🎯 Your ${toolName} Results Are Ready!`,
        html: emailContent,
      });
      
      console.log('✅ Email sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Continue even if email fails - don't block the response
    }

    // Return success with tripwire offer
    return NextResponse.json({
      success: true,
      message: 'Results sent to your email!',
      tripwireOffer,
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending tool results:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Removed old generateToolResultEmail function - now using getToolResultsEmail from lib/email.ts

function generateToolResultEmailOLD(toolName: string, name: string, results: any): string {
  const templates: { [key: string]: (name: string, results: any) => string } = {
    'SEO Checker': (name, results) => `
Hi ${name},

Here are your SEO analysis results:

🎯 SEO SCORE: ${results.score}/100

${results.score < 70 ? '⚠️ Your website needs immediate attention!' : results.score < 85 ? '✅ Good start, but there\'s room for improvement!' : '🎉 Excellent! You\'re doing great!'}

📊 DETAILED BREAKDOWN:
• Title Tag: ${results.titleTag.optimized ? '✅ Optimized' : '❌ Needs improvement'}
• Meta Description: ${results.metaDescription.optimized ? '✅ Optimized' : '❌ Needs improvement'}  
• Headings: ${results.headings.optimized ? '✅ Well structured' : '❌ Needs work'}
• Keyword Density: ${results.keywords.density}% (${results.keywords.distribution})

🚨 CRITICAL ISSUES FOUND:
${results.issues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}

💡 TOP RECOMMENDATIONS:
${results.recommendations.slice(0, 3).map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

---

🎁 SPECIAL OFFER - ACT NOW!

Your competitors are ranking higher because they're doing these fixes right now. Don't let them steal your customers!

For the next 48 hours only, get our SEO STARTER PACKAGE for just $197 (normally $497):

✅ Complete technical SEO audit
✅ On-page optimization for 5 pages
✅ Keyword research & strategy
✅ 30 days of ranking monitoring
✅ BONUS: Google My Business optimization ($97 value FREE!)

This offer expires in 48 hours. Your competitors won't wait - will you?

👉 Claim Your Discount: https://cdmsuite.abacusai.app/services/seo?offer=seo-starter

Questions? Reply to this email or call us at (555) 123-4567.

To your success,
The CDM Suite Team

P.S. - We guarantee you'll see measurable improvements in 30 days or your money back. Zero risk, all reward.
    `,

    'Website Auditor': (name, results) => `
Hi ${name},

Your complete website audit is ready!

🎯 OVERALL SCORE: ${results.overallScore}/100

${results.overallScore < 70 ? '⚠️ Your website is costing you customers right now!' : results.overallScore < 85 ? '✅ You\'re on the right track!' : '🎉 Impressive website!'}

📊 CATEGORY SCORES:
• SEO: ${results.seoScore}/100 ${results.seoScore < 70 ? '❌' : results.seoScore < 85 ? '⚠️' : '✅'}
• Performance: ${results.performanceScore}/100 ${results.performanceScore < 70 ? '❌' : results.performanceScore < 85 ? '⚠️' : '✅'}
• Mobile: ${results.mobileScore}/100 ${results.mobileScore < 70 ? '❌' : results.mobileScore < 85 ? '⚠️' : '✅'}
• Security: ${results.securityScore}/100 ${results.securityScore < 70 ? '❌' : results.securityScore < 85 ? '⚠️' : '✅'}

🚨 URGENT ISSUES (${results.issues.length}):
${results.issues.slice(0, 5).map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}

💡 QUICK WINS:
${results.recommendations.slice(0, 3).map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

---

🎁 LIMITED TIME OFFER!

Here's the harsh truth: Every day your website underperforms, you're losing money to competitors with better sites.

But I have good news...

For the next 48 hours, get our WEBSITE TRANSFORMATION PACKAGE for only $297 (normally $997):

✅ Fix all critical issues found in your audit
✅ Mobile optimization & speed boost
✅ Security hardening & SSL setup
✅ SEO foundation optimization
✅ BONUS: 1 month of free maintenance ($297 value!)

We'll fix everything and have your site performing 300% better within 2 weeks - GUARANTEED.

👉 Transform Your Website Now: https://cdmsuite.abacusai.app/services/web-design?offer=transformation

This offer expires in 48 hours. After that, it's back to full price.

Ready to stop losing customers?

The CDM Suite Team

P.S. - Past clients who acted fast saw an average 187% increase in conversions within 60 days. What could that mean for your business?
    `,

    'ROI Calculator': (name, results) => `
Hi ${name},

Your ROI projection is ready - and you might want to sit down for this...

💰 POTENTIAL MONTHLY REVENUE: $${results.projectedRevenue.toLocaleString()}/mo
📈 ESTIMATED ROI: ${results.roi}%
🎯 MONTHLY INVESTMENT: $${results.investment.toLocaleString()}

Based on your inputs:
• Monthly traffic: ${results.traffic.toLocaleString()} visitors
• Current conversion rate: ${results.conversionRate}%
• Average sale: $${results.avgSale}

HERE'S WHAT WE FOUND:

${results.projectedRevenue > results.currentRevenue * 2 ? 
  '🚀 You\'re leaving MASSIVE money on the table! With proper marketing, you could DOUBLE your revenue.' :
  '💡 There\'s significant untapped potential in your marketing.'
}

📊 BREAKDOWN:
Current performance: $${results.currentRevenue.toLocaleString()}/mo
With optimization: $${results.projectedRevenue.toLocaleString()}/mo
Potential gain: +$${(results.projectedRevenue - results.currentRevenue).toLocaleString()}/mo

That's an extra $${((results.projectedRevenue - results.currentRevenue) * 12).toLocaleString()} per year!

---

🎁 EXCLUSIVE OFFER - 48 HOURS ONLY!

Want to turn these projections into reality?

Get our GROWTH ACCELERATOR PACKAGE for just $497 (normally $1,497):

✅ Custom marketing strategy blueprint
✅ Conversion rate optimization audit
✅ 30-day campaign management
✅ A/B testing setup & analysis
✅ BONUS: Free landing page design ($497 value!)

We'll implement the exact strategies that generated these projections for you.

👉 Start Growing Today: https://cdmsuite.abacusai.app/pricing?offer=growth-accelerator

Here's our promise: We're committed to increasing your revenue by at least 50% within 90 days, and we'll continue working with you until we achieve these results.

You literally can't lose.

Ready to claim your growth?

The CDM Suite Team

P.S. - The difference between businesses that grow and those that stagnate? Taking action. Which will you choose?
    `,

    'Budget Calculator': (name, results) => `
Hi ${name},

Your marketing budget analysis is complete!

💰 RECOMMENDED BUDGET: $${results.recommendedBudget.toLocaleString()}/mo
📊 EXPECTED RETURN: $${results.expectedReturn.toLocaleString()}/mo
🎯 ROI PROJECTION: ${results.expectedROI}%

BUDGET BREAKDOWN:
${Object.entries(results.breakdown).map(([channel, amount]: [string, any]) => 
  `• ${channel}: $${amount.toLocaleString()}/mo`
).join('\n')}

WHY THIS MATTERS:

Most businesses either:
1. Underspend and get zero results
2. Overspend without strategy and waste money

Your budget hits the sweet spot for maximum ROI.

---

🎁 SPECIAL LAUNCH OFFER!

Here's a crazy idea: What if we managed your entire marketing budget for you AND guaranteed results?

FULL-SERVICE MARKETING PACKAGE - $997/mo (50% OFF for first 3 months):

✅ Complete campaign management
✅ All channels optimized (SEO, PPC, Social, Email)
✅ Monthly strategy sessions
✅ Dedicated account manager
✅ Real-time analytics dashboard
✅ BONUS: Free setup & onboarding ($1,500 value!)

We'll handle everything while you focus on running your business.

👉 Get Started Today: https://cdmsuite.abacusai.app/pricing?offer=full-service

Our commitment: We'll work with you until you're seeing measurable results and achieving your goals.

The CDM Suite Team

P.S. - Imagine having a full marketing team for less than one junior marketer's salary. That's what we're offering.
    `,

    'Email Tester': (name, results) => `
Hi ${name},

Your email subject line analysis:

📧 SUBJECT LINE: "${results.subjectLine}"

🎯 PREDICTED OPEN RATE: ${results.predictedOpenRate}%
${results.predictedOpenRate < 20 ? '❌ This needs work!' : results.predictedOpenRate < 30 ? '⚠️ Average' : '✅ Strong!'}

ANALYSIS:
• Spam Score: ${results.spamScore}/10 ${results.spamScore > 5 ? '⚠️ High risk' : '✅ Safe'}
• Character Count: ${results.characterCount} ${results.characterCount > 60 ? '(too long)' : '(good)'}
• Power Words: ${results.powerWords.length} found
• Personalization: ${results.personalization ? '✅ Yes' : '❌ No'}

💡 IMPROVEMENTS:
${results.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

---

🎁 LIMITED OFFER - EMAIL MARKETING PACKAGE!

Want to 10X your email marketing results?

EMAIL DOMINATION PACKAGE - $397 (normally $997):

✅ Custom email template design
✅ 10 high-converting subject lines written for you
✅ Email sequence strategy (5-7 emails)
✅ Spam test & deliverability optimization
✅ A/B testing setup
✅ BONUS: 1 month of SendGrid ($79 value FREE!)

We'll write, design, and optimize your entire email campaign.

👉 Get More Opens & Clicks: https://cdmsuite.abacusai.app/pricing?offer=email-domination

Expires in 48 hours!

The CDM Suite Team

P.S. - Our clients average 45% open rates and 8% click rates. Industry average? 20% opens, 2% clicks. Want to join the winners?
    `,

    'Conversion Analyzer': (name, results) => `
Hi ${name},

Your conversion analysis results:

📊 CURRENT CONVERSION RATE: ${results.currentRate}%
🎯 POTENTIAL RATE: ${results.potentialRate}%
💰 REVENUE IMPACT: +$${results.revenueIncrease.toLocaleString()}/mo

FINDINGS:
${results.findings.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

QUICK WINS:
${results.quickWins.map((w: string, i: number) => `${i + 1}. ${w}`).join('\n')}

---

🎁 CONVERSION OPTIMIZATION OFFER!

Triple your conversion rate in 30 days - GUARANTEED.

CRO INTENSIVE PACKAGE - $697 (normally $1,997):

✅ Complete funnel analysis
✅ Landing page redesign (3 variations)
✅ A/B testing setup & management
✅ Heatmap & user behavior analysis  
✅ Copy optimization
✅ BONUS: Follow-up optimization ($497 value!)

We're committed to at least doubling your conversion rate and will work with you until we achieve these results.

👉 Start Converting More: https://cdmsuite.abacusai.app/pricing?offer=cro-intensive

48-hour expiration on this offer!

The CDM Suite Team

P.S. - Every 1% increase in conversion rate = thousands in additional revenue. How much are you leaving on the table?
    `,
  };

  const template = templates[toolName];
  return template ? template(name, results) : `
Hi ${name},

Thank you for using our ${toolName}!

Your results have been processed. Please check back soon for detailed analysis.

Best regards,
The CDM Suite Team
  `;
}

function getTripwireOffer(toolName: string): any {
  const offers: { [key: string]: any } = {
    'SEO Checker': {
      title: 'SEO Starter Package',
      originalPrice: 497,
      discountPrice: 197,
      savings: 300,
      urgency: '48 hours only',
      features: [
        'Complete technical SEO audit',
        'On-page optimization (5 pages)',
        'Keyword research & strategy',
        '30 days ranking monitoring',
        'Google My Business optimization ($97 bonus)'
      ],
      cta: 'Fix My SEO Now →',
      checkoutType: 'stripe', // Direct to Stripe, no service page
      offerName: 'SEO Starter Package'
    },
    'Website Auditor': {
      title: 'Website Transformation Package',
      originalPrice: 997,
      discountPrice: 297,
      savings: 700,
      urgency: '48 hours only',
      features: [
        'Fix all critical issues',
        'Mobile optimization & speed boost',
        'Security hardening & SSL',
        'SEO foundation optimization',
        '1 month free maintenance ($297 bonus)'
      ],
      cta: 'Transform My Website →',
      checkoutType: 'stripe',
      offerName: 'Website Transformation Package'
    },
    'ROI Calculator': {
      title: 'Growth Accelerator Package',
      originalPrice: 1497,
      discountPrice: 497,
      savings: 1000,
      urgency: '48 hours only',
      features: [
        'Custom marketing strategy',
        'Conversion rate optimization',
        '30-day campaign management',
        'A/B testing setup & analysis',
        'Free landing page design ($497 bonus)'
      ],
      cta: 'Accelerate My Growth →',
      checkoutType: 'stripe',
      offerName: 'Growth Accelerator Package'
    },
    'Budget Calculator': {
      title: 'Full-Service Marketing Package',
      originalPrice: 1997,
      discountPrice: 997,
      savings: 1000,
      urgency: '50% OFF first 3 months',
      features: [
        'Complete campaign management',
        'All channels (SEO, PPC, Social, Email)',
        'Monthly strategy sessions',
        'Dedicated account manager',
        'Real-time analytics dashboard',
        'Free setup ($1,500 bonus)'
      ],
      cta: 'Start Full-Service →',
      checkoutType: 'stripe',
      offerName: 'Full-Service Marketing Package'
    },
    'Email Tester': {
      title: 'Email Domination Package',
      originalPrice: 997,
      discountPrice: 397,
      savings: 600,
      urgency: '48 hours only',
      features: [
        'Custom email template design',
        '10 high-converting subject lines',
        'Email sequence strategy (5-7 emails)',
        'Spam test & deliverability check',
        'A/B testing setup',
        '1 month SendGrid free ($79 bonus)'
      ],
      cta: 'Dominate Email Marketing →',
      checkoutType: 'stripe',
      offerName: 'Email Domination Package'
    },
    'Conversion Analyzer': {
      title: 'CRO Intensive Package',
      originalPrice: 1997,
      discountPrice: 697,
      savings: 1300,
      urgency: '48 hours only',
      features: [
        'Complete funnel analysis',
        'Landing page redesign (3 variations)',
        'A/B testing setup & management',
        'Heatmap & behavior analysis',
        'Copy optimization',
        'Follow-up optimization ($497 bonus)'
      ],
      cta: 'Triple My Conversions →',
      checkoutType: 'stripe',
      offerName: 'CRO Intensive Package'
    },
    'Website Grader': {
      title: 'Website Transformation Package',
      originalPrice: 997,
      discountPrice: 297,
      savings: 700,
      urgency: '48 hours only',
      features: [
        'Fix all critical issues',
        'Mobile optimization & speed boost',
        'Security hardening & SSL',
        'SEO foundation optimization',
        '1 month free maintenance ($297 bonus)'
      ],
      cta: 'Transform My Website →',
      checkoutType: 'stripe',
      offerName: 'Website Transformation Package'
    },
    'Email Analyzer': {
      title: 'Email Domination Package',
      originalPrice: 997,
      discountPrice: 397,
      savings: 600,
      urgency: '48 hours only',
      features: [
        'Custom email template design',
        '10 high-converting subject lines',
        'Email sequence strategy (5-7 emails)',
        'Spam test & deliverability check',
        'A/B testing setup',
        '1 month SendGrid free ($79 bonus)'
      ],
      cta: 'Dominate Email Marketing →',
      checkoutType: 'stripe',
      offerName: 'Email Domination Package'
    },
    'Facebook Analyzer': {
      title: 'Social Media Domination',
      originalPrice: 1497,
      discountPrice: 497,
      savings: 1000,
      urgency: '48 hours only',
      features: [
        'Complete social media audit',
        'Content calendar (30 posts)',
        'Ad campaign setup (Meta)',
        '30-day management',
        'Free graphics pack ($297 bonus)'
      ],
      cta: 'Dominate Social Media →',
      checkoutType: 'stripe',
      offerName: 'Social Media Domination'
    },
    'Landing Page Grader': {
      title: 'Landing Page Makeover',
      originalPrice: 1497,
      discountPrice: 597,
      savings: 900,
      urgency: '48 hours only',
      features: [
        'Complete page redesign',
        'Mobile optimization',
        'A/B testing setup',
        'Copy optimization',
        'Conversion tracking ($197 bonus)'
      ],
      cta: 'Transform My Landing Page →',
      checkoutType: 'stripe',
      offerName: 'Landing Page Makeover'
    },
    'Marketing ROI Calculator': {
      title: 'Growth Accelerator Package',
      originalPrice: 1497,
      discountPrice: 497,
      savings: 1000,
      urgency: '48 hours only',
      features: [
        'Custom marketing strategy',
        'Conversion rate optimization',
        '30-day campaign management',
        'A/B testing setup & analysis',
        'Free landing page design ($497 bonus)'
      ],
      cta: 'Accelerate My Growth →',
      checkoutType: 'stripe',
      offerName: 'Growth Accelerator Package'
    },
    'Lead Magnet Analyzer': {
      title: 'Lead Generation System',
      originalPrice: 1297,
      discountPrice: 497,
      savings: 800,
      urgency: '48 hours only',
      features: [
        'Custom lead magnet creation',
        'Landing page design',
        'Email sequence (5 emails)',
        'CRM integration',
        'Free graphics ($297 bonus)'
      ],
      cta: 'Generate More Leads →',
      checkoutType: 'stripe',
      offerName: 'Lead Generation System'
    },
    'Funnel Analyzer': {
      title: 'Funnel Optimization Package',
      originalPrice: 1997,
      discountPrice: 797,
      savings: 1200,
      urgency: '48 hours only',
      features: [
        'Complete funnel audit',
        'Landing page optimization',
        'Email sequence setup',
        'A/B testing (3 variations)',
        'Follow-up optimization ($497 bonus)'
      ],
      cta: 'Optimize My Funnel →',
      checkoutType: 'stripe',
      offerName: 'Funnel Optimization Package'
    },
    'Content Score Analyzer': {
      title: 'Content Domination Package',
      originalPrice: 1297,
      discountPrice: 497,
      savings: 800,
      urgency: '48 hours only',
      features: [
        '10 SEO-optimized articles',
        'Content strategy blueprint',
        'Keyword research',
        'Distribution plan',
        'Free graphics pack ($297 bonus)'
      ],
      cta: 'Dominate Content Marketing →',
      checkoutType: 'stripe',
      offerName: 'Content Domination Package'
    },
  };

  return offers[toolName] || {
    title: 'Custom Marketing Strategy',
    originalPrice: 997,
    discountPrice: 297,
    savings: 700,
    urgency: '48 hours only',
    features: [
      'Personalized strategy session',
      'Custom action plan',
      '30-day implementation support'
    ],
    cta: 'Get Started →',
    checkoutType: 'stripe',
    offerName: 'Custom Marketing Strategy'
  };
}
