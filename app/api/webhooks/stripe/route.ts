
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getWorkflowTemplate } from '@/lib/workflow-templates';
import Stripe from 'stripe';

export const runtime = 'nodejs';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    console.warn('Stripe secret key not found in environment variables; Stripe webhook processing disabled.');
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  return stripeClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const stripe = getStripeClient();

    if (!stripe) {
      console.error('Stripe client unavailable; STRIPE_SECRET_KEY is not configured.');
      return NextResponse.json(
        { error: 'Stripe webhook not configured' },
        { status: 500 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Extract service information from metadata
    const { serviceId, serviceName, tierId, tierName, serviceType, offerName, offerType } = session.metadata || {};
    
    // Determine the actual service name
    let actualServiceName = serviceName || tierName || offerName || 'Unknown Service';
    
    // For tripwire offers, extract the service name more intelligently
    if (offerType === 'tripwire' && offerName) {
      actualServiceName = offerName;
    }

    // Create order record
    const order = await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        customerEmail: session.customer_email || session.customer_details?.email || '',
        customerName: session.customer_details?.name || '',
        packageName: actualServiceName,
        packagePrice: (session.amount_total || 0) / 100,
        status: 'completed',
      },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.customer_email || session.customer_details?.email || '' },
    });

    let isNewUser = false;
    let temporaryPassword = '';
    
    if (!user && session.customer_details?.email) {
      isNewUser = true;
      // Generate temporary password
      temporaryPassword = generateTemporaryPassword();
      
      // Hash the password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      
      user = await prisma.user.create({
        data: {
          email: session.customer_details.email,
          name: session.customer_details.name || undefined,
          role: 'client',
          password: hashedPassword,
        },
      });
    }

    // Send order confirmation email with login details
    try {
      const { sendEmail, getOrderConfirmationEmail } = await import('@/lib/email');
      const emailContent = getOrderConfirmationEmail({
        customerName: order.customerName || 'Valued Customer',
        customerEmail: order.customerEmail,
        serviceName: actualServiceName,
        amount: order.packagePrice,
        orderId: order.id,
        isNewUser,
        temporaryPassword: isNewUser ? temporaryPassword : undefined,
      });
      
      await sendEmail({
        to: order.customerEmail,
        subject: `✅ Order Confirmed - ${actualServiceName}`,
        html: emailContent,
      });
      
      console.log('✅ Order confirmation email sent to:', order.customerEmail);
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError);
    }

    // Send detailed notification to admin/employees
    try {
      const { sendEmail } = await import('@/lib/email');
      const adminEmail = process.env.ADMIN_EMAIL || 'hello@cdmsuite.com';
      const dashboardUrl = process.env.NEXTAUTH_URL || 'https://cdmsuite.abacusai.app';
      
      await sendEmail({
        to: adminEmail,
        subject: `🎉 New Order Received - ${actualServiceName} ($${order.packagePrice})`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Order Notification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; font-size: 28px; color: white;">🎉 New Order Received!</h1>
                          <p style="margin: 10px 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">Immediate action required</p>
                        </td>
                      </tr>
                      
                      <!-- Order Details -->
                      <tr>
                        <td style="padding: 30px 40px;">
                          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #2563eb; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                            <h2 style="margin: 0 0 20px; font-size: 20px; color: #1e40af;">📦 Order Information</h2>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; color: #4b5563; font-weight: 600; width: 140px;">Service:</td>
                                <td style="padding: 10px 0; color: #111827; font-weight: 700; font-size: 16px;">${actualServiceName}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #4b5563; font-weight: 600;">Amount:</td>
                                <td style="padding: 10px 0;">
                                  <span style="color: #059669; font-weight: 700; font-size: 20px;">$${order.packagePrice.toFixed(2)}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #4b5563; font-weight: 600;">Order ID:</td>
                                <td style="padding: 10px 0; color: #6b7280; font-family: monospace; font-size: 12px;">${order.id}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #4b5563; font-weight: 600;">Order Date:</td>
                                <td style="padding: 10px 0; color: #111827;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #4b5563; font-weight: 600;">Order Time:</td>
                                <td style="padding: 10px 0; color: #111827;">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</td>
                              </tr>
                              ${session.metadata?.serviceType ? `
                              <tr>
                                <td style="padding: 10px 0; color: #4b5563; font-weight: 600;">Service Type:</td>
                                <td style="padding: 10px 0;">
                                  <span style="background-color: ${session.metadata.serviceType === 'subscription' ? '#dbeafe' : '#fef3c7'}; color: ${session.metadata.serviceType === 'subscription' ? '#1e40af' : '#92400e'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${session.metadata.serviceType === 'subscription' ? '🔄 Recurring' : '💵 One-Time'}
                                  </span>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </div>
                          
                          <!-- Customer Details -->
                          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                            <h2 style="margin: 0 0 20px; font-size: 20px; color: #92400e;">👤 Customer Information</h2>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; color: #78350f; font-weight: 600; width: 140px;">Name:</td>
                                <td style="padding: 10px 0; color: #111827; font-weight: 700;">${order.customerName || 'Not provided'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #78350f; font-weight: 600;">Email:</td>
                                <td style="padding: 10px 0;">
                                  <a href="mailto:${order.customerEmail}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${order.customerEmail}</a>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #78350f; font-weight: 600;">Account Status:</td>
                                <td style="padding: 10px 0;">
                                  <span style="background-color: ${isNewUser ? '#dcfce7' : '#e0e7ff'}; color: ${isNewUser ? '#14532d' : '#3730a3'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${isNewUser ? '🆕 NEW CUSTOMER' : '✅ EXISTING CUSTOMER'}
                                  </span>
                                </td>
                              </tr>
                              ${isNewUser ? `
                              <tr>
                                <td colspan="2" style="padding: 15px 0 0;">
                                  <div style="background-color: white; border-radius: 6px; padding: 15px;">
                                    <p style="margin: 0 0 10px; font-weight: 600; color: #14532d; font-size: 14px;">✉️ Account Created</p>
                                    <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.6;">
                                      A new customer account has been automatically created and login credentials have been sent to <strong>${order.customerEmail}</strong>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </div>
                          
                          <!-- Action Items -->
                          <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #dc2626; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                            <h2 style="margin: 0 0 15px; font-size: 20px; color: #991b1b;">⚡ Immediate Action Required</h2>
                            
                            <div style="background-color: white; border-radius: 6px; padding: 20px; margin-bottom: 15px;">
                              <h3 style="margin: 0 0 15px; font-size: 16px; color: #dc2626;">📋 Next Steps (Complete within 24 hours):</h3>
                              <ol style="margin: 0; padding-left: 25px; color: #4b5563; line-height: 2;">
                                <li><strong>Contact the customer</strong> - Send a personalized welcome message</li>
                                <li><strong>Schedule kickoff call</strong> - Book initial consultation meeting</li>
                                <li><strong>Review requirements</strong> - Gather all necessary information</li>
                                <li><strong>Create project workflow</strong> - Set up in the dashboard</li>
                                <li><strong>Assign team members</strong> - Allocate resources for the project</li>
                              </ol>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px;">
                              <a href="${dashboardUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                🚀 View in Dashboard
                              </a>
                            </div>
                          </div>
                          
                          <!-- Important Notes -->
                          <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px;">
                            <h3 style="margin: 0 0 15px; font-size: 16px; color: #374151;">📝 Important Notes:</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8;">
                              <li>Customer expects initial contact within 24 hours</li>
                              <li>Payment has been processed successfully via Stripe</li>
                              <li>Receipt and login details ${isNewUser ? 'have' : 'will'} be sent to customer</li>
                              <li>Workflow can be accessed in the Service Fulfillment section</li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                          <p style="margin: 0 0 10px; font-size: 12px; color: #6b7280;">
                            This is an automated notification from CDM Suite Order Management System
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            For support, call <a href="tel:+18622727623" style="color: #2563eb; text-decoration: none;">(862) 272-7623</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
      
      console.log('✅ Detailed employee notification sent to:', adminEmail);
    } catch (notifError) {
      console.error('❌ Failed to send admin notification:', notifError);
    }

    // Auto-create workflow for Done-For-You services
    if (serviceType === 'subscription' || serviceName?.toLowerCase().includes('maintenance') === false) {
      await createWorkflowFromOrder(order.id, user?.id, {
        serviceName: actualServiceName,
        serviceTier: tierName || tierId,
        serviceAmount: order.packagePrice,
        stripeSessionId: session.id,
      });
    }

    console.log('✅ Checkout completed and workflow created:', order.id);
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
    throw error;
  }
}

// Helper function to generate temporary password
function generateTemporaryPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createWorkflowFromOrder(
  orderId: string,
  userId: string | undefined,
  serviceInfo: {
    serviceName: string;
    serviceTier?: string;
    serviceAmount: number;
    stripeSessionId: string;
  }
) {
  try {
    // Determine service type from service name
    let serviceType = 'web-development';
    const nameLower = serviceInfo.serviceName.toLowerCase();
    
    if (nameLower.includes('seo')) {
      serviceType = 'seo';
    } else if (nameLower.includes('social')) {
      serviceType = 'social-media';
    } else if (nameLower.includes('ad') || nameLower.includes('ppc')) {
      serviceType = 'ad-management';
    } else if (nameLower.includes('app')) {
      serviceType = 'app-development';
    }

    // Get workflow template
    const templateConfig = getWorkflowTemplate(serviceType, serviceInfo.serviceTier);
    if (!templateConfig) {
      console.log('No workflow template found for:', serviceType, serviceInfo.serviceTier);
      return;
    }

    // Create or find template in database
    let template = await prisma.workflowTemplate.findFirst({
      where: {
        serviceType,
        serviceTier: serviceInfo.serviceTier || null,
      },
    });

    if (!template) {
      template = await prisma.workflowTemplate.create({
        data: {
          name: templateConfig.name,
          serviceType,
          serviceTier: serviceInfo.serviceTier || null,
          estimatedDuration: templateConfig.estimatedDuration,
          estimatedHours: templateConfig.estimatedHours,
          tasksTemplate: JSON.stringify(templateConfig.tasks),
          milestones: templateConfig.milestones ? JSON.stringify(templateConfig.milestones) : null,
          active: true,
        },
      });
    }

    // Calculate expected completion date
    const expectedCompletionDate = new Date();
    if (template.estimatedDuration) {
      expectedCompletionDate.setDate(expectedCompletionDate.getDate() + template.estimatedDuration);
    }

    // Create workflow instance
    const workflow = await prisma.workflowInstance.create({
      data: {
        templateId: template.id,
        userId,
        orderId,
        stripeSessionId: serviceInfo.stripeSessionId,
        serviceName: serviceInfo.serviceName,
        serviceTier: serviceInfo.serviceTier,
        serviceAmount: serviceInfo.serviceAmount,
        expectedCompletionDate,
        status: 'pending',
      },
    });

    // Create tasks from template
    const tasksTemplate = JSON.parse(template.tasksTemplate);
    await Promise.all(
      tasksTemplate.map((taskTemplate: any, index: number) =>
        prisma.workflowTask.create({
          data: {
            workflowId: workflow.id,
            title: taskTemplate.title,
            description: taskTemplate.description,
            order: taskTemplate.order || index + 1,
            estimatedHours: taskTemplate.estimatedHours,
            requiredSkills: taskTemplate.requiredSkills || [],
            dependencies: taskTemplate.dependencies || [],
            visibleToClient: taskTemplate.visibleToClient || false,
            status: 'pending',
          },
        })
      )
    );

    console.log('Workflow created successfully:', workflow.id);
    return workflow;
  } catch (error) {
    console.error('Error creating workflow from order:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Handle subscription updates
  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // Handle subscription cancellation
  console.log('Subscription canceled:', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    // Create payment recovery record
    // @ts-ignore - subscription exists on Invoice but may not be in all type versions
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    
    if (subscriptionId && customerId) {
      const user = await prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      });

      if (user) {
        await prisma.paymentRecovery.create({
          data: {
            userId: user.id,
            subscriptionId: subscriptionId,
            stripeInvoiceId: invoice.id,
            amountDue: (invoice.amount_due || 0) / 100,
            currency: invoice.currency,
            failureReason: invoice.last_finalization_error?.message,
            failureCode: invoice.last_finalization_error?.code,
            status: 'pending',
            nextRetryAt: invoice.next_payment_attempt 
              ? new Date(invoice.next_payment_attempt * 1000) 
              : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          },
        });

        console.log('Payment recovery record created for user:', user.id);
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
