const axios = require('axios');

class NotificationService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.fromEmail = process.env.SMTP_FROM_EMAIL;
    this.fromName = process.env.SMTP_FROM_NAME;

    if (!this.apiKey) {
      console.error('❌ BREVO_API_KEY is missing');
    } else {
      console.log('✅ Brevo API key loaded');
    }
  }

  async sendReminder(reminder, user) {
    try {
      if (!reminder.notificationChannels?.email) {
        return { success: false };
      }

      const toEmail = reminder.notificationEmail || user.email;
      if (!toEmail) throw new Error('No recipient email');

      await this.sendEmailNotification(reminder, user, toEmail);
      return { success: true };

    } catch (error) {
      console.error('❌ Reminder notification failed:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendEmailNotification(reminder, user, emailTo) {
    const dueDate = reminder.nextDueDate || reminder.dueDate;

    const formattedDate = new Date(dueDate).toLocaleString('en-IN');
    const formattedAmount = `₹${reminder.amount}`;

    const htmlContent = `
      <h2>💰 Payment Reminder</h2>
      <p>Hello <b>${user.name}</b>,</p>
      <p>This is a reminder for:</p>
      <ul>
        <li><b>Title:</b> ${reminder.title}</li>
        <li><b>Amount:</b> ${formattedAmount}</li>
        <li><b>Due Date:</b> ${formattedDate}</li>
      </ul>
      <p>
        <a href="${process.env.FRONTEND_URL}/reminders">
          View Reminders
        </a>
      </p>
    `;

    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: this.fromEmail,
          name: this.fromName,
        },
        to: [{ email: emailTo }],
        subject: `Reminder: ${reminder.title}`,
        htmlContent,
      },
      {
        headers: {
          'api-key': this.apiKey,          // 🔴 MUST be api-key
          'accept': 'application/json',
          'content-type': 'application/json',
        },
      }
    );

    console.log(`✅ Email sent to ${emailTo}`);
  }
}

module.exports = new NotificationService();

