module.exports = {
  config: {
    name: "user",
    aliases: ["me", "profile"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "User information",
    longDescription: "Get your user information and stats",
    category: "info",
    guide: {
      en: "{pn} - Get your info"
    }
  },

  onStart: async function ({ message, event, api, usersData }) {
    const userID = event.senderID;
    const username = event.username || 'Unknown';

    try {
      let userData = await usersData.get(userID);
      
      if (!userData) {
        userData = {
          userID,
          username,
          exp: 0,
          money: 0,
          createdAt: Date.now()
        };
        await usersData.create(userID, userData);
      }

      let info = `User Information\n\n`;
      info += `Username: @${username}\n`;
      info += `User ID: ${userID}\n`;
      info += `EXP: ${userData.exp || 0}\n`;
      info += `Money: $${userData.money || 0}\n`;
      
      if (userData.createdAt) {
        info += `Registered: ${new Date(userData.createdAt).toLocaleDateString()}\n`;
      }

      const isAdmin = global.ST.config.adminUIDs?.includes(String(userID));
      info += `Role: ${isAdmin ? 'Admin' : 'User'}`;

      return message.reply(info);
    } catch (e) {
      return message.reply(`Username: @${username}\nUser ID: ${userID}`);
    }
  }
};
