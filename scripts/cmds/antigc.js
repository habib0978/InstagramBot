module.exports = {
  config: {
    name: "antigc",
    aliases: ["antigroup", "anti"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Anti GC rename / theme & badword control",
    longDescription: "Toggle anti group name/theme change and badword filter per thread",
    category: "group",
    guide: {
      en: [
        "{pn} on  - Enable anti name/theme change for this group",
        "{pn} off - Disable anti name/theme change for this group",
        "{pn} badword on  - Enable badword filter for this group",
        "{pn} badword off - Disable badword filter for this group",
        "{pn} status - Show current settings"
      ].join("\n")
    }
  },

  ST: async function ({ message, args, event, threadsData }) {
    try {
      const threadID = event.threadID;
      const sub = (args[0] || "").toLowerCase();
      const sub2 = (args[1] || "").toLowerCase();

      if (!threadID) {
        return message.reply("This command can only be used in group threads.");
      }

      const isAdmin = global.ST.config.adminUIDs?.includes(String(event.senderID));

      if (!sub || sub === "status") {
        const info = (await threadsData.get(threadID)) || {};
        const settings = info.settings || {};

        const antiGc = settings.antigcEnabled ? "ON" : "OFF";
        const badword = settings.badwordEnabled ? "ON" : "OFF";

        let reply = "⚙️ ANTIGC SETTINGS\n";
        reply += `Thread: ${info.threadName || "Unknown"}\n`;
        reply += `ID: ${threadID}\n\n`;
        reply += `Anti name/theme change: ${antiGc}\n`;
        reply += `Badword filter: ${badword}\n`;

        return message.reply(reply);
      }

      // For changing settings, require bot admin
      if (!isAdmin) {
        return message.reply("Only bot admins can change ANTIGC settings.");
      }

      // /antigc on|off
      if (sub === "on" || sub === "off") {
        const value = sub === "on";
        await threadsData.updateSettings(threadID, "antigcEnabled", value);
        await threadsData.setThreadInfo(threadID, {
          threadID,
          threadName: event.threadName || event.thread_name || null
        });
        return message.reply(
          `Anti group name/theme change has been turned ${value ? "ON" : "OFF"} for this thread.`
        );
      }

      // /antigc badword on|off
      if (sub === "badword" && (sub2 === "on" || sub2 === "off")) {
        const value = sub2 === "on";
        await threadsData.updateSettings(threadID, "badwordEnabled", value);
        await threadsData.setThreadInfo(threadID, {
          threadID,
          threadName: event.threadName || event.thread_name || null
        });
        return message.reply(
          `Badword filter has been turned ${value ? "ON" : "OFF"} for this thread.`
        );
      }

      return message.reply(
        "Invalid usage.\n" +
        "Use:\n" +
        "/antigc on | off\n" +
        "/antigc badword on | off\n" +
        "/antigc status"
      );
    } catch (e) {
      console.error("ANTIGC cmd error:", e.message);
      return message.reply(`Error: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};

