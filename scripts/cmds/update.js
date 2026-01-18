const axios = require('axios');
const { execSync } = require('child_process');

const GITHUB_REPO = 'sheikhtamimlover/InstagramBot';
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}`;

module.exports = {
  config: {
    name: "update",
    aliases: ["upd", "version", "ver"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 10,
    role: 2,
    shortDescription: "Check and apply updates",
    longDescription: "Check for new updates from GitHub and apply them",
    category: "admin",
    guide: {
      en: "{pn} - Check for updates\n{pn} apply - Apply available updates\n{pn} force - Force update check"
    }
  },

  ST: async function ({ message, args, event, api }) {
    const action = args[0]?.toLowerCase();

    try {
      const currentVersion = require('../../package.json').version;
      
      await message.reply('Checking for updates...');

      let remoteVersion;
      let updateNotes = [];
      let hasUpdate = false;

      try {
        const packageResponse = await axios.get(`${GITHUB_RAW_URL}/package.json`, { timeout: 15000 });
        remoteVersion = packageResponse.data.version;
      } catch (e) {
        console.log('Could not fetch remote package.json:', e.message);
        
        try {
          const commitsResponse = await axios.get(`${GITHUB_API_URL}/commits/main`, { timeout: 15000 });
          const lastCommit = commitsResponse.data;
          const commitDate = new Date(lastCommit.commit.committer.date).toLocaleString();
          const commitMsg = lastCommit.commit.message.split('\n')[0];
          
          return message.reply(
            `Current Version: ${currentVersion}\n\n` +
            `Latest Commit:\n` +
            `Date: ${commitDate}\n` +
            `Message: ${commitMsg}\n\n` +
            `Could not determine remote version. Use "/update apply" to force update.`
          );
        } catch (e2) {
          return message.reply(`Could not check for updates: ${e2.message}`);
        }
      }

      try {
        const versionsResponse = await axios.get(`${GITHUB_RAW_URL}/versions.json`, { timeout: 15000 });
        const versions = versionsResponse.data;
        
        if (Array.isArray(versions)) {
          const currentIndex = versions.findIndex(v => v.version === currentVersion);
          if (currentIndex !== -1) {
            const newVersions = versions.slice(currentIndex + 1);
            updateNotes = newVersions
              .filter(v => v.note)
              .map(v => `v${v.version}: ${v.note}`);
            hasUpdate = newVersions.length > 0;
          } else {
            hasUpdate = currentVersion !== remoteVersion;
          }
        }
      } catch (e) {
        hasUpdate = currentVersion !== remoteVersion;
      }

      if (!hasUpdate && currentVersion === remoteVersion) {
        return message.reply(
          `You are running the latest version!\n\n` +
          `Current Version: ${currentVersion}\n` +
          `Remote Version: ${remoteVersion}`
        );
      }

      let updateMessage = 
        `Update Available!\n\n` +
        `Current Version: ${currentVersion}\n` +
        `Latest Version: ${remoteVersion}\n`;

      if (updateNotes.length > 0) {
        updateMessage += `\nWhat's New:\n${updateNotes.slice(0, 5).join('\n')}`;
        if (updateNotes.length > 5) {
          updateMessage += `\n...and ${updateNotes.length - 5} more updates`;
        }
      }

      updateMessage += `\n\nUse "/update apply" to apply this update.`;

      if (action === 'apply' || action === 'force') {
        await message.reply('Applying update... This may take a moment.');

        try {
          execSync('node updater.js', { 
            stdio: 'pipe',
            timeout: 120000,
            cwd: process.cwd()
          });

          return message.reply(
            `Update applied successfully!\n` +
            `Updated from ${currentVersion} to ${remoteVersion}\n\n` +
            `Please restart the bot to use the new version.`
          );
        } catch (updateError) {
          console.error('Update apply error:', updateError);
          return message.reply(
            `Update process completed with warnings.\n` +
            `Please check logs and restart the bot.\n\n` +
            `Note: Some updates may require manual intervention.`
          );
        }
      }

      return message.reply(updateMessage);

    } catch (e) {
      console.error('Update check error:', e);
      return message.reply(`Error checking for updates: ${e.message}`);
    }
  },

  onStart: async function (params) {
    return this.ST(params);
  }
};
