const sgMail = require('@sendgrid/mail');

class NotificationService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendReminder(reminder, user) {
    try {
      if (!reminder.notificationChannels?.email) return { success: true };

      const emailTo = reminder.notificationEmail || user.email;
      if (!emailTo) throw new Error('No recipient email found');

      const msg = {
        to: emailTo,
        from: {
          email: process.env.SMTP_FROM_EMAIL,
          name: process.env.SMTP_FROM_NAME,
        },
        subject: `💰 Reminder: ${reminder.title} (₹${reminder.amount})`,
        html: `
          <h2>Payment Reminder</h2>
          <p>Hello ${user.name},</p>
          <p>This is a reminder for your upcoming payment:</p>
          <ul>
            <li><strong>Title:</strong> ${reminder.title}</li>
            <li><strong>Amount:</strong> ₹${reminder.amount}</li>
            <li><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleString()}</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL}/reminders">View Reminders</a></p>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Email sent to ${emailTo}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Email sending failed:', error.response?.body || error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
