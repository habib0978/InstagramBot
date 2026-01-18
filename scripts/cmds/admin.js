module.exports = {
  config: {
    name: "admin",
    aliases: ["adm"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 1,
    shortDescription: "Admin management",
    longDescription: "Add or remove admin users",
    category: "admin",
    guide: {
      en: "{pn} add <uid> - Add admin\n{pn} remove <uid> - Remove admin\n{pn} list - List all admins"
    }
  },

  onStart: async function ({ message, args, event }) {
    const config = global.ST.config;
    const adminUIDs = config.adminUIDs || [];
    const action = args[0]?.toLowerCase();

    if (!action || action === 'list') {
      if (adminUIDs.length === 0) {
        return message.reply('No admins configured.');
      }
      return message.reply(`Admin UIDs:\n${adminUIDs.join('\n')}`);
    }

    if (action === 'add') {
      const uid = args[1];
      if (!uid) {
        return message.reply('Please provide a user ID to add.');
      }

      if (adminUIDs.includes(uid)) {
        return message.reply('This user is already an admin.');
      }

      config.adminUIDs.push(uid);
      global.ST.config = config;
      
      return message.reply(`Added ${uid} as admin.`);
    }

    if (action === 'remove' || action === 'rm') {
      const uid = args[1];
      if (!uid) {
        return message.reply('Please provide a user ID to remove.');
      }

      const index = adminUIDs.indexOf(uid);
      if (index === -1) {
        return message.reply('This user is not an admin.');
      }

      config.adminUIDs.splice(index, 1);
      global.ST.config = config;
      
      return message.reply(`Removed ${uid} from admins.`);
    }

    return message.reply('Usage: admin add/remove/list <uid>');
  }
};
