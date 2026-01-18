module.exports = {
  config: {
    name: "leave",
    version: "1.1",
    author: "ST | InstagramBot",
    eventType: ["member_remove", "participant_left", "action_log"],
    description: "Notify when members leave the thread"
  },

  onEvent: async function ({ message, event, api }) {
    const config = global.ST.config;
    
    if (!config.features?.leaveMessage) {
      return;
    }

    const eventBody = event.body || event.text || '';
    const isRemoveEvent = event.type === 'member_remove' || 
                          event.type === 'participant_left' ||
                          (event.type === 'action_log' && eventBody.includes(' removed '));

    if (!isRemoveEvent) {
      return;
    }

    try {
      const threadData = global.ST.threadData;
      const threadID = event.thread_id || event.threadID;
      
      let username = 'A member';
      let userID = null;
      
      if (event.type === 'action_log' && eventBody.includes(' removed ')) {
        const match = eventBody.match(/removed\s+(.+)$/);
        if (match) {
          username = match[1].trim();
        }
      } else {
        const leftMembers = event.removed_members || event.participants || [];
        if (leftMembers.length > 0) {
          const member = leftMembers[0];
          userID = member.user_id || member.pk || member;
          username = member.username || 'A member';
        }
      }
      
      if (threadData && threadData.removeMember && userID) {
        await threadData.removeMember(threadID, userID);
      }
      
      const leaveMsg = `Goodbye @${username}!\n` +
                      `Tor moto abal chuda user dorkar nai`;
      
      await message.reply(leaveMsg);
    } catch (e) {
      console.error('Leave event error:', e.message);
    }
  }
};
