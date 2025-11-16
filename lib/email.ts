
import { Resend } from 'resend';

/**
 * Email Service Utility
 * Uses Resend for email delivery
 */

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: any;
  tags?: { name: string; value: string }[];
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured. Emails will be logged to console only.');
    return null;
  }
  
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resendClient;
}

/**
 * Email service class for sequence execution
 */
class EmailService {
  private resend: Resend | null;

  constructor() {
    this.resend = getResendClient();
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // If Resend is not configured, log to console (development mode)
      if (!this.resend) {
        console.log('📧 Email (Development Mode):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.html || options.text);
        return { success: true, messageId: `dev-${Date.now()}` };
      }

      // Send email via Resend
      const fromEmail = process.env.EMAIL_FROM || 'CDM Suite <onboarding@resend.dev>';
      
      const emailData: any = {
        from: fromEmail,
        to: options.to,
        subject: options.subject,
      };

      // Resend requires either html or text
      if (options.html) {
        emailData.html = options.html;
      } else if (options.text) {
        emailData.text = options.text;
      } else {
        emailData.text = 'This is a test email from CDM Suite.';
      }

      // Add tags for tracking
      if (options.tags && options.tags.length > 0) {
        emailData.tags = options.tags;
      }
      
      const result = await this.resend.emails.send(emailData);

      if (result.error) {
        console.error('❌ Resend API error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ Email sent successfully via Resend:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

/**
 * Legacy send email function (for backward compatibility)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Add reply-to header and ensure from email is set correctly
  const fromEmail = process.env.EMAIL_FROM || 'CDM Suite <hello@cdmsuite.com>';
  const replyTo = 'hello@cdmsuite.com';
  
  const emailData: any = {
    from: fromEmail,
    to: options.to,
    subject: options.subject,
    reply_to: replyTo, // Add reply-to header
  };

  // Ensure HTML content
  if (options.html) {
    emailData.html = options.html;
  } else if (options.text) {
    // Convert text to basic HTML if HTML not provided
    emailData.html = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${options.text.replace(/\n/g, '<br>')}</div>`;
  } else {
    emailData.text = 'This is a test email from CDM Suite.';
  }

  // Add tags for tracking
  if (options.tags && options.tags.length > 0) {
    emailData.tags = options.tags;
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      console.log('📧 Email (Development Mode):', emailData);
      return true;
    }

    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return false;
    }

    console.log('✅ Email sent successfully via Resend:', result.data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

/**
 * Email Templates
 */

export function getPasswordResetEmail(name: string, resetUrl: string): string {
  const firstName = getFirstName(name);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 20px;">
                      CDM Suite
                    </div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; color: #111827;">Reset Your Password</h1>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      Hi ${firstName},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      We received a request to reset your password for your CDM Suite account. Click the button below to create a new password:
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #6b7280;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #2563eb; word-break: break-all;">
                      ${resetUrl}
                    </p>
                    
                    <p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; line-height: 1.5; color: #6b7280;">
                      This link will expire in 1 hour for security reasons.
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                      If you didn't request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                      © 2025 CDM Suite. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
                      Questions? Call us at <a href="tel:+18622727623" style="color: #2563eb; text-decoration: none;">(862) 272-7623</a> or email <a href="mailto:hello@cdmsuite.com" style="color: #2563eb; text-decoration: none;">hello@cdmsuite.com</a>
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

/**
 * Helper function to extract first name from full name
 */
function getFirstName(fullName: string | null | undefined): string {
  if (!fullName || fullName.trim() === '') {
    return 'there';
  }
  
  // Extract first word/name before any space
  const firstName = fullName.trim().split(/\s+/)[0];
  return firstName || 'there';
}

export function getWelcomeEmail(name: string, loginUrl: string): string {
  const firstName = getFirstName(name);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CDM Suite</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 20px;">
                      CDM Suite
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; color: #111827;">Welcome to CDM Suite! 🎉</h1>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      Hi ${firstName},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      Thank you for joining CDM Suite! We're excited to help you grow your business with our digital marketing tools and services.
                    </p>
                    
                    <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
                      <p style="margin: 0 0 10px; font-weight: 600; color: #1e40af;">🚀 Ready to Get Started?</p>
                      <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
                        Explore our powerful tools and services to grow your business.
                      </p>
                    </div>
                    
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);">
                          <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; line-height: 1.5; color: #6b7280;">
                      Need help? Our support team is here for you at <a href="mailto:hello@cdmsuite.com" style="color: #2563eb; text-decoration: none;">hello@cdmsuite.com</a>
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                      © 2025 CDM Suite. All rights reserved.
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

export function getAuditReportEmail(
  name: string,
  websiteUrl: string,
  overallScore: number,
  reportUrl: string
): string {
  const firstName = getFirstName(name);
  const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Website Audit Report</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 20px;">
                      CDM Suite
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; color: #111827;">Your Website Audit is Ready! 📊</h1>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      Hi ${firstName},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      We've completed the audit for <strong>${websiteUrl}</strong>. Here's your overall score:
                    </p>
                    
                    <div style="text-align: center; padding: 30px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                      <div style="font-size: 48px; font-weight: bold; color: ${scoreColor};">
                        ${overallScore}/100
                      </div>
                      <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">
                        Overall Website Score
                      </div>
                    </div>
                    
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);">
                          <a href="${reportUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                            View Full Report
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; line-height: 1.5; color: #6b7280;">
                      Want to improve your score? Our team can help optimize your website for better performance, SEO, and user experience.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                      © 2025 CDM Suite. All rights reserved.
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

// Additional email helper functions for existing features
export async function sendWelcomeEmail(data: { 
  email: string; 
  name: string; 
  tier?: string;
  isFromAudit?: boolean;
  auditScore?: number;
  temporaryPassword?: string;
}, token?: string): Promise<boolean> {
  const loginUrl = `${process.env.NEXTAUTH_URL || 'https://cdmsuite.abacusai.app'}/auth/login`;
  let html = getWelcomeEmail(data.name, loginUrl);
  
  // If from audit, include additional info
  if (data.isFromAudit && data.temporaryPassword) {
    const firstName = getFirstName(data.name);
    html = `
      <h2>Welcome to CDM Suite!</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for completing your website audit! Your audit score: <strong>${data.auditScore}/100</strong></p>
      <p>We've created an account for you to access your full report and recommendations.</p>
      <p><strong>Login Credentials:</strong></p>
      <p>Email: ${data.email}<br>Temporary Password: <code>${data.temporaryPassword}</code></p>
      <p><a href="${loginUrl}">Login to your dashboard</a></p>
      <p><strong>Important:</strong> Please change your password after logging in.</p>
      <p>Best regards,<br>The CDM Suite Team</p>
    `;
  }
  
  return sendEmail({
    to: data.email,
    subject: "Welcome to CDM Suite!",
    html,
  });
}

export async function sendContactNotification(data: any, extras?: any): Promise<boolean> {
  // Send notification to admin about new contact
  return sendEmail({
    to: process.env.ADMIN_EMAIL || "hello@cdmsuite.com",
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `,
  });
}

export async function sendContactConfirmation(data: any, extras?: any): Promise<boolean> {
  // Send confirmation email to user
  const firstName = getFirstName(data.name);
  return sendEmail({
    to: data.email,
    subject: "We received your message - CDM Suite",
    html: `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${firstName},</p>
      <p>We've received your message and will get back to you shortly.</p>
      <p>Best regards,<br>The CDM Suite Team</p>
    `,
  });
}

export async function sendLeadNotification(data: any, extras?: any): Promise<boolean> {
  // Send notification to admin about new lead
  return sendEmail({
    to: process.env.ADMIN_EMAIL || "hello@cdmsuite.com",
    subject: `New Lead: ${data.email}`,
    html: `
      <h2>New Lead Captured</h2>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Name:</strong> ${data.name || 'Not provided'}</p>
      <p><strong>Source:</strong> ${data.source}</p>
      <p><strong>Interest:</strong> ${data.interest || 'Not specified'}</p>
    `,
  });
}

export async function sendLeadWelcome(data: any, extras?: any): Promise<boolean> {
  // Send welcome email to lead
  const firstName = getFirstName(data.name);
  return sendEmail({
    to: data.email,
    subject: "Welcome! Let's grow your business - CDM Suite",
    html: `
      <h2>Welcome to CDM Suite!</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for your interest in CDM Suite. We're here to help you grow your business.</p>
      <p>Our team will reach out to you shortly to discuss how we can help.</p>
      <p>Best regards,<br>The CDM Suite Team</p>
    `,
  });
}

export async function sendAssessmentResults(data: { email: string; name: string; score: number; recommendations?: any }): Promise<boolean> {
  const firstName = getFirstName(data.name);
  const reportUrl = `${process.env.NEXTAUTH_URL || 'https://cdmsuite.abacusai.app'}/dashboard/analytics`;
  return sendEmail({
    to: data.email,
    subject: "Your Marketing Assessment Results - CDM Suite",
    html: `
      <h2>Your Marketing Assessment Results</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for completing the marketing assessment!</p>
      <p><strong>Your Score: ${data.score}/100</strong></p>
      <p><a href="${reportUrl}">View your dashboard</a></p>
      <p>Based on your results, we have personalized recommendations to help improve your marketing strategy.</p>
      <p>Best regards,<br>The CDM Suite Team</p>
    `,
  });
}

/**
 * Send signup notification to admin
 */
export async function sendSignupNotification(data: { 
  email: string; 
  name: string; 
  tier: string;
  company?: string;
  phone?: string;
  referralCode?: string;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "hello@cdmsuite.com";
  const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://cdmsuite.com'}/admin`;
  
  return sendEmail({
    to: adminEmail,
    subject: `🎉 New Signup: ${data.name} (${data.tier} tier)`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Signup Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 20px;">
                        CDM Suite
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Success Icon -->
                  <tr>
                    <td style="padding: 0 40px; text-align: center;">
                      <div style="background-color: #dcfce7; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">🎉</span>
                      </div>
                      <h1 style="margin: 0 0 10px; font-size: 28px; color: #111827;">New User Signup!</h1>
                      <p style="margin: 0 0 30px; font-size: 16px; color: #6b7280;">
                        A new user has registered for CDM Suite
                      </p>
                    </td>
                  </tr>
                  
                  <!-- User Details -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                          User Information
                        </h2>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">Name:</td>
                            <td style="padding: 10px 0; color: #111827; font-weight: 600;">${data.name || 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Email:</td>
                            <td style="padding: 10px 0; color: #111827; font-weight: 600;">
                              <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
                            </td>
                          </tr>
                          ${data.phone ? `
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Phone:</td>
                            <td style="padding: 10px 0; color: #111827; font-weight: 600;">
                              <a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none;">${data.phone}</a>
                            </td>
                          </tr>
                          ` : ''}
                          ${data.company ? `
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Company:</td>
                            <td style="padding: 10px 0; color: #111827; font-weight: 600;">${data.company}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Tier:</td>
                            <td style="padding: 10px 0;">
                              <span style="background-color: ${
                                data.tier === 'enterprise' ? '#dcfce7' :
                                data.tier === 'pro' ? '#dbeafe' :
                                data.tier === 'starter' ? '#fef3c7' :
                                '#f3f4f6'
                              }; color: ${
                                data.tier === 'enterprise' ? '#166534' :
                                data.tier === 'pro' ? '#1e40af' :
                                data.tier === 'starter' ? '#92400e' :
                                '#374151'
                              }; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                ${data.tier}
                              </span>
                            </td>
                          </tr>
                          ${data.referralCode ? `
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Referral Code:</td>
                            <td style="padding: 10px 0; color: #111827; font-weight: 600; font-family: monospace; background-color: #fef3c7; padding: 4px 8px; border-radius: 4px;">
                              ${data.referralCode}
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Signup Time:</td>
                            <td style="padding: 10px 0; color: #111827; font-weight: 600;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</td>
                          </tr>
                        </table>
                      </div>
                      
                      ${data.tier === 'starter' ? `
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">
                          ⏰ Trial Period Active
                        </p>
                        <p style="margin: 5px 0 0; font-size: 13px; color: #92400e;">
                          This user has a 7-day trial period. Follow up before expiration.
                        </p>
                      </div>
                      ` : ''}
                      
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${dashboardUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                          View in Admin Dashboard
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Action Items -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px;">
                        <h3 style="margin: 0 0 15px; font-size: 16px; color: #1e40af;">📋 Recommended Next Steps</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8; font-size: 14px;">
                          <li>Send a personalized welcome email or call</li>
                          <li>Schedule an onboarding call if appropriate</li>
                          <li>Review their account and credit allocation</li>
                          <li>Monitor for first project creation</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                        This is an automated notification from CDM Suite
                      </p>
                      <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
                        © 2025 CDM Suite. All rights reserved.
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
    tags: [
      { name: 'category', value: 'admin_notification' },
      { name: 'type', value: 'new_signup' },
      { name: 'tier', value: data.tier },
    ],
  });
}

/**
 * HTML Email Template Generator for Tool Results
 */
export function getToolResultsEmail(toolName: string, name: string, email: string, results: any, tripwireOffer: any): string {
  const scoreColor = results.score >= 80 ? '#10b981' : results.score >= 60 ? '#f59e0b' : '#ef4444';
  const baseUrl = process.env.NEXTAUTH_URL || 'https://cdmsuite.abacusai.app';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your ${toolName} Results</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 20px;">
                      CDM Suite
                    </div>
                  </td>
                </tr>
                
                <!-- Score Section -->
                <tr>
                  <td style="padding: 0 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; color: #111827; text-align: center;">Your ${toolName} Results Are Ready! 🎯</h1>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #4b5563;">
                      Hi ${name},
                    </p>
                    
                    <div style="text-align: center; padding: 30px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                      <div style="font-size: 48px; font-weight: bold; color: ${scoreColor};">
                        ${results.score || results.overallScore || 'N/A'}/100
                      </div>
                      <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">
                        ${results.score < 70 ? '⚠️ Your website needs immediate attention!' : results.score < 85 ? '✅ Good start, but there\'s room for improvement!' : '🎉 Excellent! You\'re doing great!'}
                      </div>
                    </div>
                  </td>
                </tr>
                
                <!-- Details Section -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h3 style="margin: 0 0 15px; font-size: 18px; color: #111827;">📊 Key Findings</h3>
                    ${generateDetailsHTML(toolName, results)}
                  </td>
                </tr>
                
                <!-- Special Offer Section -->
                ${tripwireOffer ? `
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 30px; margin: 20px 0;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <span style="background-color: #dc2626; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                          ${tripwireOffer.urgency || 'LIMITED TIME OFFER'}
                        </span>
                      </div>
                      
                      <h2 style="margin: 0 0 15px; font-size: 24px; color: #111827; text-align: center;">
                        🎁 ${tripwireOffer.title}
                      </h2>
                      
                      <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #2563eb;">
                          $${tripwireOffer.discountPrice}
                        </span>
                        <span style="font-size: 20px; color: #6b7280; text-decoration: line-through; margin-left: 10px;">
                          $${tripwireOffer.originalPrice}
                        </span>
                        <div style="color: #059669; font-weight: 600; margin-top: 5px;">
                          Save $${tripwireOffer.savings}!
                        </div>
                      </div>
                      
                      <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <ul style="margin: 0; padding-left: 20px; color: #374151;">
                          ${tripwireOffer.features.map((f: string) => `<li style="margin-bottom: 8px;">${f}</li>`).join('')}
                        </ul>
                      </div>
                      
                      <div style="text-align: center; margin-top: 25px;">
                        <a href="${baseUrl}/api/create-tripwire-checkout?offer=${encodeURIComponent(tripwireOffer.offerName)}&email=${encodeURIComponent(email)}" 
                           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          ${tripwireOffer.cta}
                        </a>
                      </div>
                      
                      <p style="text-align: center; font-size: 12px; color: #6b7280; margin: 15px 0 0;">
                        ⚡ This exclusive offer expires in 48 hours
                      </p>
                    </div>
                  </td>
                </tr>
                ` : ''}
                
                <!-- CTA Section -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280; text-align: center;">
                      Questions about your results or our services?<br>
                      Call us at <a href="tel:+18622727623" style="color: #2563eb; text-decoration: none; font-weight: 600;">(862) 272-7623</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                      © 2025 CDM Suite. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
                      Reply to: <a href="mailto:hello@cdmsuite.com" style="color: #2563eb; text-decoration: none;">hello@cdmsuite.com</a>
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

function generateDetailsHTML(toolName: string, results: any): string {
  // Generate tool-specific details based on results
  if (toolName.toLowerCase().includes('seo')) {
    return `
      <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 15px;">
        <p style="margin: 0 0 10px; font-weight: 600; color: #1e40af;">Title Tag:</p>
        <p style="margin: 0; font-size: 14px; color: #4b5563;">${results.titleTag?.status || 'Check your title tag optimization'}</p>
      </div>
      <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 15px;">
        <p style="margin: 0 0 10px; font-weight: 600; color: #1e40af;">Meta Description:</p>
        <p style="margin: 0; font-size: 14px; color: #4b5563;">${results.metaDescription?.status || 'Optimize your meta description'}</p>
      </div>
      ${results.issues && results.issues.length > 0 ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 15px;">
        <p style="margin: 0 0 10px; font-weight: 600; color: #991b1b;">🚨 Critical Issues:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
          ${results.issues.slice(0, 3).map((issue: string) => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    `;
  }
  
  // Generic details for other tools
  return `
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
        ${results.summary || 'We\'ve analyzed your data and identified key opportunities for improvement.'}
      </p>
    </div>
  `;
}

/**
 * Order Confirmation Email with Login Details
 */
export function getOrderConfirmationEmail(data: {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  amount: number;
  orderId: string;
  isNewUser?: boolean;
  temporaryPassword?: string;
}): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://cdmsuite.abacusai.app';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - CDM Suite</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 20px;">
                      CDM Suite
                    </div>
                  </td>
                </tr>
                
                <!-- Success Icon -->
                <tr>
                  <td style="padding: 0 40px; text-align: center;">
                    <div style="background-color: #dcfce7; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">✓</span>
                    </div>
                    <h1 style="margin: 0 0 10px; font-size: 28px; color: #111827;">Order Confirmed!</h1>
                    <p style="margin: 0 0 30px; font-size: 16px; color: #6b7280;">
                      Thank you for your purchase, ${data.customerName}!
                    </p>
                  </td>
                </tr>
                
                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <h2 style="margin: 0 0 20px; font-size: 18px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        Order Summary
                      </h2>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Service:</td>
                          <td style="padding: 10px 0; color: #111827; font-weight: 600; text-align: right;">${data.serviceName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                          <td style="padding: 10px 0; color: #111827; font-weight: 600; text-align: right; font-size: 20px; color: #2563eb;">$${data.amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Order ID:</td>
                          <td style="padding: 10px 0; color: #6b7280; font-family: monospace; font-size: 12px; text-align: right;">${data.orderId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Email:</td>
                          <td style="padding: 10px 0; color: #111827; text-align: right;">${data.customerEmail}</td>
                        </tr>
                      </table>
                    </div>
                    
                    ${data.isNewUser && data.temporaryPassword ? `
                    <!-- Login Credentials -->
                    <div style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border: 2px solid #2563eb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <h2 style="margin: 0 0 15px; font-size: 18px; color: #1e40af;">
                        🔐 Your Dashboard Access
                      </h2>
                      <p style="margin: 0 0 15px; font-size: 14px; color: #1e3a8a;">
                        We've created your account! Use these credentials to access your dashboard:
                      </p>
                      
                      <div style="background-color: white; border-radius: 6px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Email:</p>
                        <p style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #111827;">${data.customerEmail}</p>
                        
                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Temporary Password:</p>
                        <p style="margin: 0; font-size: 16px; font-family: monospace; font-weight: 600; color: #111827; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
                          ${data.temporaryPassword}
                        </p>
                      </div>
                      
                      <p style="margin: 15px 0 0; font-size: 12px; color: #1e3a8a;">
                        ⚠️ Please change your password after your first login for security.
                      </p>
                      
                      <div style="text-align: center; margin-top: 20px;">
                        <a href="${baseUrl}/auth/login" 
                           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                          Access Your Dashboard →
                        </a>
                      </div>
                    </div>
                    ` : `
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${baseUrl}/dashboard/my-services" 
                         style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        View Your Services →
                      </a>
                    </div>
                    `}
                    
                    <!-- What's Next -->
                    <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px;">
                      <h3 style="margin: 0 0 15px; font-size: 16px; color: #1e40af;">📋 What Happens Next?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
                        <li>Our team will reach out within 24 hours</li>
                        <li>We'll schedule a kickoff call to discuss your project</li>
                        <li>You'll receive regular updates on progress</li>
                        <li>Track everything in your dashboard</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- Contact Section -->
                <tr>
                  <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280; text-align: center;">
                      Have questions? We're here to help!
                    </p>
                    <div style="text-align: center;">
                      <a href="tel:+18622727623" style="color: #2563eb; text-decoration: none; font-weight: 600; margin-right: 20px;">
                        📞 (862) 272-7623
                      </a>
                      <a href="mailto:hello@cdmsuite.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">
                        ✉️ hello@cdmsuite.com
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                      © 2025 CDM Suite. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
                      This is an automated receipt for your purchase.
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
