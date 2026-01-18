const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "cmd",
    aliases: ["command", "module"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 2,
    shortDescription: "Manage commands and events",
    longDescription: "Load, unload, and install commands and events",
    category: "admin",
    guide: {
      en: "{pn} load <cmdname.js> - Load a command\n{pn} unload <cmdname> - Unload a command\n{pn} install <file.js> <code> - Install command from code\n{pn} install <file.js> <url> - Install command from URL\n{pn} event load <eventname.js> - Load an event\n{pn} event unload <eventname> - Unload an event\n{pn} event install <file.js> <url> - Install event from URL\n{pn} list - List all loaded commands\n{pn} eventlist - List all loaded events"
    }
  },

  ST: async function ({ message, args, event, api }) {
    if (!args.length) {
      return message.reply(
        'Command Management:\n' +
        '/cmd load <file.js> - Load command\n' +
        '/cmd unload <name> - Unload command\n' +
        '/cmd install <file.js> <code|url> - Install command\n' +
        '/cmd event load <file.js> - Load event\n' +
        '/cmd event unload <name> - Unload event\n' +
        '/cmd event install <file.js> <url> - Install event\n' +
        '/cmd list - List commands\n' +
        '/cmd eventlist - List events'
      );
    }

    const action = args[0].toLowerCase();
    const cmdsPath = path.join(process.cwd(), 'scripts', 'cmds');
    const eventsPath = path.join(process.cwd(), 'scripts', 'events');

    try {
      switch (action) {
        case 'load': {
          const fileName = args[1];
          if (!fileName) return message.reply('Please provide a file name to load.');
          
          const filePath = path.join(cmdsPath, fileName.endsWith('.js') ? fileName : `${fileName}.js`);
          
          if (!fs.existsSync(filePath)) {
            return message.reply(`File not found: ${fileName}`);
          }

          delete require.cache[require.resolve(filePath)];
          const cmd = require(filePath);

          if (!cmd.config || !cmd.config.name) {
            return message.reply('Invalid command file: missing config.name');
          }

          global.ST.commands.set(cmd.config.name, cmd);
          if (cmd.config.aliases) {
            for (const alias of cmd.config.aliases) {
              global.ST.commands.set(alias, cmd);
            }
          }

          return message.reply(`Loaded command: ${cmd.config.name}`);
        }

        case 'unload': {
          const cmdName = args[1];
          if (!cmdName) return message.reply('Please provide a command name to unload.');

          const cmd = global.ST.commands.get(cmdName.toLowerCase());
          if (!cmd) {
            return message.reply(`Command not found: ${cmdName}`);
          }

          const mainName = cmd.config.name;
          global.ST.commands.delete(mainName);
          
          if (cmd.config.aliases) {
            for (const alias of cmd.config.aliases) {
              global.ST.commands.delete(alias);
            }
          }

          const filePath = path.join(cmdsPath, `${mainName}.js`);
          if (require.cache[require.resolve(filePath)]) {
            delete require.cache[require.resolve(filePath)];
          }

          return message.reply(`Unloaded command: ${mainName}`);
        }

        case 'install': {
          const fileName = args[1];
          if (!fileName) return message.reply('Please provide a file name for the command.');
          
          const source = args.slice(2).join(' ');
          if (!source) return message.reply('Please provide code or a URL to install from.');

          const filePath = path.join(cmdsPath, fileName.endsWith('.js') ? fileName : `${fileName}.js`);
          let code;

          if (source.startsWith('http://') || source.startsWith('https://')) {
            try {
              const response = await axios.get(source, { timeout: 30000 });
              code = response.data;
            } catch (e) {
              return message.reply(`Failed to download: ${e.message}`);
            }
          } else {
            code = source;
          }

          fs.writeFileSync(filePath, code);

          try {
            delete require.cache[require.resolve(filePath)];
            const cmd = require(filePath);

            if (!cmd.config || !cmd.config.name) {
              fs.unlinkSync(filePath);
              return message.reply('Invalid command file: missing config.name');
            }

            global.ST.commands.set(cmd.config.name, cmd);
            if (cmd.config.aliases) {
              for (const alias of cmd.config.aliases) {
                global.ST.commands.set(alias, cmd);
              }
            }

            return message.reply(`Installed and loaded command: ${cmd.config.name}`);
          } catch (e) {
            return message.reply(`Installed but failed to load: ${e.message}`);
          }
        }

        case 'event': {
          const eventAction = args[1]?.toLowerCase();
          
          if (eventAction === 'load') {
            const fileName = args[2];
            if (!fileName) return message.reply('Please provide an event file name.');
            
            const filePath = path.join(eventsPath, fileName.endsWith('.js') ? fileName : `${fileName}.js`);
            
            if (!fs.existsSync(filePath)) {
              return message.reply(`Event file not found: ${fileName}`);
            }

            delete require.cache[require.resolve(filePath)];
            const evt = require(filePath);

            if (!evt.config || !evt.config.name) {
              return message.reply('Invalid event file: missing config.name');
            }

            global.ST.events.set(evt.config.name, evt);
            return message.reply(`Loaded event: ${evt.config.name}`);
          }
          
          if (eventAction === 'unload') {
            const eventName = args[2];
            if (!eventName) return message.reply('Please provide an event name to unload.');

            if (!global.ST.events.has(eventName)) {
              return message.reply(`Event not found: ${eventName}`);
            }

            global.ST.events.delete(eventName);

            const filePath = path.join(eventsPath, `${eventName}.js`);
            if (fs.existsSync(filePath) && require.cache[require.resolve(filePath)]) {
              delete require.cache[require.resolve(filePath)];
            }

            return message.reply(`Unloaded event: ${eventName}`);
          }
          
          if (eventAction === 'install') {
            const fileName = args[2];
            if (!fileName) return message.reply('Please provide a file name for the event.');
            
            const source = args.slice(3).join(' ');
            if (!source) return message.reply('Please provide a URL to install from.');

            const filePath = path.join(eventsPath, fileName.endsWith('.js') ? fileName : `${fileName}.js`);
            let code;

            if (source.startsWith('http://') || source.startsWith('https://')) {
              try {
                const response = await axios.get(source, { timeout: 30000 });
                code = response.data;
              } catch (e) {
                return message.reply(`Failed to download: ${e.message}`);
              }
            } else {
              code = source;
            }

            fs.writeFileSync(filePath, code);

            try {
              delete require.cache[require.resolve(filePath)];
              const evt = require(filePath);

              if (!evt.config || !evt.config.name) {
                fs.unlinkSync(filePath);
                return message.reply('Invalid event file: missing config.name');
              }

              global.ST.events.set(evt.config.name, evt);
              return message.reply(`Installed and loaded event: ${evt.config.name}`);
            } catch (e) {
              return message.reply(`Installed but failed to load: ${e.message}`);
            }
          }

          return message.reply('Usage: /cmd event load|unload|install <args>');
        }

        case 'list': {
          const uniqueCmds = new Map();
          for (const [name, cmd] of global.ST.commands) {
            if (cmd.config && cmd.config.name === name) {
              uniqueCmds.set(name, cmd);
            }
          }

          const cmdList = Array.from(uniqueCmds.keys()).sort().join(', ');
          return message.reply(`Loaded commands (${uniqueCmds.size}):\n${cmdList}`);
        }

        case 'eventlist': {
          const eventList = Array.from(global.ST.events.keys()).sort().join(', ');
          return message.reply(`Loaded events (${global.ST.events.size}):\n${eventList || 'None'}`);
        }

        default:
          return message.reply('Unknown action. Use: load, unload, install, event, list, eventlist');
      }
    } catch (e) {
      console.error('Cmd error:', e);
      return message.reply(`Error: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};
