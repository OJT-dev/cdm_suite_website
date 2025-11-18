
/**
 * One-time script to send admin notifications for all existing users
 * who didn't receive a signup notification when they registered
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from './lib/email';

const prisma = new PrismaClient();

async function sendMissingNotifications() {
  try {
    console.log('🔍 Fetching all users...');
    
    // Get all users from the database
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Found ${users.length} total users`);
    
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@cdmsuite.com';
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://cdmsuite.com'}/admin`;
    
    let sentCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        const tierColor = 
          user.tier === 'enterprise' ? '#9333ea' :
          user.tier === 'pro' ? '#2563eb' :
          user.tier === 'starter' ? '#10b981' :
          '#6b7280';
        
        const tierLabel = 
          user.tier === 'enterprise' ? 'Enterprise' :
          user.tier === 'pro' ? 'Pro' :
          user.tier === 'starter' ? 'Starter' :
          'Free';
        
        const isTrialing = user.tier === 'starter' && user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
        
        const signupDate = user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'America/New_York'
        }) : 'Unknown';
        
        const html = `
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
                          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 0 0 20px;">
                            <h1 style="margin: 0 0 10px; font-size: 20px; color: #111827;">🎉 User Signup: ${user.name || 'New User'}</h1>
                            <div style="display: inline-block; background-color: ${tierColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                              ${tierLabel}
                            </div>
                            ${isTrialing ? '<div style="display: inline-block; background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-left: 8px;">TRIAL</div>' : ''}
                          </div>
                          
                          <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                            <h2 style="margin: 0 0 15px; font-size: 16px; color: #111827;">User Details</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">Name:</td>
                                <td style="padding: 10px 0; color: #111827; font-weight: 600;">${user.name || 'Not provided'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Email:</td>
                                <td style="padding: 10px 0; color: #111827; font-weight: 600;">${user.email}</td>
                              </tr>
                              ${user.company ? `<tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Company:</td>
                                <td style="padding: 10px 0; color: #111827;">${user.company}</td>
                              </tr>` : ''}
                              ${user.phone ? `<tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Phone:</td>
                                <td style="padding: 10px 0; color: #111827;">${user.phone}</td>
                              </tr>` : ''}
                              <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Signup Date:</td>
                                <td style="padding: 10px 0; color: #111827;">${signupDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Credits:</td>
                                <td style="padding: 10px 0; color: #111827;">${user.credits || 0}</td>
                              </tr>
                              ${user.referredBy ? `<tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Referred By:</td>
                                <td style="padding: 10px 0; color: #111827;">${user.referredBy}</td>
                              </tr>` : ''}
                            </table>
                          </div>
                          
                          ${isTrialing ? `
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #78350f;">
                              ⚠️ <strong>Trial Period:</strong> This user is on a 7-day trial. Trial ends on ${user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Unknown'}.
                            </p>
                          </div>
                          ` : ''}
                          
                          <div style="margin: 30px 0;">
                            <h2 style="margin: 0 0 15px; font-size: 16px; color: #111827;">Recommended Actions</h2>
                            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                              <li>Review user profile in admin dashboard</li>
                              ${isTrialing ? '<li>Monitor trial usage and engagement</li>' : ''}
                              <li>Send personalized welcome email if needed</li>
                              <li>Check for any support requests or questions</li>
                            </ul>
                          </div>
                          
                          <table role="presentation" style="margin: 30px 0;">
                            <tr>
                              <td style="border-radius: 6px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);">
                                <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                  View Admin Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                            © 2025 CDM Suite. All rights reserved.
                          </p>
                          <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
                            This is a retroactive notification for existing users.
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
        
        const success = await sendEmail({
          to: adminEmail,
          subject: `🎉 [Retroactive] User Signup: ${user.name || 'New User'} (${tierLabel} tier)`,
          html,
        });
        
        if (success) {
          sentCount++;
          console.log(`✅ [${sentCount}/${users.length}] Sent notification for: ${user.email}`);
        } else {
          errorCount++;
          console.error(`❌ Failed to send notification for: ${user.email}`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }
    
    console.log('\n✅ Notification sending complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Notifications sent: ${sentCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
sendMissingNotifications();
