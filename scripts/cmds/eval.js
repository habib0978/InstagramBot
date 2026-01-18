module.exports = {
  config: {
    name: "eval",
    aliases: ["ev", "execute", "run"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 2,
    shortDescription: "Execute JavaScript code",
    longDescription: "Execute JavaScript code for testing system functions (Admin only)",
    category: "admin",
    guide: {
      en: "{pn} <code> - Execute JavaScript code\nExample: {pn} message.reply('Hello!')\nExample: {pn} 1 + 1"
    }
  },

  ST: async function ({ message, args, event, api }) {
    if (!args.length) {
      return message.reply('Please provide code to execute.\nExample: /eval message.reply("Hello!")');
    }

    const code = args.join(' ');

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      
      const fn = new AsyncFunction(
        'message', 'event', 'api', 'global', 'require', 'console',
        `try { 
          const result = await (async () => { ${code} })();
          return result;
        } catch (e) {
          throw e;
        }`
      );

      const startTime = Date.now();
      const result = await fn(message, event, api, global, require, console);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      if (result !== undefined) {
        let output;
        if (typeof result === 'object') {
          try {
            output = JSON.stringify(result, null, 2);
            if (output.length > 1500) {
              output = output.substring(0, 1500) + '...(truncated)';
            }
          } catch {
            output = String(result);
          }
        } else {
          output = String(result);
        }
        
        return message.reply(`Result (${executionTime}ms):\n${output}`);
      }

    } catch (error) {
      console.error('Eval error:', error);
      return message.reply(`Error: ${error.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};
