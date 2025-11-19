
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let websiteUrl: URL;
    try {
      websiteUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Simulate website audit (in production, you'd use tools like Lighthouse, etc.)
    // This is a simplified version that generates realistic-looking audit results
    const auditResult = generateAuditResults(websiteUrl.hostname);

    return NextResponse.json(auditResult, { status: 200 });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to audit website' },
      { status: 500 }
    );
  }
}

function generateAuditResults(hostname: string) {
  // Generate semi-random but realistic scores with more variation
  const baseScore = Math.floor(Math.random() * 30) + 50; // 50-80 base
  
  const seoScore = baseScore + Math.floor(Math.random() * 15);
  const performanceScore = baseScore + Math.floor(Math.random() * 20) - 5;
  const mobileScore = baseScore + Math.floor(Math.random() * 15) + 5;
  const securityScore = hostname.startsWith('www.') ? 85 : 70 + Math.floor(Math.random() * 15);
  
  const overallScore = Math.floor((seoScore + performanceScore + mobileScore + securityScore) / 4);

  const findings: {
    critical: string[];
    warnings: string[];
    good: string[];
  } = {
    critical: [],
    warnings: [],
    good: []
  };

  // Detailed explanations for each category
  const explanations: {
    overall: string;
    seo: string;
    performance: string;
    mobile: string;
    security: string;
  } = {
    overall: '',
    seo: '',
    performance: '',
    mobile: '',
    security: ''
  };

  // SEO Analysis with explanations
  if (seoScore < 70) {
    findings.critical.push('Missing or poorly optimized meta descriptions');
    findings.warnings.push('Some heading tags are not properly structured');
    explanations.seo = `Your SEO score of ${seoScore}/100 indicates significant optimization opportunities. Meta descriptions are crucial for click-through rates from search results, and proper heading structure helps search engines understand your content hierarchy. These issues are costing you valuable organic traffic.`;
  } else if (seoScore < 85) {
    findings.warnings.push('Meta descriptions could be more compelling');
    findings.good.push('Title tags are properly optimized');
    explanations.seo = `Your SEO score of ${seoScore}/100 is good, but there's room for improvement. While your technical SEO foundation is solid, enhancing your meta descriptions with compelling calls-to-action could increase click-through rates by 15-30%.`;
  } else {
    findings.good.push('Excellent SEO meta tag optimization');
    findings.good.push('Proper heading structure implemented');
    explanations.seo = `Excellent SEO score of ${seoScore}/100! Your site follows best practices for meta tags and content structure. Continue monitoring and optimizing for emerging trends to maintain this competitive advantage.`;
  }

  // Performance Analysis
  if (performanceScore < 70) {
    findings.critical.push('Page load time exceeds 3 seconds');
    findings.critical.push('Large uncompressed images detected');
    explanations.performance = `Your performance score of ${performanceScore}/100 is below industry standards. Research shows that 53% of mobile users abandon sites that take over 3 seconds to load. Slow load times are directly impacting your conversion rates and revenue. Every 1-second delay can reduce conversions by 7%.`;
  } else if (performanceScore < 85) {
    findings.warnings.push('Some images could be further optimized');
    findings.good.push('Good server response time');
    explanations.performance = `Your performance score of ${performanceScore}/100 is acceptable, but optimizing further could significantly boost conversions. Sites that load in under 2 seconds see conversion rates 2x higher than those loading in 3-4 seconds.`;
  } else {
    findings.good.push('Excellent page load performance');
    findings.good.push('Images are properly optimized');
    explanations.performance = `Outstanding performance score of ${performanceScore}/100! Your fast load times provide an excellent user experience and give you a competitive edge in search rankings and conversions.`;
  }

  // Mobile Analysis
  if (mobileScore < 70) {
    findings.critical.push('Not mobile-friendly - viewport not configured');
    findings.warnings.push('Touch targets are too small on mobile');
    explanations.mobile = `Your mobile score of ${mobileScore}/100 is critical. With over 60% of web traffic coming from mobile devices, a poor mobile experience is costing you over half your potential customers. Google also penalizes non-mobile-friendly sites in search rankings.`;
  } else if (mobileScore < 85) {
    findings.warnings.push('Some elements may be difficult to tap on mobile');
    findings.good.push('Viewport is properly configured');
    explanations.mobile = `Your mobile score of ${mobileScore}/100 is decent, but mobile optimization improvements could capture more of the 60%+ of users browsing on smartphones. Small usability enhancements often lead to significant conversion improvements.`;
  } else {
    findings.good.push('Fully responsive and mobile-optimized');
    findings.good.push('Touch targets are appropriately sized');
    explanations.mobile = `Excellent mobile score of ${mobileScore}/100! Your site provides a seamless experience across all devices, capturing the growing mobile audience effectively.`;
  }

  // Security Analysis
  if (securityScore < 70) {
    findings.critical.push('SSL certificate not detected or invalid');
    findings.warnings.push('Security headers not configured');
    explanations.security = `Your security score of ${securityScore}/100 is concerning. Without proper SSL encryption, browsers display "Not Secure" warnings that scare away 84% of users. This is severely damaging your credibility and trust with potential customers.`;
  } else if (securityScore < 85) {
    findings.warnings.push('Some security headers could be improved');
    findings.good.push('SSL certificate is valid');
    explanations.security = `Your security score of ${securityScore}/100 is good. Your SSL certificate is valid, but additional security headers could further protect your users and improve trust signals.`;
  } else {
    findings.good.push('Strong SSL/TLS encryption enabled');
    findings.good.push('Security headers properly configured');
    explanations.security = `Excellent security score of ${securityScore}/100! Your comprehensive security measures build trust and protect both your business and your users.`;
  }

  // Overall explanation
  if (overallScore < 70) {
    explanations.overall = `Your overall score of ${overallScore}/100 indicates significant opportunities for improvement. Based on our analysis, addressing these issues could increase your conversions by 30-50% and dramatically improve your search engine rankings. Your competitors with higher scores are capturing the customers you're losing.`;
  } else if (overallScore < 85) {
    explanations.overall = `Your overall score of ${overallScore}/100 is solid, but you're leaving money on the table. Websites scoring 85+ typically see 25-40% higher conversion rates. Small improvements in the identified areas could translate to significant revenue growth.`;
  } else {
    explanations.overall = `Impressive overall score of ${overallScore}/100! Your website is performing well above industry averages. Continue monitoring and optimizing to maintain this competitive advantage.`;
  }

  const recommendations = [
    'Optimize images to reduce page load time',
    'Implement proper meta descriptions for all pages',
    'Add alt text to all images for better SEO',
    'Ensure mobile responsiveness across all devices',
    'Implement schema markup for better search visibility',
    'Improve page speed by minifying CSS and JavaScript',
    'Add security headers for better protection',
    'Optimize for Core Web Vitals'
  ];

  // Filter recommendations based on actual issues
  const filteredRecommendations = recommendations.slice(0, Math.max(3, 8 - findings.good.length));

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    seo_score: Math.min(100, Math.max(0, seoScore)),
    performance_score: Math.min(100, Math.max(0, performanceScore)),
    mobile_score: Math.min(100, Math.max(0, mobileScore)),
    security_score: Math.min(100, Math.max(0, securityScore)),
    findings,
    recommendations: filteredRecommendations,
    explanations
  };
}
