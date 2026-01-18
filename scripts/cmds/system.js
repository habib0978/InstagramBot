const os = require('os');

module.exports = {
  config: {
    name: "system",
    aliases: ["sys", "stats", "info"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 5,
    role: 0,
    shortDescription: "System information",
    longDescription: "Display bot system information and statistics",
    category: "system",
    guide: {
      en: "{pn} - Show system stats"
    }
  },

  onStart: async function ({ message }) {
    const uptime = formatUptime(Date.now() - global.ST.startTime);
    const memUsage = process.memoryUsage();
    const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

    const systemInfo = `${global.ST.botName} System Info\n\n` +
      `Bot Name: ${global.ST.botName}\n` +
      `Prefix: ${global.ST.prefix}\n` +
      `Uptime: ${uptime}\n\n` +
      `[Commands & Events]\n` +
      `Commands: ${global.ST.commands.size}\n` +
      `Events: ${global.ST.events.size}\n\n` +
      `[Memory]\n` +
      `Heap: ${heapUsed}/${heapTotal} MB\n` +
      `System: ${freeMem}/${totalMem} GB free\n\n` +
      `[System]\n` +
      `Platform: ${os.platform()}\n` +
      `Node.js: ${process.version}\n` +
      `CPU: ${os.cpus()[0]?.model || 'Unknown'}`;

    return message.reply(systemInfo);
  }
};

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days} days`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hours`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minutes`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60} seconds`);

  return parts.join(', ') || '0 seconds';
}
