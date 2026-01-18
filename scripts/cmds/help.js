module.exports = {
  config: {
    name: "help",
    aliases: ["h", "menu", "cmds"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 0,
    shortDescription: "Show all commands",
    longDescription: "Display list of all available commands and their descriptions",
    category: "system",
    guide: {
      en: "{pn} [command name] - Get help for a specific command"
    }
  },

  onStart: async function ({ message, args, prefix }) {
    const commands = global.ST.commands;
    const uniqueCmds = new Map();
    
    for (const [name, cmd] of commands) {
      if (cmd.config && cmd.config.name === name) {
        uniqueCmds.set(name, cmd);
      }
    }

    if (args[0]) {
      const cmdName = args[0].toLowerCase();
      const cmd = commands.get(cmdName);
      
      if (!cmd) {
        return message.reply(`Command "${cmdName}" not found.`);
      }

      const cfg = cmd.config;
      let helpText = `Command: ${cfg.name}\n`;
      helpText += `Description: ${cfg.shortDescription || 'No description'}\n`;
      helpText += `Version: ${cfg.version || '1.0'}\n`;
      helpText += `Author: ${cfg.author || 'Unknown'}\n`;
      helpText += `Category: ${cfg.category || 'general'}\n`;
      helpText += `Cooldown: ${cfg.countDown || 0}s\n`;
      helpText += `Permission: ${cfg.role === 0 ? 'Everyone' : 'Admin'}\n`;
      
      if (cfg.aliases && cfg.aliases.length > 0) {
        helpText += `Aliases: ${cfg.aliases.join(', ')}\n`;
      }
      
      if (cfg.guide?.en) {
        helpText += `\nUsage: ${cfg.guide.en.replace('{pn}', prefix + cfg.name)}`;
      }

      return message.reply(helpText);
    }

    const categories = {};
    for (const [name, cmd] of uniqueCmds) {
      const cat = cmd.config.category || 'general';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    let helpMsg = `${global.ST.botName} Command List\n`;
    helpMsg += `Prefix: ${prefix}\n`;
    helpMsg += `Total Commands: ${uniqueCmds.size}\n\n`;

    for (const [cat, cmds] of Object.entries(categories).sort()) {
      helpMsg += `[${cat.toUpperCase()}]\n`;
      helpMsg += cmds.sort().join(', ') + '\n\n';
    }

    helpMsg += `Type ${prefix}help [command] for details`;

    return message.reply(helpMsg);
  }
};
