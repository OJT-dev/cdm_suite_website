
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAssessmentResults } from '@/lib/email';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, responses, score, recommendations } = body;

    // Store in database
    const assessment = await prisma.marketingAssessment.create({
      data: {
        name,
        email,
        company,
        responses: JSON.stringify(responses),
        score,
        recommendations: JSON.stringify(recommendations),
        reportSent: false,
      },
    });

    // Also create a lead
    await prisma.lead.create({
      data: {
        name,
        email,
        source: 'assessment',
        interest: `Marketing Assessment - Score: ${score}%`,
        assessmentResults: JSON.stringify({ score, recommendations }),
        tags: JSON.stringify(['marketing-assessment']),
      },
    });

    // Send email with results in background
    sendAssessmentResults({
      name,
      email,
      score,
      recommendations,
    }).catch(error => {
      console.error('Assessment email sending failed:', error);
    });

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      score
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}
