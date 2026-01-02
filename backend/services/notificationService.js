const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class NotificationService {
  async sendReminder(reminder, user) {
    const emailTo = reminder.notificationEmail || user.email;
    if (!emailTo) return { success: false, error: 'No recipient email' };

    const msg = {
      to: emailTo,
      from: {
        name: process.env.SMTP_FROM_NAME,
        email: process.env.SMTP_FROM_EMAIL,
      },
      subject: `💰 Reminder: ${reminder.title} (₹${reminder.amount})`,
      html: `
        <h2>💰 Payment Reminder</h2>
        <p>Hello ${user.name},</p>
        <p>This is a reminder for your upcoming payment:</p>
        <ul>
          <li>Title: ${reminder.title}</li>
          <li>Amount: ₹${reminder.amount}</li>
          <li>Due Date: ${new Date(reminder.dueDate).toLocaleString()}</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/reminders">View Reminders</a>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${emailTo}`);
      return { success: true };
    } catch (error) {
      console.error('❌ SendGrid email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTestEmail(email) {
    return this.sendReminder({ title: 'Test Reminder', amount: 0, dueDate: new Date() }, { name: 'Test', email });
  }
}

module.exports = new NotificationService();
