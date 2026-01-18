module.exports = {
  config: {
    name: "rules",
    aliases: ["rule", "grouprules"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Display group rules",
    longDescription: "Display or set group chat rules",
    category: "group",
    guide: {
      en: "{pn} - Display group rules\n{pn} set [rules] - Set group rules (admin only)\n{pn} clear - Clear rules (admin only)"
    }
  },

  ST: async function ({ message, args, event, api, threadsData }) {
    const threadID = event.threadID;
    const subCommand = args[0]?.toLowerCase();
    
    const defaultRules = [
      "1. Be respectful to all members",
      "2. No spamming or flooding the chat",
      "3. No NSFW or inappropriate content",
      "4. No advertising without permission",
      "5. Follow Instagram's Terms of Service",
      "6. Listen to admins and moderators",
      "7. Keep conversations friendly and constructive",
      "8. No harassment or bullying",
      "9. Use commands responsibly",
      "10. Have fun!"
    ];

    try {
      if (subCommand === 'set') {
        const isAdmin = global.ST.config.adminUIDs?.includes(String(event.senderID));
        
        if (!isAdmin) {
          return message.reply('Only bot admins can set rules.');
        }
        
        const newRules = args.slice(1).join(' ');
        
        if (!newRules) {
          return message.reply('Please provide the rules to set.\nUsage: /rules set [your rules here]');
        }
        
        if (!global.ST.threadRules) {
          global.ST.threadRules = new Map();
        }
        
        global.ST.threadRules.set(threadID, newRules);
        
        return message.reply(`Rules have been set for this group!\n\n${newRules}`);
      }
      
      if (subCommand === 'clear') {
        const isAdmin = global.ST.config.adminUIDs?.includes(String(event.senderID));
        
        if (!isAdmin) {
          return message.reply('Only bot admins can clear rules.');
        }
        
        if (global.ST.threadRules) {
          global.ST.threadRules.delete(threadID);
        }
        
        return message.reply('Rules have been cleared. Default rules will be shown.');
      }
      
      let rules;
      
      if (global.ST.threadRules && global.ST.threadRules.has(threadID)) {
        rules = global.ST.threadRules.get(threadID);
      } else {
        rules = defaultRules.join('\n');
      }
      
      const header = "📋 GROUP RULES 📋\n" + "─".repeat(25) + "\n\n";
      const footer = "\n\n" + "─".repeat(25) + "\nPlease follow these rules to keep the group friendly!";
      
      return message.reply(header + rules + footer);
      
    } catch (e) {
      console.error('Rules error:', e.message);
      return message.reply(`Error: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};
