module.exports = {
  config: {
    name: "badword",
    aliases: ["bw", "filter"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Manage badword list for this group",
    longDescription: "Add/remove/list custom badwords for the current thread",
    category: "group",
    guide: {
      en: [
        "{pn} add [word]      - Add a badword for this group",
        "{pn} remove [word]   - Remove a badword from this group",
        "{pn} list            - Show badwords for this group",
        "{pn} help            - Show this help"
      ].join("\n")
    }
  },

  ST: async function ({ message, args, event, threadsData }) {
    try {
      const threadID = event.threadID;
      const sub = (args[0] || "").toLowerCase();
      const word = (args[1] || "").toLowerCase();

      if (!threadID) {
        return message.reply("This command can only be used in group threads.");
      }

      const isAdmin = global.ST.config.adminUIDs?.includes(String(event.senderID));

      if (!sub || sub === "help") {
        return message.reply(this.config.guide.en.replace(/{pn}/g, `/${this.config.name}`));
      }

      const info = (await threadsData.get(threadID)) || {};
      const settings = info.settings || {};
      let list = Array.isArray(settings.badwordWords) ? settings.badwordWords.slice() : [];

      if (sub === "list") {
        if (list.length === 0) {
          return message.reply("No custom badwords set for this group.\nGlobal badword list still applies.");
        }

        let reply = "🚫 CUSTOM BADWORDS FOR THIS GROUP:\n";
        reply += list.map((w, i) => `${i + 1}. ${w}`).join("\n");
        reply += "\n\n(Global badword list also applies.)";
        return message.reply(reply);
      }

      // add/remove require admin
      if (!isAdmin) {
        return message.reply("Only bot admins can manage badwords.");
      }

      if (sub === "add") {
        if (!word) {
          return message.reply("Please provide a word to add.\nExample: /badword add fuck");
        }

        if (!list.includes(word)) {
          list.push(word);
        }

        settings.badwordWords = list;
        await threadsData.updateSettings(threadID, "badwordWords", list);

        return message.reply(`Added badword "${word}" for this group.\nTotal custom badwords: ${list.length}`);
      }

      if (sub === "remove") {
        if (!word) {
          return message.reply("Please provide a word to remove.\nExample: /badword remove fuck");
        }

        const before = list.length;
        list = list.filter(w => w !== word);

        settings.badwordWords = list;
        await threadsData.updateSettings(threadID, "badwordWords", list);

        if (before === list.length) {
          return message.reply(`Badword "${word}" was not in the list.`);
        }

        return message.reply(`Removed badword "${word}".\nTotal custom badwords: ${list.length}`);
      }

      return message.reply("Unknown subcommand. Use /badword help for usage.");
    } catch (e) {
      console.error("BADWORD cmd error:", e.message);
      return message.reply(`Error: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};

