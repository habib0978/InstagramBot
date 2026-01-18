module.exports = {
  config: {
    name: "thread",
    aliases: ["gc", "group"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Thread information",
    longDescription: "Get information about the current thread/group",
    category: "info",
    guide: {
      en: "{pn} - Get thread info"
    }
  },

  onStart: async function ({ message, event, api, threadsData }) {
    const threadID = event.threadID;

    try {
      let threadInfo = await threadsData.get(threadID);
      
      if (!threadInfo) {
        threadInfo = {
          threadID,
          threadName: 'Unknown',
          members: [],
          createdAt: Date.now()
        };
        await threadsData.create(threadID, threadInfo);
      }

      let info = `Thread Information\n\n`;
      info += `Thread ID: ${threadID}\n`;
      info += `Thread Name: ${threadInfo.threadName || 'Unknown'}\n`;
      info += `Members: ${threadInfo.members?.length || 0}\n`;
      
      if (threadInfo.createdAt) {
        info += `Registered: ${new Date(threadInfo.createdAt).toLocaleDateString()}\n`;
      }

      return message.reply(info);
    } catch (e) {
      return message.reply(`Thread ID: ${threadID}`);
    }
  }
};
