
/**
 * SMS Service using SMSMode API
 * Docs: https://dev.smsmode.com/
 */

interface SMSSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SMSStatus {
  status: string;
  delivered: boolean;
  timestamp: Date;
}

class SMSModeService {
  private apiKey: string;
  private baseUrl = 'https://api.smsmode.com/http/1.6';

  constructor() {
    this.apiKey = process.env.SMSMODE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('SMSMode API key not configured');
    }
  }

  /**
   * Send an SMS message
   * @param to - Phone number in international format (e.g., +1234567890)
   * @param message - Message content
   * @param from - Optional sender name (11 chars max)
   */
  async sendSMS(
    to: string,
    message: string,
    from: string = 'CDM Suite'
  ): Promise<SMSSendResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    try {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = to.replace(/[^\d+]/g, '');

      // SMSMode API expects phone without + prefix
      const phoneNumber = cleanPhone.startsWith('+') 
        ? cleanPhone.substring(1) 
        : cleanPhone;

      const params = new URLSearchParams({
        accessToken: this.apiKey,
        message: message,
        numero: phoneNumber,
        emetteur: from.substring(0, 11), // Max 11 chars
      });

      const response = await fetch(`${this.baseUrl}/sendSMS.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const text = await response.text();

      // SMSMode returns codes: 0 = success, other = error
      if (text.startsWith('0')) {
        // Format: 0 | messageId
        const messageId = text.split('|')[1]?.trim() || text;
        return {
          success: true,
          messageId,
        };
      } else {
        // Error codes from SMSMode
        const errorMessages: Record<string, string> = {
          '2': 'Missing parameter',
          '3': 'Invalid parameter',
          '5': 'Authentication error',
          '10': 'Insufficient credits',
          '11': 'Recipient count exceeds limit',
          '32': 'Invalid characters in message',
          '35': 'Invalid phone number',
        };

        const errorCode = text.split('|')[0]?.trim() || text;
        const errorMessage = errorMessages[errorCode] || `SMS send failed: ${text}`;

        console.error('SMSMode error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check SMS delivery status
   * @param messageId - The message ID returned from sendSMS
   */
  async getDeliveryStatus(messageId: string): Promise<SMSStatus | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        accessToken: this.apiKey,
        smsID: messageId,
      });

      const response = await fetch(`${this.baseUrl}/compteRendu.do?${params}`, {
        method: 'GET',
      });

      const text = await response.text();

      // Status codes: 0=sent, 1=delivered, 2=failed, 3=waiting
      const statusMap: Record<string, string> = {
        '0': 'sent',
        '1': 'delivered',
        '2': 'failed',
        '3': 'waiting',
      };

      const statusCode = text.split('|')[0]?.trim() || text;
      const status = statusMap[statusCode] || 'unknown';

      return {
        status,
        delivered: status === 'delivered',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('SMS status check error:', error);
      return null;
    }
  }

  /**
   * Get account balance/credits
   */
  async getBalance(): Promise<number | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        accessToken: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/credit.do?${params}`, {
        method: 'GET',
      });

      const text = await response.text();
      const balance = parseFloat(text);

      return isNaN(balance) ? null : balance;
    } catch (error) {
      console.error('Balance check error:', error);
      return null;
    }
  }
}

// Lazy SMS client accessor to avoid build-time side effects
let smsClient: SMSModeService | null = null;

function getSmsModeClient(): SMSModeService | null {
  const apiKey = process.env.SMSMODE_API_KEY;
  if (!apiKey) {
    console.warn('SMSMode API key not configured');
    return null;
  }

  if (!smsClient) {
    smsClient = new SMSModeService();
  }

  return smsClient;
}

export const smsService = {
  async sendSMS(
    to: string,
    message: string,
    from: string = 'CDM Suite'
  ): Promise<SMSSendResponse> {
    const client = getSmsModeClient();
    if (!client) {
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    return client.sendSMS(to, message, from);
  },

  async getDeliveryStatus(messageId: string): Promise<SMSStatus | null> {
    const client = getSmsModeClient();
    if (!client) {
      return null;
    }

    return client.getDeliveryStatus(messageId);
  },

  async getBalance(): Promise<number | null> {
    const client = getSmsModeClient();
    if (!client) {
      return null;
    }

    return client.getBalance();
  },
};

// Export types
export type { SMSSendResponse, SMSStatus };
