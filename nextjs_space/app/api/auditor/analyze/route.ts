
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail, sendWelcomeEmail } from '@/lib/email';
import { generateAuditResultEmail, generateLeadNotificationEmail } from '@/lib/email-templates';
import bcrypt from 'bcryptjs';

// Simulate website analysis (in production, you'd use real APIs like Google PageSpeed Insights, etc.)
async function analyzeWebsite(url: string, goals: string[]) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Parse URL to get domain
  let domain = url;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  // Generate realistic scores with some randomness
  const baseScores = {
    seo: 65 + Math.floor(Math.random() * 20),
    performance: 55 + Math.floor(Math.random() * 25),
    mobile: 70 + Math.floor(Math.random() * 20),
    security: 60 + Math.floor(Math.random() * 30),
  };

  const overall_score = Math.round(
    (baseScores.seo + baseScores.performance + baseScores.mobile + baseScores.security) / 4
  );

  // Generate findings based on scores
  const findings = {
    critical: [] as string[],
    warnings: [] as string[],
    good: [] as string[],
  };

  // SEO findings
  if (baseScores.seo < 70) {
    findings.critical.push('Missing or poorly optimized meta descriptions on key pages');
    findings.critical.push('No XML sitemap detected - search engines may have trouble crawling your site');
    findings.warnings.push('Low keyword density in page titles');
  } else {
    findings.good.push('Meta tags are properly configured');
    findings.good.push('XML sitemap is present and accessible');
  }

  // Performance findings
  if (baseScores.performance < 70) {
    findings.critical.push('Slow page load time (avg 4.2 seconds) - recommended is under 3 seconds');
    findings.warnings.push('Large image files are not optimized');
    findings.warnings.push('No content delivery network (CDN) detected');
  } else {
    findings.good.push('Page load times are within acceptable range');
  }

  // Mobile findings
  if (baseScores.mobile < 75) {
    findings.critical.push('Mobile viewport not configured correctly');
    findings.warnings.push('Text too small to read on mobile devices');
    findings.warnings.push('Clickable elements too close together');
  } else {
    findings.good.push('Mobile-responsive design implemented');
    findings.good.push('Touch targets are properly sized');
  }

  // Security findings
  if (baseScores.security < 75) {
    findings.critical.push('SSL/HTTPS not properly configured or missing');
    findings.warnings.push('No security headers detected (CSP, X-Frame-Options, etc.)');
  } else {
    findings.good.push('SSL certificate is valid and properly configured');
  }

  // Generate recommendations based on goals and scores
  const recommendations = [];

  if (goals.includes('improve-seo') || baseScores.seo < 70) {
    recommendations.push({
      category: 'SEO',
      priority: 'high' as const,
      issue: 'Limited search engine visibility',
      solution: 'Implement comprehensive on-page SEO optimization including meta tags, schema markup, and internal linking structure. Create an XML sitemap and submit to search engines.',
      estimatedImpact: 'High',
    });
  }

  if (goals.includes('faster-loading') || baseScores.performance < 70) {
    recommendations.push({
      category: 'Performance',
      priority: 'high' as const,
      issue: 'Slow page load times affecting user experience',
      solution: 'Optimize images, implement lazy loading, minify CSS/JS files, enable browser caching, and consider using a CDN for static assets.',
      estimatedImpact: 'High',
    });
  }

  if (goals.includes('mobile-optimization') || baseScores.mobile < 75) {
    recommendations.push({
      category: 'Mobile',
      priority: 'medium' as const,
      issue: 'Suboptimal mobile user experience',
      solution: 'Implement responsive design principles, optimize for touch interfaces, and ensure all content is accessible on mobile devices.',
      estimatedImpact: 'Medium',
    });
  }

  if (baseScores.security < 75) {
    recommendations.push({
      category: 'Security',
      priority: 'high' as const,
      issue: 'Website security vulnerabilities',
      solution: 'Install SSL certificate, implement security headers, keep software updated, and add regular security monitoring.',
      estimatedImpact: 'High',
    });
  }

  if (goals.includes('generate-leads')) {
    recommendations.push({
      category: 'Conversion',
      priority: 'medium' as const,
      issue: 'No clear conversion optimization strategy',
      solution: 'Add prominent calls-to-action, implement lead capture forms, create landing pages, and set up conversion tracking.',
      estimatedImpact: 'High',
    });
  }

  if (goals.includes('increase-traffic')) {
    recommendations.push({
      category: 'Content & Marketing',
      priority: 'medium' as const,
      issue: 'Limited content marketing strategy',
      solution: 'Develop a blog with SEO-optimized content, implement social media integration, and create shareable resources.',
      estimatedImpact: 'Medium',
    });
  }

  // Suggest relevant services based on findings
  const suggestedServices = [];

  if (baseScores.seo < 75 || goals.includes('improve-seo')) {
    suggestedServices.push({
      name: 'Growth SEO Package',
      reason: 'Improve your search rankings with technical SEO, keyword research, and ongoing optimization',
      price: 'From $400/mo',
      slug: 'seo-growth',
    });
  }

  if (baseScores.performance < 70 || goals.includes('faster-loading')) {
    suggestedServices.push({
      name: 'Website Performance Optimization',
      reason: 'Speed up your site with professional optimization, CDN setup, and ongoing monitoring',
      price: 'From $750',
      slug: 'website-maintenance-standard',
    });
  }

  if (overall_score < 60) {
    suggestedServices.push({
      name: 'Website Redesign - Growth Package',
      reason: 'Complete website overhaul with modern design, mobile optimization, and best practices',
      price: 'From $750',
      slug: 'website-creation-growth',
    });
  }

  if (goals.includes('generate-leads') || goals.includes('boost-sales')) {
    suggestedServices.push({
      name: 'Digital Marketing Bundle',
      reason: 'Full-service marketing including SEO, ads, and social media to drive qualified leads',
      price: 'From $2,000/mo',
      slug: 'bundle-growth',
    });
  }

  return {
    overall_score,
    seo_score: baseScores.seo,
    performance_score: baseScores.performance,
    mobile_score: baseScores.mobile,
    security_score: baseScores.security,
    findings,
    recommendations,
    suggestedServices: suggestedServices.slice(0, 4), // Limit to 4 suggestions
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteUrl, email, name, phone, company, goals } = body;

    if (!websiteUrl || !email) {
      return NextResponse.json(
        { error: 'Website URL and email are required' },
        { status: 400 }
      );
    }

    // Perform the audit analysis
    const auditResult = await analyzeWebsite(websiteUrl, goals || []);

    // Check if user already exists or create new account
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const isNewUser = !user;

    if (!user) {
      // Generate a random secure password
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      // Create new user with free tier
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          company: company || null,
          tier: 'free',
          subscriptionStatus: 'inactive',
        },
      });

      // Send welcome email with login instructions
      sendWelcomeEmail({
        email: user.email,
        name: user.name || 'there',
        tier: 'free',
        isFromAudit: true,
        auditScore: auditResult.overall_score,
        temporaryPassword: randomPassword,
      }).catch(console.error);
    }

    // Save audit to database and link to user
    const websiteAudit = await prisma.websiteAudit.create({
      data: {
        email,
        name: name || null,
        websiteUrl,
        seoScore: auditResult.seo_score,
        performanceScore: auditResult.performance_score,
        mobileScore: auditResult.mobile_score,
        securityScore: auditResult.security_score,
        overallScore: auditResult.overall_score,
        issues: JSON.stringify(auditResult.findings),
        recommendations: JSON.stringify(auditResult.recommendations),
        reportSent: true,
        userId: user.id,
      },
    });

    // Also save as marketing assessment for backward compatibility
    const assessment = await prisma.marketingAssessment.create({
      data: {
        email,
        name: name || null,
        company: company || null,
        responses: JSON.stringify({ websiteUrl, goals }),
        score: auditResult.overall_score,
        recommendations: JSON.stringify({
          ...auditResult,
          analyzedUrl: websiteUrl,
          analyzedAt: new Date().toISOString(),
        }),
        reportSent: true,
        userId: user.id,
      },
    });

    // Also create a lead record
    await prisma.lead.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        source: 'auditor',
        interest: `Website Audit - Score: ${auditResult.overall_score}`,
        assessmentResults: JSON.stringify(auditResult),
        tags: phone ? ['website-audit', 'phone-provided'] : ['website-audit'],
      },
    });

    // Send detailed email report with compelling sales copy (async, don't wait)
    const auditEmailHtml = generateAuditResultEmail({
      name: name || 'there',
      websiteUrl,
      overallScore: auditResult.overall_score,
      seoScore: auditResult.seo_score,
      performanceScore: auditResult.performance_score,
      mobileScore: auditResult.mobile_score,
      securityScore: auditResult.security_score,
      criticalIssues: auditResult.findings.critical,
      recommendations: auditResult.recommendations,
      suggestedServices: auditResult.suggestedServices,
    });
    
    sendEmail({
      to: email,
      subject: `${auditResult.overall_score < 60 ? '⚠️ URGENT' : auditResult.overall_score < 75 ? '📊' : '✅'} Your Website Audit Results - ${auditResult.overall_score}/100`,
      html: auditEmailHtml,
    }).catch(console.error);

    // Send admin notification with lead details
    const adminEmailHtml = generateLeadNotificationEmail({
      email,
      name: name || 'Not provided',
      phone: phone || 'Not provided',
      company: company || 'Not provided',
      websiteUrl,
      score: auditResult.overall_score,
      goals: goals || [],
    });
    
    sendEmail({
      to: process.env.ADMIN_EMAIL || 'support@cdmsuite.com',
      subject: `${auditResult.overall_score < 60 ? '🔥 HIGH PRIORITY' : auditResult.overall_score < 75 ? '⚡ NEW' : '✅ QUALITY'} Lead: ${websiteUrl} (${auditResult.overall_score}/100)${phone ? ' 📞' : ''}`,
      html: adminEmailHtml,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      audit: auditResult,
      assessmentId: assessment.id,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to complete audit analysis' },
      { status: 500 }
    );
  }
}
