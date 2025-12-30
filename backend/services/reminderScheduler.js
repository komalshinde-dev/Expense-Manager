const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const notificationService = require('./notificationService');

class ReminderScheduler {
  startAll() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.checkDueReminders();
    });

    console.log('Reminder scheduler started (every 5 minutes)');
  }

  async checkDueReminders() {
    try {
      const now = new Date();

      const reminders = await Reminder.find({ status: 'active' });

      console.log(`🔍 Checking ${reminders.length} active reminders`);

      for (const reminder of reminders) {
        await this.processReminder(reminder, now);
      }
    } catch (err) {
      console.error('Reminder check failed:', err);
    }
  }

  async processReminder(reminder, now) {
    try {
      const dueDate = reminder.nextDueDate || reminder.dueDate;

      const notificationTime = new Date(
        dueDate.getTime() - reminder.reminderTime * 60 * 1000
      );

      if (reminder.lastNotificationSent) return;

      if (now >= notificationTime && now <= dueDate) {
        const user = await User.findById(reminder.user);
        if (!user) return;

        console.log(`📧 Sending reminder for: ${reminder.title}`);

        const result = await notificationService.sendReminder(reminder, user);

        if (result.success) {
          reminder.lastNotificationSent = now;
          await reminder.save();
          console.log(`Reminder email sent: ${reminder.title}`);
        }
      }
    } catch (err) {
      console.error('Reminder processing error:', err);
    }
  }
}

module.exports = new ReminderScheduler();
