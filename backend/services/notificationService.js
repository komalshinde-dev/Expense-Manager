const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // ===============================
    // EMAIL (SMTP) CONFIGURATION
    // ===============================
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true only for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // 🔥 Verify SMTP on server startup
    this.emailTransporter.verify((error) => {
      if (error) {
        console.error('❌ SMTP CONFIGURATION ERROR:', error.message);
      } else {
        console.log('✅ SMTP server is ready to send emails');
      }
    });

    // Optional push notification configs
    this.oneSignalAppId = process.env.ONESIGNAL_APP_ID;
    this.oneSignalApiKey = process.env.ONESIGNAL_API_KEY;
    this.fcmServerKey = process.env.FCM_SERVER_KEY;
  }

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

        if (!emailTo) {
          throw new Error('No recipient email found');
        }

        console.log(`📧 Sending email to: ${emailTo}`);
        results.email = await this.sendEmailNotification(
          reminder,
          user,
          emailTo
        );
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
  // EMAIL SENDER
  // ===============================
  async sendEmailNotification(reminder, user, emailTo) {
    try {
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

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: emailTo,
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

            ${
              reminder.notes
                ? `<p><strong>Notes:</strong> ${reminder.notes}</p>`
                : ''
            }

            <a href="${
              process.env.FRONTEND_URL
            }/reminders"
              style="display:inline-block;padding:10px 20px;background:#14B8A6;color:white;text-decoration:none;border-radius:5px;">
              View Reminders
            </a>

            <p style="margin-top:20px;font-size:12px;color:#777;">
              This is an automated email from ${process.env.SMTP_FROM_NAME}
            </p>
          </div>
        `
      };

      const info = await this.emailTransporter.sendMail(mailOptions);

      console.log(`✅ Email sent to ${emailTo}`);
      return {
        success: true,
        messageId: info.messageId,
        sentTo: emailTo
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===============================
  // PUSH (OPTIONAL)
  // ===============================
  async sendPushNotification(reminder, user) {
    if (!this.oneSignalAppId || !this.oneSignalApiKey) {
      return { success: false, error: 'OneSignal not configured' };
    }

    return { success: true };
  }

  // ===============================
  // IN-APP NOTIFICATION
  // ===============================
  async createInAppNotification(reminder, user) {
    try {
      const Notification = require('../models/Notification');
      const dueDate = reminder.nextDueDate || reminder.dueDate;

      const notification = await Notification.create({
        user: user._id,
        type: 'reminder',
        title: `Payment Reminder: ${reminder.title}`,
        message: `${reminder.title} (₹${reminder.amount}) due on ${new Date(
          dueDate
        ).toLocaleDateString()}`,
        relatedId: reminder._id,
        relatedType: 'Reminder',
        priority: 'normal'
      });

      return {
        success: true,
        notificationId: notification._id
      };
    } catch (error) {
      console.error('❌ In-app notification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===============================
  // TEST EMAIL
  // ===============================
  async sendTestEmail(email) {
    try {
      await this.emailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
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
