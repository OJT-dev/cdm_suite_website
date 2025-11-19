/**
 * Sequence Execution Engine
 * Processes sequence steps and executes actions (email, SMS, tasks)
 */

import { prisma } from '@/lib/db';
import { emailService } from '@/lib/email';
import { smsService } from '@/lib/sms';

interface ExecutionResult {
  success: boolean;
  error?: string;
  details?: any;
}

class SequenceExecutor {
  /**
   * Process all active sequence assignments and execute pending steps
   */
  async processSequences(): Promise<{
    processed: number;
    executed: number;
    failed: number;
  }> {
    const stats = { processed: 0, executed: 0, failed: 0 };

    try {
      // Find all active sequence assignments
      const activeAssignments = await prisma.sequenceAssignment.findMany({
        where: {
          status: 'active',
          completedAt: null,
        },
        include: {
          lead: true,
          sequence: {
            include: {
              steps: {
                orderBy: { order: 'asc' },
                where: { active: true },
              },
            },
          },
        },
      });

      console.log(`Found ${activeAssignments.length} active sequence assignments`);
      stats.processed = activeAssignments.length;

      for (const assignment of activeAssignments) {
        try {
          const executed = await this.processAssignment(assignment);
          if (executed) {
            stats.executed++;
          }
        } catch (error) {
          console.error(
            `Error processing sequence assignment ${assignment.id}:`,
            error
          );
          stats.failed++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Error in sequence processing:', error);
      throw error;
    }
  }

  /**
   * Process a single sequence assignment
   */
  private async processAssignment(assignment: any): Promise<boolean> {
    const { lead, sequence, currentStep } = assignment;
    const steps = sequence.steps;

    if (!steps || steps.length === 0) {
      console.log(`No steps found for sequence ${sequence.id}`);
      return false;
    }

    // Get the step to execute
    const stepToExecute = steps.find((s: any) => s.order === currentStep);

    if (!stepToExecute) {
      // Sequence completed
      await this.completeAssignment(assignment.id);
      return false;
    }

    // Check if it's time to execute this step
    const shouldExecute = await this.shouldExecuteStep(assignment, stepToExecute);

    if (!shouldExecute) {
      return false;
    }

    // Execute the step
    const result = await this.executeStep(lead, stepToExecute);

    // Log the activity
    await prisma.sequenceActivity.create({
      data: {
        assignmentId: assignment.id,
        stepOrder: stepToExecute.order,
        actionType: this.getActionType(stepToExecute.stepType, result.success),
        result: result.details ? JSON.stringify(result.details) : null,
        messageId: result.details?.messageId,
        error: result.error,
      },
    });

    // Update metrics
    await this.updateMetrics(assignment, stepToExecute, result.success);

    if (result.success) {
      // Move to next step
      const nextStepOrder = currentStep + 1;
      const nextStep = steps.find((s: any) => s.order === nextStepOrder);

      if (!nextStep) {
        // Sequence completed
        await this.completeAssignment(assignment.id);
      } else {
        // Move to next step
        await prisma.sequenceAssignment.update({
          where: { id: assignment.id },
          data: {
            currentStep: nextStepOrder,
            stepsCompleted: { increment: 1 },
            startedAt: assignment.startedAt || new Date(),
          },
        });
      }

      return true;
    } else {
      // Handle failure
      console.error(
        `Step execution failed for lead ${lead.id}, step ${stepToExecute.order}:`,
        result.error
      );

      return false;
    }
  }

  /**
   * Get action type based on step type and success
   */
  private getActionType(stepType: string, success: boolean): string {
    if (!success) {
      return `${stepType.toLowerCase()}_failed`;
    }
    return `${stepType.toLowerCase()}_sent`;
  }

  /**
   * Check if a step should be executed based on timing
   */
  private async shouldExecuteStep(assignment: any, step: any): Promise<boolean> {
    const now = new Date();

    // If this is the first step and assignment just started
    if (assignment.currentStep === 0 || !assignment.startedAt) {
      return true;
    }

    // Get the last activity for this assignment
    const lastActivity = await prisma.sequenceActivity.findFirst({
      where: { assignmentId: assignment.id },
      orderBy: { timestamp: 'desc' },
    });

    if (!lastActivity) {
      return true;
    }

    // Calculate when the step should execute based on delay
    const delayAmount = step.delayAmount || 0;
    const delayUnit = step.delayUnit || 'hours';

    const delayInMs = this.getDelayInMilliseconds(delayAmount, delayUnit);
    const executeAt = new Date(lastActivity.timestamp.getTime() + delayInMs);

    return now >= executeAt;
  }

  /**
   * Convert delay to milliseconds
   */
  private getDelayInMilliseconds(amount: number, unit: string): number {
    const multipliers: Record<string, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
    };

    return amount * (multipliers[unit] || multipliers.hours);
  }

  /**
   * Execute a sequence step
   */
  private async executeStep(lead: any, step: any): Promise<ExecutionResult> {
    console.log(
      `Executing step ${step.order} (${step.stepType}) for lead ${lead.email}`
    );

    try {
      switch (step.stepType.toLowerCase()) {
        case 'email':
          return await this.executeEmailStep(lead, step);

        case 'sms':
          return await this.executeSMSStep(lead, step);

        case 'task':
        case 'reminder':
        case 'note':
          return await this.executeTaskStep(lead, step);

        case 'delay':
          // Delay steps are handled by delayAmount
          return { success: true };

        default:
          return {
            success: false,
            error: `Unknown step type: ${step.stepType}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute an email step
   */
  private async executeEmailStep(lead: any, step: any): Promise<ExecutionResult> {
    if (!lead.email) {
      return { success: false, error: 'Lead has no email address' };
    }

    // Personalize the email content
    const personalizedSubject = this.personalizeContent(
      step.subject || step.title || 'Message from CDM Suite',
      lead
    );
    const personalizedBody = this.personalizeContent(
      step.content || '',
      lead
    );

    // Send email
    const result = await emailService.sendEmail({
      to: lead.email,
      subject: personalizedSubject,
      html: this.formatEmailHTML(personalizedBody),
      tags: [
        { name: 'lead_id', value: lead.id },
        { name: 'step_order', value: step.order.toString() },
      ],
    });

    if (result.success) {
      // Create activity record
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'email',
          title: 'Sequence email sent',
          description: `Sent: ${personalizedSubject}`,
          metadata: JSON.stringify({ stepTitle: step.title }),
        },
      });
    }

    return result;
  }

  /**
   * Execute an SMS step
   */
  private async executeSMSStep(lead: any, step: any): Promise<ExecutionResult> {
    if (!lead.phone) {
      return { success: false, error: 'Lead has no phone number' };
    }

    // Personalize the SMS content
    const personalizedMessage = this.personalizeContent(
      step.content || '',
      lead
    );

    // Send SMS
    const result = await smsService.sendSMS(lead.phone, personalizedMessage);

    if (result.success) {
      // Create activity record
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'call',
          title: 'Sequence SMS sent',
          description: `SMS: ${step.title}`,
          metadata: JSON.stringify({ stepTitle: step.title }),
        },
      });
    }

    return result;
  }

  /**
   * Execute a task step
   */
  private async executeTaskStep(lead: any, step: any): Promise<ExecutionResult> {
    try {
      // Create a task/activity for the assigned user
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'note',
          title: step.title || 'Follow up task',
          description: step.content || '',
          createdById: lead.assignedToId || undefined,
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Personalize content with lead data
   */
  private personalizeContent(content: string, lead: any): string {
    return content
      .replace(/\{\{name\}\}/g, lead.name || '')
      .replace(/\{\{email\}\}/g, lead.email || '')
      .replace(/\{\{phone\}\}/g, lead.phone || '')
      .replace(/\{\{company\}\}/g, lead.company || '');
  }

  /**
   * Format email body as HTML
   */
  private formatEmailHTML(body: string): string {
    // Convert line breaks to <br> tags
    const formattedBody = body.replace(/\n/g, '<br>');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="padding: 20px 0;">
          ${formattedBody}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>CDM Suite - Creating Digital Magic</p>
          <p>This email was sent as part of an automated sequence.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Complete a sequence assignment
   */
  private async completeAssignment(assignmentId: string): Promise<void> {
    await prisma.sequenceAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    console.log(`Sequence assignment ${assignmentId} completed`);
  }

  /**
   * Update sequence assignment metrics
   */
  private async updateMetrics(
    assignment: any,
    step: any,
    success: boolean
  ): Promise<void> {
    // Increment execution count
    const updateData: any = {};

    const stepType = step.stepType.toLowerCase();

    if (stepType === 'email') {
      updateData.emailsSent = { increment: 1 };
    } else if (stepType === 'task' || stepType === 'reminder' || stepType === 'note') {
      updateData.tasksCreated = { increment: 1 };
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.sequenceAssignment.update({
        where: { id: assignment.id },
        data: updateData,
      });
    }
  }

  /**
   * Handle email opened event
   */
  async handleEmailOpened(messageId: string): Promise<void> {
    // Find the activity by message ID
    const activity = await prisma.sequenceActivity.findFirst({
      where: { messageId },
      include: { assignment: true },
    });

    if (!activity) {
      console.log(`No activity found for message ID: ${messageId}`);
      return;
    }

    // Update the activity
    await prisma.sequenceActivity.update({
      where: { id: activity.id },
      data: { openedAt: new Date() },
    });

    // Update assignment metrics
    await prisma.sequenceAssignment.update({
      where: { id: activity.assignmentId },
      data: { emailsOpened: { increment: 1 } },
    });

    console.log(`Email opened: ${messageId}`);
  }

  /**
   * Handle email clicked event
   */
  async handleEmailClicked(messageId: string): Promise<void> {
    // Find the activity by message ID
    const activity = await prisma.sequenceActivity.findFirst({
      where: { messageId },
      include: { assignment: { include: { lead: true } } },
    });

    if (!activity) {
      console.log(`No activity found for message ID: ${messageId}`);
      return;
    }

    // Update the activity
    await prisma.sequenceActivity.update({
      where: { id: activity.id },
      data: { clickedAt: new Date() },
    });

    // Update assignment metrics
    await prisma.sequenceAssignment.update({
      where: { id: activity.assignmentId },
      data: { emailsClicked: { increment: 1 } },
    });

    // Update lead score
    await prisma.lead.update({
      where: { id: activity.assignment.leadId },
      data: { score: { increment: 10 } },
    });

    console.log(`Email clicked: ${messageId}`);
  }

  /**
   * Handle email replied event
   */
  async handleEmailReplied(messageId: string): Promise<void> {
    // Find the activity by message ID
    const activity = await prisma.sequenceActivity.findFirst({
      where: { messageId },
      include: { assignment: { include: { lead: true } } },
    });

    if (!activity) {
      console.log(`No activity found for message ID: ${messageId}`);
      return;
    }

    // Update the activity
    await prisma.sequenceActivity.update({
      where: { id: activity.id },
      data: { repliedAt: new Date() },
    });

    // Update assignment metrics
    await prisma.sequenceAssignment.update({
      where: { id: activity.assignmentId },
      data: {
        emailsReplied: { increment: 1 },
        status: 'paused', // Pause sequence on reply
      },
    });

    // Update lead score and status
    await prisma.lead.update({
      where: { id: activity.assignment.leadId },
      data: {
        status: 'qualified',
        score: { increment: 25 },
      },
    });

    // Create activity
    await prisma.leadActivity.create({
      data: {
        leadId: activity.assignment.leadId,
        type: 'email',
        title: 'Lead replied to sequence email',
        description: 'Sequence automatically paused due to reply',
      },
    });

    console.log(`Email replied: ${messageId}`);
  }
}

// Export singleton instance
export const sequenceExecutor = new SequenceExecutor();

// Export main function for cron job
export async function processSequenceQueue() {
  return await sequenceExecutor.processSequences();
}

// Export webhook handlers
export async function trackEmailOpen(messageId: string) {
  return await sequenceExecutor.handleEmailOpened(messageId);
}

export async function trackEmailClick(messageId: string) {
  return await sequenceExecutor.handleEmailClicked(messageId);
}

export async function trackEmailReply(messageId: string) {
  return await sequenceExecutor.handleEmailReplied(messageId);
}
