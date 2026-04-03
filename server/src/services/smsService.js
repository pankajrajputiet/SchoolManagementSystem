const twilio = require('twilio');
const logger = require('../config/logger');

class SMSService {
  constructor() {
    this.client = null;
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER;
    this.isEnabled = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    
    if (this.isEnabled) {
      try {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        logger.info('Twilio SMS service initialized');
      } catch (error) {
        logger.error(`Failed to initialize Twilio: ${error.message}`);
        this.isEnabled = false;
      }
    } else {
      logger.warn('SMS service disabled: Missing Twilio credentials');
    }
  }

  /**
   * Send a single SMS message
   */
  async sendSingleSMS(phoneNumber, message) {
    if (!this.isEnabled) {
      logger.warn(`SMS not sent (service disabled): ${phoneNumber} - ${message}`);
      return {
        success: false,
        messageId: null,
        error: 'SMS service not configured',
        phone: phoneNumber,
        message,
      };
    }

    try {
      // Format phone number (ensure E.164 format)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to: formattedPhone,
      });

      logger.info(`SMS sent successfully to ${formattedPhone}: ${result.sid}`);
      
      return {
        success: true,
        messageId: result.sid,
        error: null,
        phone: formattedPhone,
        message,
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
      
      return {
        success: false,
        messageId: null,
        error: error.message,
        phone: phoneNumber,
        message,
      };
    }
  }

  /**
   * Send SMS to multiple recipients
   */
  async sendBulkSMS(recipients, message) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSingleSMS(recipient.phone, message);
      result.recipient = recipient.studentId;
      result.studentName = recipient.studentName;
      results.push(result);
      
      // Add small delay to avoid rate limiting
      await this.sleep(100);
    }
    
    return results;
  }

  /**
   * Get message template by category
   */
  getTemplate(category, data = {}) {
    const templates = {
      fees: `Dear ${data.parentName || 'Parent'}, this is a reminder that the school fees for ${data.studentName || 'your ward'} (Class: ${data.className || 'N/A'}) is due. Amount: ₹${data.amount || '0'}. Please pay by ${data.dueDate || 'the due date'}. - ${data.schoolName || 'School'}`,
      
      vacation: `Dear ${data.parentName || 'Parent'}, this is to inform you that school will remain closed from ${data.startDate || 'mentioned date'} to ${data.endDate || 'mentioned date'} on account of ${data.reason || 'vacation'}. School will resume on ${data.reopeningDate || 'mentioned date'}. - ${data.schoolName || 'School'}`,
      
      exam: `Dear ${data.parentName || 'Parent'}, the ${data.examType || 'exam'} for ${data.studentName || 'your ward'} (Class: ${data.className || 'N/A'}) will be held from ${data.startDate || 'start date'} to ${data.endDate || 'end date'}. Please ensure regular study. Timetable shared in school portal. - ${data.schoolName || 'School'}`,
      
      absence: `Dear ${data.parentName || 'Parent'}, we noticed that ${data.studentName || 'your ward'} (Class: ${data.className || 'N/A'}) has been absent for ${data.absentDays || 'several'} days. Please contact the school or ensure regular attendance. - ${data.schoolName || 'School'}`,
      
      emergency: `URGENT - Dear ${data.parentName || 'Parent'}, ${data.message || 'Please contact the school immediately.'}. For queries, call ${data.schoolPhone || 'school office'}. - ${data.schoolName || 'School'}`,
      
      custom: data.message || '',
    };

    return templates[category] || '';
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (default: India +91)
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else if (cleaned.length === 12 && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+91' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      hasCredentials: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      fromPhone: this.fromPhone || 'Not configured',
    };
  }
}

module.exports = new SMSService();
