
// Enhanced Lead Creation Endpoint - Critical Bug #1 Fix
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logError, APIError, ERROR_CODES } from '@/lib/error-logger';


/**
 * POST /api/crm/leads/create
 * Create a new lead with comprehensive validation and error handling
 */
export async function POST(request: NextRequest) {
  const endpoint = '/api/crm/leads/create';
  
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      await logError({
        level: 'warning',
        message: 'Unauthorized lead creation attempt',
        endpoint,
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.UNAUTHORIZED, 
          message: 'Authentication required to create leads' 
        },
        { status: 401 }
      );
    }

    // 2. Get user with role information
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeProfile: {
          select: {
            id: true,
            employeeRole: true,
            capabilities: true,
          },
        },
      },
    });

    if (!user) {
      await logError({
        level: 'error',
        message: 'User not found in database despite valid session',
        endpoint,
        userEmail: session.user.email,
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.FORBIDDEN, 
          message: 'User account not found' 
        },
        { status: 403 }
      );
    }

    // 3. Permission check - admin and employees can create leads
    const isAdmin = user.role?.toLowerCase() === 'admin';
    const isEmployee = user.role?.toLowerCase() === 'employee' || !!user.employeeProfile;
    
    if (!isAdmin && !isEmployee) {
      await logError({
        level: 'warning',
        message: 'Insufficient permissions to create lead',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: { userRole: user.role },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: 'Only admins and employees can create leads' 
        },
        { status: 403 }
      );
    }

    // 4. Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      await logError({
        level: 'warning',
        message: 'Invalid JSON in request body',
        endpoint,
        userId: user.id,
        userEmail: user.email,
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.VALIDATION_FAILED,
          message: 'Invalid request body. Must be valid JSON.' 
        },
        { status: 400 }
      );
    }

    const {
      email,
      name,
      phone,
      company,
      source,
      interest,
      status,
      priority,
      assignedToId,
      budget,
      timeline,
      notes,
      tags,
    } = body;

    // 5. Validate required field: source
    if (!source) {
      await logError({
        level: 'warning',
        message: 'Missing required field: source',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: { body },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.MISSING_REQUIRED_FIELD,
          message: 'Source is required',
          details: {
            requiredFields: ['source'],
            providedFields: Object.keys(body),
          },
        },
        { status: 400 }
      );
    }

    // 6. Validate at least one contact method
    if (!email && !phone && !name) {
      await logError({
        level: 'warning',
        message: 'No contact information provided',
        endpoint,
        userId: user.id,
        userEmail: user.email,
        context: { source },
      });
      
      return NextResponse.json(
        { 
          error: ERROR_CODES.VALIDATION_FAILED,
          message: 'Please provide at least a name, email, or phone number',
          details: {
            providedFields: Object.keys(body),
          },
        },
        { status: 400 }
      );
    }

    // 7. Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await logError({
          level: 'warning',
          message: 'Invalid email format',
          endpoint,
          userId: user.id,
          userEmail: user.email,
          context: { providedEmail: email },
        });
        
        return NextResponse.json(
          { 
            error: ERROR_CODES.INVALID_FORMAT,
            message: 'Invalid email format',
            details: { providedEmail: email },
          },
          { status: 400 }
        );
      }

      // 8. Check for duplicate email (if email provided)
      const existingLead = await prisma.lead.findFirst({
        where: {
          email: email,
        },
      });

      if (existingLead) {
        await logError({
          level: 'info',
          message: 'Duplicate lead email detected',
          endpoint,
          userId: user.id,
          userEmail: user.email,
          context: {
            providedEmail: email,
            existingLeadId: existingLead.id,
          },
        });
        
        return NextResponse.json(
          { 
            error: ERROR_CODES.DUPLICATE_ENTRY,
            message: 'A lead with this email already exists',
            details: {
              existingLeadId: existingLead.id,
              existingLeadName: existingLead.name,
            },
          },
          { status: 409 }
        );
      }
    }

    // 9. Validate assignedToId if provided
    if (assignedToId) {
      const assignee = await prisma.employee.findUnique({
        where: { id: assignedToId },
      });

      if (!assignee) {
        await logError({
          level: 'warning',
          message: 'Invalid assignedToId',
          endpoint,
          userId: user.id,
          userEmail: user.email,
          context: { assignedToId },
        });
        
        return NextResponse.json(
          { 
            error: ERROR_CODES.RECORD_NOT_FOUND,
            message: 'Assigned employee not found',
            details: { assignedToId },
          },
          { status: 400 }
        );
      }
    }

    // 10. Create the lead
    const lead = await prisma.lead.create({
      data: {
        email: email || null,
        name: name || null,
        phone: phone || null,
        company: company || null,
        source,
        interest: interest || null,
        status: status || 'new',
        priority: priority || 'medium',
        assignedToId: assignedToId || null,
        budget: budget || null,
        timeline: timeline || null,
        notes: notes || null,
        tags: tags || [],
        score: 0,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            userId: true,
            employeeRole: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // 11. Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        title: 'Lead Created',
        description: `Lead created by ${user.name || user.email} via ${source}`,
        createdById: user.employeeProfile?.id || null,
        metadata: JSON.stringify({
          createdByUserId: user.id,
          createdByEmail: user.email,
          source,
        }),
      },
    });

    // 12. Log success
    await logError({
      level: 'info',
      message: 'Lead created successfully',
      endpoint,
      userId: user.id,
      userEmail: user.email,
      context: {
        leadId: lead.id,
        leadEmail: lead.email,
        leadName: lead.name,
        source: lead.source,
      },
    });

    // 13. Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Lead created successfully',
        lead,
      },
      { status: 201 }
    );

  } catch (error: any) {
    // Log unexpected errors
    await logError({
      level: 'error',
      message: error.message || 'Unknown error creating lead',
      stack: error.stack,
      endpoint,
      context: {
        errorName: error.name,
        errorCode: error.code,
      },
    });

    // Return error response
    if (error instanceof APIError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: ERROR_CODES.DUPLICATE_ENTRY,
          message: 'A lead with this information already exists',
          details: error.meta,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: ERROR_CODES.DATABASE_ERROR,
        message: 'Failed to create lead',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

