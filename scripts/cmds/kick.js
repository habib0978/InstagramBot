module.exports = {
  config: {
    name: "kick",
    aliases: ["remove"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Kick a member from the group",
    longDescription: "Kick a mentioned user from the current group thread",
    category: "group",
    guide: {
      en: "{pn} @user - Kick the mentioned user from this group (bot admin only)"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const threadID = event.threadID;

      if (!threadID) {
        return message.reply("Kick command requires a thread ID.");
      }

      // Check if group: use event.isGroup OR check thread ID length (groups are usually 19+ digits)
      const isGroup = event.isGroup || (threadID && String(threadID).length >= 19);
      
      if (!isGroup) {
        return message.reply("Kick command can only be used in group threads.");
      }

      const isAdmin = global.ST.config.adminUIDs?.includes(String(event.senderID));
      if (!isAdmin) {
        return message.reply("Only bot admins can use the kick command.");
      }

      let targetUserId = null;
      let targetUsername = null;

      // Prefer explicit mentions from event
      if (Array.isArray(event.mentions) && event.mentions.length > 0) {
        const m = event.mentions[0];
        targetUserId = m.user_id || m.pk || m.id;
        targetUsername = m.username || null;
      }

      // Fallback: /kick 123456789 (userID)
      if (!targetUserId && args[0]) {
        const raw = args[0];
        if (/^\d+$/.test(raw)) {
          targetUserId = raw;
        } else if (raw.startsWith('@')) {
          // Try to resolve username to userId using helper
          const username = raw.replace('@', '');
          try {
            const utils = global.utils || global.ST.utils;
            if (utils && typeof utils.searchUser === 'function') {
              const userInfo = await utils.searchUser(api, username);
              if (userInfo && userInfo.pk) {
                targetUserId = String(userInfo.pk);
                targetUsername = userInfo.username || username;
              }
            }
          } catch {
          }
        }
      }

      if (!targetUserId) {
        return message.reply("Please mention a user or provide a valid user ID.\nExample: /kick @username");
      }

      const realtime = global.ST.realtime;
      if (!realtime || !realtime.directCommands || typeof realtime.directCommands.removeMemberFromThread !== 'function') {
        return message.reply("Kick is not available right now (realtime commands not ready).");
      }

      await realtime.directCommands.removeMemberFromThread(threadID, String(targetUserId));

      return message.reply(
        `User ${targetUsername ? '@' + targetUsername : targetUserId} has been requested to be removed from this group.`
      );
    } catch (e) {
      console.error("KICK cmd error:", e.message);
      return message.reply(`Kick failed: ${e.message}`);
    }
  }
};

