const { searchUser } = require('../../utils.js');

module.exports = {
  config: {
    name: "sendmsg",
    aliases: ["msg", "send"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Send a message to a user",
    longDescription: "Send a message to a mentioned user or user ID in the current thread",
    category: "utility",
    guide: {
      en: "{pn} @user message - Send message to mentioned user\n{pn} uid message - Send message to user ID"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const threadID = event.threadID;
      
      if (!threadID) {
        return message.reply("This command requires a thread context.");
      }

      let targetUserId = null;
      let targetUsername = null;
      let messageText = '';

      // Check mentions first
      if (event.mentions && event.mentions.length > 0) {
        const mention = event.mentions[0];
        targetUserId = mention.user_id || mention.pk || mention.id;
        targetUsername = mention.username;
        // Get message text after mention
        messageText = args.join(' ').trim();
      } else if (args.length >= 2) {
        // Format: /sendmsg @username message or /sendmsg uid message
        const firstArg = args[0];
        
        if (firstArg.startsWith('@')) {
          // Username provided
          targetUsername = firstArg.replace('@', '');
          messageText = args.slice(1).join(' ');
        } else if (/^\d+$/.test(firstArg)) {
          // User ID provided
          targetUserId = firstArg;
          messageText = args.slice(1).join(' ');
        } else {
          return message.reply("Invalid format. Use: /sendmsg @username message or /sendmsg uid message");
        }
      } else {
        return message.reply("Please mention a user or provide user ID and message.\nExample: /sendmsg @username Hello!");
      }

      if (!messageText) {
        return message.reply("Please provide a message to send.");
      }

      // Resolve username to user ID if needed
      if (!targetUserId && targetUsername) {
        try {
          const utils = global.utils || global.ST.utils;
          if (utils && typeof utils.searchUser === 'function') {
            const userInfo = await utils.searchUser(api, targetUsername);
            if (userInfo && userInfo.pk) {
              targetUserId = String(userInfo.pk);
              targetUsername = userInfo.username || targetUsername;
            }
          }
        } catch (e) {
          console.error('User lookup error:', e.message);
        }
      }

      if (!targetUserId) {
        return message.reply(`Could not find user: ${targetUsername || 'unknown'}`);
      }

      // Construct message with mention
      const finalMessage = `@${targetUsername || targetUserId} ${messageText}`;
      
      // Send message in current thread
      await message.send(finalMessage);

      return message.reply(`Message sent to @${targetUsername || targetUserId}`);
    } catch (e) {
      console.error("SENDMSG cmd error:", e.message);
      return message.reply(`Failed to send message: ${e.message}`);
    }
  }
};
