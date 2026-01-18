const fs = require('fs');
const path = require('path');

function saveConfigPatch(updater) {
  const configPath = path.join(process.cwd(), 'config.json');
  let cfg;
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    cfg = JSON.parse(raw);
  } catch (e) {
    cfg = global.ST.config || {};
  }

  const updated = updater(cfg || {});

  try {
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
  } catch {
  }

  // Update in-memory config too
  global.ST.config = updated;
  return updated;
}

module.exports = {
  config: {
    name: "approval",
    aliases: ["approve"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "Approval mode & approved threads",
    longDescription: "Manage approval mode and which threads the bot is allowed to work in",
    category: "system",
    guide: {
      en: [
        "{pn} mode on        - Enable approval mode (bot only works in approved threads)",
        "{pn} mode off       - Disable approval mode",
        "{pn} add            - Approve current thread",
        "{pn} remove         - Remove current thread from approved list",
        "{pn} list           - Show approved thread IDs and names"
      ].join("\n")
    }
  },

  onStart: async function ({ message, args, event, threadsData }) {
    try {
      const threadID = event.threadID;
      const sub = (args[0] || "").toLowerCase();
      const sub2 = (args[1] || "").toLowerCase();

      const isAdmin = global.ST.config.adminUIDs?.includes(String(event.senderID));
      if (!isAdmin) {
        return message.reply("Only bot admins can manage approval mode.");
      }

      if (!sub) {
        return message.reply(this.config.guide.en.replace(/{pn}/g, `/${this.config.name}`));
      }

      if (sub === "mode") {
        if (sub2 !== "on" && sub2 !== "off") {
          return message.reply("Use: /approval mode on | off");
        }

        const enabled = sub2 === "on";
        const updated = saveConfigPatch(cfg => {
          cfg.approvalMode = enabled;
          cfg.approvedThreads = cfg.approvedThreads || [];
          return cfg;
        });

        return message.reply(
          `Approval mode has been turned ${enabled ? "ON" : "OFF"}.\n` +
          `Approved threads: ${(updated.approvedThreads || []).length}`
        );
      }

      if (sub === "add") {
        if (!threadID) {
          return message.reply("This command must be used inside a thread to approve it.");
        }

        const updated = saveConfigPatch(cfg => {
          cfg.approvalMode = cfg.approvalMode || false;
          cfg.approvedThreads = cfg.approvedThreads || [];
          const id = String(threadID);
          if (!cfg.approvedThreads.includes(id)) {
            cfg.approvedThreads.push(id);
          }
          return cfg;
        });

        const info = (await threadsData.get(threadID)) || {};
        const name = info.threadName || "Unknown";

        return message.reply(
          `Thread approved.\nID: ${threadID}\nName: ${name}\n` +
          `Total approved threads: ${(updated.approvedThreads || []).length}`
        );
      }

      if (sub === "remove") {
        if (!threadID) {
          return message.reply("This command must be used inside a thread to remove it.");
        }

        const updated = saveConfigPatch(cfg => {
          cfg.approvalMode = cfg.approvalMode || false;
          cfg.approvedThreads = (cfg.approvedThreads || []).filter(id => id !== String(threadID));
          return cfg;
        });

        const remaining = updated.approvedThreads || [];
        return message.reply(
          `Thread removed from approved list.\nID: ${threadID}\n` +
          `Total approved threads: ${remaining.length}`
        );
      }

      if (sub === "list") {
        const cfg = global.ST.config || {};
        const ids = cfg.approvedThreads || [];

        if (!ids.length) {
          return message.reply("No approved threads yet.");
        }

        const lines = [];
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          let name = "Unknown";
          try {
            const info = await threadsData.get(id);
            if (info && info.threadName) {
              name = info.threadName;
            }
          } catch {
          }
          lines.push(`${i + 1}. ${id} - ${name}`);
        }

        const enabled = cfg.approvalMode ? "ON" : "OFF";
        let reply = `Approval mode: ${enabled}\nApproved threads: ${ids.length}\n\n`;
        reply += lines.join("\n");
        return message.reply(reply);
      }

      return message.reply("Unknown subcommand. Use /approval for help.");
    } catch (e) {
      console.error("APPROVAL cmd error:", e.message);
      return message.reply(`Error: ${e.message}`);
    }
  }
};

