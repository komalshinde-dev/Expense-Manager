const sgMail = require('@sendgrid/mail');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Notification = require('../models/Notification');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class NotificationService {
  // ===============================
  // MAIN REMINDER HANDLER
  // ===============================
  async sendReminder(reminder, user) {
    const results = {
      email: null,
      push: null,
      inApp: null,
      success: false
    };

    try {
      // EMAIL NOTIFICATION
      if (reminder.notificationChannels?.email) {
        const emailTo = reminder.notificationEmail || user.email;
        if (!emailTo) throw new Error('No recipient email found');

        console.log(`📧 Sending email to: ${emailTo}`);
        results.email = await this.sendEmailNotification(reminder, user, emailTo);
      }

      // PUSH (optional)
      if (reminder.notificationChannels?.push) {
        results.push = await this.sendPushNotification(reminder, user);
      }

      // IN-APP (optional)
      if (reminder.notificationChannels?.inApp) {
        results.inApp = await this.createInAppNotification(reminder, user);
      }

      results.success = true;
      return results;
    } catch (error) {
      console.error('❌ Reminder notification failed:', error.message);
      results.error = error.message;
      return results;
    }
  }

  // ===============================
  // SENDGRID EMAIL
  // ===============================
  async sendEmailNotification(reminder, user, emailTo) {
    const dueDate = reminder.nextDueDate || reminder.dueDate;
    const formattedDate = new Date(dueDate).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(reminder.amount);

    const msg = {
      to: emailTo,
      from: process.env.FROM_EMAIL,
      subject: `💰 Reminder: ${reminder.title} (${formattedAmount})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#14B8A6;">💰 Payment Reminder</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>This is a reminder for your upcoming payment:</p>
          <table style="margin: 15px 0;">
            <tr><td><strong>Title:</strong></td><td>${reminder.title}</td></tr>
            <tr><td><strong>Amount:</strong></td><td>${formattedAmount}</td></tr>
            <tr><td><strong>Due Date:</strong></td><td>${formattedDate}</td></tr>
            <tr><td><strong>Type:</strong></td><td>${reminder.type}</td></tr>
          </table>
          ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
          <a href="${process.env.FRONTEND_URL}/reminders" 
            style="display:inline-block;padding:10px 20px;background:#14B8A6;color:white;text-decoration:none;border-radius:5px;">
            View Reminders
          </a>
        </div>
      `
    };

    try {
      const info = await sgMail.send(msg);
      console.log(`✅ Email sent to ${emailTo}`);
      return { success: true, sentTo: emailTo };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ===============================
  // PUSH NOTIFICATION (OPTIONAL)
  // ===============================
  async sendPushNotification(reminder, user) {
    // Implement if you have OneSignal / FCM configured
    return { success: true };
  }

  // ===============================
  // IN-APP NOTIFICATION
  // ===============================
  async createInAppNotification(reminder, user) {
    try {
      const dueDate = reminder.nextDueDate || reminder.dueDate;
      const notification = await Notification.create({
        user: user._id,
        type: 'reminder',
        title: `Payment Reminder: ${reminder.title}`,
        message: `${reminder.title} (₹${reminder.amount}) due on ${new Date(dueDate).toLocaleDateString()}`,
        relatedId: reminder._id,
        relatedType: 'Reminder',
        priority: 'normal'
      });

      return { success: true, notificationId: notification._id };
    } catch (error) {
      console.error('❌ In-app notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ===============================
  // TEST EMAIL
  // ===============================
  async sendTestEmail(email) {
    try {
      await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: '✅ Email Notifications Working',
        html: `<h3>Your email configuration is working successfully 🎉</h3>`
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
