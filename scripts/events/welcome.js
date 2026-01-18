const pendingWelcomes = new Map();
const BATCH_DELAY = 3000;

module.exports = {
  config: {
    name: "welcome",
    version: "1.2",
    author: "ST | InstagramBot",
    eventType: ["member_add", "participant_join", "action_log"],
    description: "Welcome new members to the thread"
  },

  onEvent: async function ({ message, event, api }) {
    const config = global.ST.config;
    
    if (!config.features?.welcomeMessage) {
      return;
    }

    const eventBody = event.body || event.text || '';
    const isAddEvent = event.type === 'member_add' || 
                       event.type === 'participant_join' ||
                       (event.type === 'action_log' && eventBody.includes(' added '));

    if (!isAddEvent) {
      return;
    }

    try {
      const threadData = global.ST.threadData;
      const threadID = event.thread_id || event.threadID;
      
      const newMembers = [];
      
      if (event.type === 'action_log' && eventBody.includes(' added ')) {
        const match = eventBody.match(/added\s+(.+)$/);
        if (match) {
          const addedNames = match[1].trim();
          const names = addedNames.split(/,\s*|\s+and\s+/);
          for (const name of names) {
            if (name.trim()) {
              newMembers.push({
                username: name.trim(),
                userID: null
              });
            }
          }
        }
      } else {
        const members = event.added_members || event.participants || [];
        for (const member of members) {
          const userID = member.user_id || member.pk || member;
          const username = member.username || 'New member';
          
          newMembers.push({
            username,
            userID
          });
          
          if (threadData && threadData.addMember && userID) {
            try {
              await threadData.addMember(threadID, userID);
            } catch (e) {
              console.error('Error adding member to thread data:', e.message);
            }
          }
        }
      }
      
      if (newMembers.length === 0) {
        return;
      }
      
      if (!pendingWelcomes.has(threadID)) {
        pendingWelcomes.set(threadID, {
          members: [],
          message: message,
          timeout: null
        });
      }
      
      const pending = pendingWelcomes.get(threadID);
      
      for (const member of newMembers) {
        const exists = pending.members.some(m => 
          (m.username === member.username) || 
          (m.userID && member.userID && m.userID === member.userID)
        );
        
        if (!exists) {
          pending.members.push(member);
        }
      }
      
      if (pending.timeout) {
        clearTimeout(pending.timeout);
      }
      
      pending.timeout = setTimeout(async () => {
        try {
          const finalPending = pendingWelcomes.get(threadID);
          if (!finalPending || finalPending.members.length === 0) {
            pendingWelcomes.delete(threadID);
            return;
          }
          
          const members = finalPending.members;
          const messageApi = finalPending.message;
          
          let mentionsList;
          if (members.length === 1) {
            mentionsList = `@${members[0].username}`;
          } else if (members.length === 2) {
            mentionsList = `@${members[0].username} and @${members[1].username}`;
          } else {
            const lastMember = members[members.length - 1];
            const otherMembers = members.slice(0, -1).map(m => `@${m.username}`).join(', ');
            mentionsList = `${otherMembers}, and @${lastMember.username}`;
          }
          
          // Emoji and decorative Unicode font (test font style simulation)
          const fancyFont = txt => txt
            .replace(/[a-zA-Z]/g, c =>
              String.fromCodePoint(
                c >= 'A' && c <= 'Z'
                  ? 0x1d5a0 + (c.charCodeAt(0) - 65)
                  : c >= 'a' && c <= 'z'
                  ? 0x1d5ba + (c.charCodeAt(0) - 97)
                  : c.charCodeAt(0)
              )
            );

          const hamzaMention = '@to.do.roki.shoto';

          let welcomeMsg = '';
          if (members.length === 1) {
            welcomeMsg =
              `🎉✨ 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝙏𝙝𝙚 𝙂𝙧𝙤𝙪𝙥 ✨🎉\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `👤 ${fancyFont(members[0].username)} (${mentionsList})\n\n` +
              `😊 𝙒𝙚'𝙧𝙚 𝙜𝙡𝙖𝙙 𝙩𝙤 𝙝𝙖𝙫𝙚 𝙮𝙤𝙪!\n` +
              `📜 𝙏𝙮𝙥𝙚 ${global.ST.prefix}rules 𝙩𝙤 𝙨𝙚𝙚 𝙜𝙧𝙤𝙪𝙥 𝙧𝙪𝙡𝙚𝙨.\n` +
              `\n👑 𝙂𝙧𝙤𝙪𝙥 𝙊𝙬𝙣𝙚𝙧: ${hamzaMention} 🦸‍♂️\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `✨ Enjoy your stay! ✨`;
          } else {
            welcomeMsg =
              `🎊✨ 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙣𝙚𝙬 𝙈𝙚𝙢𝙗𝙚𝙧𝙨! ✨🎊\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `👥 ${mentionsList}\n\n` +
              `🥳 𝙒𝙚'𝙧𝙚 𝙜𝙡𝙖𝙙 𝙩𝙤 𝙝𝙖𝙫𝙚 𝙮𝙤𝙪 𝙖𝙡𝙡!\n` +
              `📜 𝙏𝙮𝙥𝙚 ${global.ST.prefix}rules 𝙛𝙤𝙧 𝙜𝙧𝙤𝙪𝙥 𝙧𝙪𝙡𝙚𝙨.\n` +
              `\n👑 𝙂𝙧𝙤𝙪𝙥 𝙊𝙬𝙣𝙚𝙧: ${hamzaMention} 🦸‍♂️\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🌟 Welcome & Make Friends! 🌟`;
          }
          
          await messageApi.reply(welcomeMsg);
          
          pendingWelcomes.delete(threadID);
        } catch (e) {
          console.error('Welcome batch error:', e.message);
          pendingWelcomes.delete(threadID);
        }
      }, BATCH_DELAY);
      
    } catch (e) {
      console.error('Welcome event error:', e.message);
    }
  }
};
