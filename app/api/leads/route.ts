
// Public API endpoint for lead capture from tools and public forms
// This endpoint does not require authentication

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendToolLeadNotifications, generateToolFollowUpActions } from '@/lib/tool-email-templates';
import { safeJSONStringify } from '@/lib/json-helper';
export const runtime = 'edge';


// Helper to parse and format tool assessment data
function parseAssessmentData(notes: string, source: string) {
  try {
    // Extract JSON from notes if present
    const jsonMatch = notes.match(/Assessment Details:\s*({[\s\S]*})/);
    if (jsonMatch) {
      const assessmentData = JSON.parse(jsonMatch[1]);
      return {
        hasData: true,
        data: assessmentData,
        formatted: formatAssessmentData(assessmentData, source),
      };
    }
  } catch (e) {
    console.error('Error parsing assessment data:', e);
  }
  return { hasData: false, data: null, formatted: null };
}

// Format assessment data into readable format
function formatAssessmentData(data: any, source: string): string {
  if (source === 'website-need-checker') {
    return formatWebsiteNeedData(data);
  }
  // Add other tool formatters here
  return JSON.stringify(data, null, 2);
}

function formatWebsiteNeedData(data: any): string {
  const labels: { [key: string]: string } = {
    hasWebsite: 'Current Website Status',
    industry: 'Industry',
    businessAge: 'Business Age',
    customerType: 'Customer Type',
    currentLeadGen: 'Current Lead Generation',
    monthlyRevenue: 'Monthly Revenue',
    competitors: 'Competition Level',
    goals: 'Business Goals',
  };

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

  let formatted = '📊 Website Need Assessment Results\n\n';

  for (const [key, label] of Object.entries(labels)) {
    if (data[key]) {
      formatted += `${label}: `;
      if (key === 'goals' && Array.isArray(data[key])) {
        formatted += data[key].join(', ') + '\n';
      } else {
        const value = valueLabels[key]?.[data[key]] || data[key];
        formatted += value + '\n';
      }
    }
  }

  return formatted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      phone,
      company,
      source,
      interest,
      notes,
      tags,
    } = body;

    // Validate required fields
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }

    // At least one contact method should be provided
    if (!email && !phone && !name) {
      return NextResponse.json(
        { error: 'At least one of email, phone, or name is required' },
        { status: 400 }
      );
    }

    // Parse assessment data for better formatting
    const assessmentInfo = notes ? parseAssessmentData(notes, source) : { hasData: false, data: null, formatted: null };

    // Extract score if present
    let score = 0;
    let needLevel = 'medium';
    if (notes) {
      const scoreMatch = notes.match(/Score:\s*(\d+)\/100/);
      const needMatch = notes.match(/Need Level:\s*(\w+)/i);
      if (scoreMatch) score = parseInt(scoreMatch[1]);
      if (needMatch) needLevel = needMatch[1].toLowerCase();
    }

    // Determine priority based on score
    let priority = 'medium';
    if (score >= 80) priority = 'high';
    else if (score >= 60) priority = 'medium';
    else priority = 'low';

    // Check if lead already exists (by email or phone)
    let existingLead = null;
    if (email) {
      existingLead = await prisma.lead.findFirst({
        where: { email },
      });
    }

    if (!existingLead && phone) {
      existingLead = await prisma.lead.findFirst({
        where: { phone },
      });
    }

    if (existingLead) {
      // Update existing lead with new information
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name: name || existingLead.name,
          phone: phone || existingLead.phone,
          company: company || existingLead.company,
          source: source || existingLead.source,
          interest: interest || existingLead.interest,
          priority: priority,
          score: Math.max(score, existingLead.score), // Keep highest score
          notes: notes
            ? `${existingLead.notes || ''}\n\n[${new Date().toISOString()}] ${notes}`
            : existingLead.notes,
          tags: tags ? safeJSONStringify(tags) : existingLead.tags,
          updatedAt: new Date(),
        },
      });

      // Create formatted activity with assessment details
      const activityDescription = assessmentInfo.hasData && assessmentInfo.formatted
        ? assessmentInfo.formatted
        : notes || 'Lead information updated';

      // Generate follow-up actions
      const followUpActions = generateToolFollowUpActions(source, score, assessmentInfo.data);

      // Create metadata for email content
      const metadata = {
        emailSent: true,
        assessmentData: assessmentInfo.data,
        followUpActions,
        score,
        needLevel,
      };

      await prisma.leadActivity.create({
        data: {
          leadId: updatedLead.id,
          type: 'note',
          title: `Lead updated from ${source}`,
          description: activityDescription,
          metadata: JSON.stringify(metadata),
        },
      });

      // Send email notifications
      sendToolLeadNotifications({
        lead: updatedLead,
        source,
        score,
        assessmentData: assessmentInfo.data,
        followUpActions,
        isUpdate: true,
      }).catch(err => console.error('Error sending notifications:', err));

      return NextResponse.json({
        success: true,
        lead: updatedLead,
        message: 'Lead updated successfully',
      });
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        email: email || null,
        name: name || null,
        phone: phone || null,
        company: company || null,
        source: source,
        interest: interest || null,
        status: 'new',
        priority: priority,
        score: score,
        notes: notes || null,
        tags: safeJSONStringify(tags || []),
      },
    });

    // Create formatted activity with assessment details
    const activityDescription = assessmentInfo.hasData && assessmentInfo.formatted
      ? assessmentInfo.formatted
      : notes || `Lead captured from ${source}`;

    // Generate follow-up actions
    const followUpActions = generateToolFollowUpActions(source, score, assessmentInfo.data);

    // Create metadata for email content
    const metadata = {
      emailSent: true,
      assessmentData: assessmentInfo.data,
      followUpActions,
      score,
      needLevel,
    };

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        title: `New lead from ${source}`,
        description: activityDescription,
        metadata: JSON.stringify(metadata),
      },
    });

    // Send email notifications
    sendToolLeadNotifications({
      lead,
      source,
      score,
      assessmentData: assessmentInfo.data,
      followUpActions,
      isUpdate: false,
    }).catch(err => console.error('Error sending notifications:', err));

    // Auto-create email sequence for this lead
    await autoCreateSequence(lead.id, source, score, assessmentInfo.data);

    return NextResponse.json({
      success: true,
      lead,
      message: 'Lead created successfully',
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// Auto-create email sequence for tool leads
async function autoCreateSequence(leadId: string, source: string, score: number, assessmentData: any) {
  try {
    // Define sequence templates based on source
    const sequenceTemplates: { [key: string]: any } = {
      'website-need-checker': {
        name: 'Website Need Follow-Up Sequence',
        steps: [
          {
            order: 1,
            channel: 'email',
            subject: 'Your Website Assessment Results + Next Steps',
            content: 'Hi {{name}},\n\nThank you for completing our Website Need Assessment! Based on your results, I wanted to reach out personally to discuss how we can help transform your online presence.\n\nYour assessment score: {{score}}/100\n\nI\'d love to schedule a brief 15-minute call to:\n• Review your specific needs\n• Show you examples relevant to your industry\n• Discuss a custom solution\n\nWould you be available for a quick call this week?\n\nBest regards,\nCDM Suite Team',
            delayDays: 0,
            delayHours: 2,
          },
          {
            order: 2,
            channel: 'email',
            subject: 'Quick question about your website goals',
            content: 'Hi {{name}},\n\nI wanted to follow up on your Website Need Assessment. I noticed you\'re looking to {{goals}}.\n\nI\'ve helped businesses like yours achieve similar goals, and I\'d love to share some strategies that could work for you.\n\nDo you have 10 minutes this week for a quick chat?\n\nBest,\nCDM Suite Team',
            delayDays: 3,
            delayHours: 0,
          },
          {
            order: 3,
            channel: 'email',
            subject: 'Case Study: {{industry}} success story',
            content: 'Hi {{name}},\n\nI thought you might find this interesting - we recently helped a {{industry}} business similar to yours increase their leads by 250% with a new website.\n\nI\'d be happy to share more details about what we did and how it might apply to your situation.\n\nInterested in learning more?\n\nBest,\nCDM Suite Team',
            delayDays: 5,
            delayHours: 0,
          },
        ],
      },
    };

    const template = sequenceTemplates[source];
    if (!template) {
      console.log(`No sequence template for source: ${source}`);
      return;
    }

    // Create sequence in draft/pending state
    await prisma.leadSequence.create({
      data: {
        leadId,
        name: template.name,
        description: `Auto-generated sequence for ${source} lead (Score: ${score})`,
        steps: JSON.stringify(template.steps), // steps is likely Json or String, if String this is correct
        status: 'pending', // Requires approval before activation
        aiGenerated: true,
        aiRecommendedBy: 'system',
      },
    });

    console.log(`✅ Auto-created sequence for lead ${leadId}`);
  } catch (error) {
    console.error('Error auto-creating sequence:', error);
  }
}
