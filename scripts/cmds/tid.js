module.exports = {
  config: {
    name: "tid",
    aliases: ["threadid", "gid"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 0,
    shortDescription: "Get thread ID",
    longDescription: "Get the current thread/group ID",
    category: "info",
    guide: {
      en: "{pn} - Get current thread ID"
    }
  },

  onStart: async function ({ message, event }) {
    return message.reply(`Thread ID: ${event.threadID}`);
  }
};
