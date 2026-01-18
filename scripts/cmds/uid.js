module.exports = {
  config: {
    name: "uid",
    aliases: ["userid", "id"],
    version: "1.1",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 0,
    shortDescription: "Get user ID",
    longDescription: "Get your user ID, replied user's ID, or mentioned user's ID",
    category: "info",
    guide: {
      en: "{pn} - Get your own ID\n{pn} [username] - Get user ID by username\nReply to a message to get that user's ID"
    }
  },

  ST: async function ({ message, args, event, api }) {
    try {
      if (event.messageReply && event.messageReply.senderID) {
        const repliedUserID = event.messageReply.senderID;
        let repliedUsername = event.messageReply.username;
        
        if (!repliedUsername) {
          try {
            const userInfo = await api.user.info(repliedUserID);
            repliedUsername = userInfo?.username || 'Unknown';
          } catch (e) {
            repliedUsername = 'Unknown';
          }
        }
        
        return message.reply(`Replied User Info:\n@${repliedUsername}\nUser ID: ${repliedUserID}`);
      }

      if (event.mentions && event.mentions.length > 0) {
        const results = [];
        
        for (const mention of event.mentions) {
          const userID = mention.user_id || mention.pk || mention.id;
          let username = mention.username;
          
          if (!username && userID) {
            try {
              const userInfo = await api.user.info(userID);
              username = userInfo?.username || 'Unknown';
            } catch (e) {
              username = 'Unknown';
            }
          }
          
          results.push(`@${username || 'Unknown'}\nUser ID: ${userID}`);
        }
        
        return message.reply(`Mentioned Users:\n\n${results.join('\n\n')}`);
      }

      if (args[0]) {
        const username = args[0].replace('@', '');
        
        try {
          let userInfo = null;
          
          try {
            userInfo = await api.user.infoByUsername(username);
          } catch (e) {
            const users = await api.user.search(username);
            if (users && users.length > 0) {
              userInfo = users.find(u => u.username.toLowerCase() === username.toLowerCase()) || users[0];
            }
          }
          
          if (!userInfo) {
            return message.reply(`User @${username} not found.`);
          }

          const userID = userInfo.pk || userInfo.id;
          const fullName = userInfo.full_name || '';
          const actualUsername = userInfo.username || username;
          
          let response = `@${actualUsername}\nUser ID: ${userID}`;
          if (fullName) {
            response += `\nFull Name: ${fullName}`;
          }
          
          return message.reply(response);
        } catch (e) {
          return message.reply(`Could not find user @${username}: ${e.message}`);
        }
      }

      const senderUsername = event.username || 'You';
      return message.reply(`Your Info:\n@${senderUsername}\nUser ID: ${event.senderID}`);
      
    } catch (e) {
      console.error('UID error:', e.message);
      return message.reply(`Error: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};
