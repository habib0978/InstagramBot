module.exports = {
  config: {
    name: 'gc_join',
    version: '1.4',
    author: 'Sk HABIB',
    eventType: ['member_add', 'participant_join', 'action_log'],
    description: 'Welcome new members when they join an Instagram group chat'
  },

  onEvent: async function ({ message, event, api }) {
    try {
      // Config safely নেওয়া
      const config =
        global.ST?.config ||
        global.config ||
        {};

      // Welcome feature বন্ধ থাকলে skip
      if (
        config?.features?.welcomeMessage === false ||
        config?.LOG_EVENTS?.disableAll === true
      ) {
        return;
      }

      if (!event) return;

      const eventBody =
        event.body ||
        event.text ||
        '';

      // Join event detect
      const isAddEvent =
        event.type === 'member_add' ||
        event.type === 'participant_join' ||
        (
          event.type === 'action_log' &&
          /added|joined/i.test(eventBody)
        );

      if (!isAddEvent) return;

      // নতুন member-এর নাম
      let fullName = 'New Member';

      if (
        Array.isArray(event.addedParticipants) &&
        event.addedParticipants.length > 0
      ) {
        const participant = event.addedParticipants[0];

        fullName =
          participant?.fullName ||
          participant?.name ||
          participant?.username ||
          'New Member';
      }

      // action_log থেকে নাম বের করার চেষ্টা
      else if (eventBody) {
        const match = eventBody.match(
          /(?:added|joined)\s+(.+?)(?:\s+to|$)/i
        );

        if (match) {
          fullName = match[1].trim();
        }
      }

      // Bot নিজে join করলে skip
      let botID = null;

      try {
        botID = await api?.getCurrentUserID?.();
      } catch (e) {
        botID = null;
      }

      if (
        botID &&
        event.senderID &&
        String(event.senderID) === String(botID)
      ) {
        return;
      }

      // Console logger ব্যবহার করা হয়েছে
      console.log(
        `[GC_JOIN] New member joined thread ${event.threadID}: ${fullName}`
      );

      const prefix = config.PREFIX || '!';

      const welcomeMsg =
        `👋 Welcome to the group, ${fullName}!\n\n` +
        `We're happy to have you here. ❤️\n` +
        `Type ${prefix}help to see what I can do.`;

      // Reply করার ব্যবস্থা
      if (typeof message?.reply === 'function') {
        await message.reply(welcomeMsg);
      } else if (typeof api?.sendMessage === 'function') {
        await api.sendMessage(
          welcomeMsg,
          event.threadID
        );
      }

    } catch (error) {
      console.error(
        '[GC_JOIN] Event Error:',
        error?.stack || error?.message || error
      );
    }
  }
};
