const logger = require('../utils/logger'); // যদি থাকে
const config = require('../config');      // অথবা global.ST.config

module.exports = {
  config: {
    name: 'gc_join',
    version: '1.3',
    author: 'Your Name',
    eventType: ['member_add', 'participant_join', 'action_log'],
    description: 'Welcome new members when they join an Instagram group chat'
  },

  onEvent: async function ({ message, event, api }) {
    try {
      // Feature off থাকলে skip করবে
      if (config?.features?.welcomeMessage === false || config?.LOG_EVENTS?.disableAll) return;

      const eventBody = event.body || event.text || '';
      const isAddEvent =
        event.type === 'member_add' ||
        event.type === 'participant_join' ||
        (event.type === 'action_log' && /added|joined/i.test(eventBody));

      if (!isAddEvent) return;

      // নতুন মেম্বারের নাম বের করা
      let fullName = 'New Member';

      if (event.addedParticipants && event.addedParticipants.length > 0) {
        const participant = event.addedParticipants[0];
        fullName = participant.fullName || participant.name || participant.username || fullName;
      } else if (eventBody) {
        // action_log থেকে নাম extract করার চেষ্টা
        const match = eventBody.match(/(?:added|joined)\s+(.+?)(?:\s+to|$)/i);
        if (match) fullName = match[1].trim();
      }

      // Bot নিজে যোগ হলে skip
      if (event.senderID === api.getCurrentUserID?.()) return;

      logger?.info?.(`New member joined Instagram thread ${event.threadID}: ${fullName}`);

      const welcomeMsg =
        `👋 Welcome to the group, ${fullName}!\n\n` +
        `We're happy to have you here. Type ${config.PREFIX || '!'}help to see what I can do.`;

      await message.reply(welcomeMsg);

    } catch (error) {
      console.error('Error in gc_join (Instagram) event:', error.message);
    }
  }
};
