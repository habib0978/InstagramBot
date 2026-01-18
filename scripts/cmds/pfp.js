const axios = require('axios');
const { searchUser } = require('../../utils.js');

module.exports = {
  config: {
    name: "pfp",
    aliases: ["avatar", "dp"],
    version: "1.3",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Get profile picture",
    longDescription: "Get a user's profile picture. Reply to a message, mention a user, or provide a username.",
    category: "info",
    guide: {
      en: "{pn} - Get your own profile picture\n{pn} [username] - Get profile picture by username\nReply to a message to get that user's profile picture"
    }
  },

  ST: async function ({ message, args, event, api }) {
    try {
      let targetUsername = null;
      let targetUserID = null;

      if (event.messageReply && event.messageReply.senderID) {
        targetUserID = event.messageReply.senderID;
        targetUsername = event.messageReply.username;
        
        if (!targetUsername && targetUserID) {
          try {
            const userInfo = await api.user.info(targetUserID);
            targetUsername = userInfo?.username;
          } catch (e) {
            console.error('Could not fetch replied user info:', e.message);
          }
        }
      }

      if (!targetUsername && event.mentions && event.mentions.length > 0) {
        const mention = event.mentions[0];
        targetUserID = mention.user_id || mention.pk || mention.id;
        targetUsername = mention.username;
        
        if (!targetUsername && targetUserID) {
          try {
            const userInfo = await api.user.info(targetUserID);
            targetUsername = userInfo?.username;
          } catch (e) {
            console.error('Could not fetch mentioned user info:', e.message);
          }
        }
      }

      if (!targetUsername && args[0]) {
        targetUsername = args[0].replace('@', '');
      }

      if (!targetUsername) {
        targetUsername = event.username;
        targetUserID = event.senderID;
      }

      if (!targetUsername) {
        return message.reply('Please provide a username, reply to a message, or mention a user.');
      }

      const cleanUsername = targetUsername.replace('@', '');
      
      let userInfo;
      
      if (targetUserID) {
        try {
          userInfo = await api.user.info(targetUserID);
        } catch (e) {
        }
      }
      
      if (!userInfo) {
        userInfo = await searchUser(api, cleanUsername);
      }
      
      if (!userInfo || !userInfo.profile_pic_url) {
        return message.reply(`Could not find profile picture for @${cleanUsername}`);
      }

      const hdUrl = userInfo.hd_profile_pic_url_info?.url || 
                    userInfo.hd_profile_pic_versions?.[0]?.url ||
                    userInfo.profile_pic_url;
      
      const response = await axios.get(hdUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://www.instagram.com/'
        }
      });
      
      if (!response.data || response.data.length === 0) {
        return message.reply(`Could not download profile picture for @${cleanUsername}. The image may be unavailable.`);
      }
      
      const photoBuffer = Buffer.from(response.data);
      
      if (!photoBuffer || photoBuffer.length === 0) {
        return message.reply(`Profile picture data is empty for @${cleanUsername}`);
      }
      
      await message.sendPhoto(photoBuffer, {
        caption: `Profile picture of @${userInfo.username || cleanUsername}`
      });

    } catch (e) {
      console.error('PFP error:', e.message);
      return message.reply(`Could not fetch profile picture: ${e.message}`);
    }
  }
};
