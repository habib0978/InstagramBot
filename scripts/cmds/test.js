const axios = require('axios');

module.exports = {
  config: {
    name: "test",
    aliases: ["testimg"],
    version: "1.1",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Send image from URL",
    longDescription: "Send an image directly from a URL (test command)",
    category: "media",
    guide: {
      en: "{pn} [image_url] - Send image from URL\n{pn} - Send default image"
    }
  },

  ST: async function ({ message, args, event, api }) {
    const defaultImageUrl = 'https://i.ibb.co.com/VcmBtcNq/Screenshot-2025-12-08-074637.png';
    const imageUrl = args[0] || defaultImageUrl;

    try {
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.data || response.data.length === 0) {
        return message.reply('Could not download image - empty response');
      }

      const photoBuffer = Buffer.from(response.data);
      
      if (!photoBuffer || photoBuffer.length === 0) {
        return message.reply('Downloaded image is empty');
      }

      await message.sendPhoto(photoBuffer, {
        caption: args[0] ? `Image from: ${imageUrl}` : 'Default test image'
      });

    } catch (e) {
      console.error('1.js error:', e.message);
      return message.reply(`Could not send image: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};
