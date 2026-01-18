module.exports = {
  config: {
    name: "ping",
    aliases: ["p", "latency"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 0,
    shortDescription: "Check bot latency",
    longDescription: "Check the bot's response time and uptime",
    category: "system",
    guide: {
      en: "{pn} - Check bot ping"
    }
  },

  onStart: async function ({ message, event }) {
    const start = Date.now();
    
    const sent = await message.reply('Pinging...');
    
    const latency = Date.now() - start;
    const uptime = formatUptime(Date.now() - global.ST.startTime);
    
    const response = `Pong!\n` +
                    `Latency: ${latency}ms\n` +
                    `Uptime: ${uptime}`;
    
    return message.reply(response);
  }
};

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

  return parts.join(' ') || '0s';
}
