const fs = require('fs');
const path = require('path');

let badwordCache = null;

function loadBadwords() {
  if (badwordCache) return badwordCache;
  try {
    const filePath = path.join(process.cwd(), 'badword.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        badwordCache = list.map(w => String(w).toLowerCase());
      } else if (Array.isArray(list.words)) {
        badwordCache = list.words.map(w => String(w).toLowerCase());
      }
    }
  } catch (e) {
    console.error('Badword load error:', e.message);
  }
  if (!badwordCache) badwordCache = [];
  return badwordCache;
}

function containsBadword(text, extraWords = []) {
  if (!text) return false;
  const base = loadBadwords();
  const allWords = [...base, ...(Array.isArray(extraWords) ? extraWords : [])]
    .map(w => String(w || '').toLowerCase())
    .filter(Boolean);
  if (!allWords.length) return false;
  const lower = text.toLowerCase();
  return allWords.some(w => lower.includes(w));
}

async function ensureThreadInfo(threadID, api) {
  try {
    const threadsData = global.ST.threadData;
    if (!threadsData || !threadID) return;

    const existing = await threadsData.get(threadID);
    if (existing && existing.threadName && existing.theme !== undefined) return;

    if (!api || !api.getThreadInfo) return;

    const info = await api.getThreadInfo(threadID);
    if (!info) return;

    const threadName =
      info.thread_title ||
      info.threadTitle ||
      info.thread_name ||
      info.threadName ||
      info.title ||
      null;

    const theme =
      info.theme_name ||
      info.themeName ||
      (info.thread_theme && info.thread_theme.name) ||
      null;

    await threadsData.setThreadInfo(threadID, {
      threadID,
      threadName,
      theme
    });
  } catch (e) {
    console.error('ensureThreadInfo error:', e.message);
  }
}

module.exports = {
  config: {
    name: "antigc",
    version: "1.0",
    author: "ST | InstagramBot",
    eventType: ["action_log", "text"],
    description: "Monitor group name/theme changes and bad words"
  },

  onEvent: async function ({ message, event, api }) {
    try {
      const threadsData = global.ST.threadData;
      if (!threadsData) return;

      const threadID = event.threadID || event.thread_id;
      const senderID = event.senderID || event.userId || event.user_id;
      const username = event.username || `user_${senderID}`;
      const type = event.type || event.itemType || event.item_type || 'text';
      const body = event.body || event.text || '';

      if (!threadID || !senderID) return;

      const threadInfo = (await threadsData.get(threadID)) || {};
      const settings = threadInfo.settings || {};

      const isBotAdmin = global.ST.config.adminUIDs?.includes(String(senderID));

      // --- Anti name / theme change ---
      if (settings.antigcEnabled && type === 'action_log') {
        const text = body || '';

        // Name change: "[ACTION] user named the group X."
        if (text.includes(' named the group ')) {
          const match = text.match(/named the group\s+(.+?)\.?$/);
          const newName = match ? match[1].trim() : null;

          if (newName) {
            const previousName = threadInfo.threadName || 'Unknown';

            // Update DB with new name
            await threadsData.setThreadInfo(threadID, {
              threadID,
              threadName: newName,
              theme: threadInfo.theme || null
            });

            if (!isBotAdmin) {
              await message.reply(
                `@${username}, previous group name was "${previousName}".\n` +
                `You changed it to "${newName}" without admin permission.\n` +
                `This is a warning. Admins may kick you if you continue.`
              );
            }
          }
        }

        // Theme change: "[ACTION] user changed the theme to Hello 2026! Change Theme"
        if (text.includes(' changed the theme to ')) {
          const match = text.match(/changed the theme to\s+(.+)$/);
          let newTheme = match ? match[1].trim() : null;
          if (newTheme && newTheme.toLowerCase().endsWith('change theme')) {
            newTheme = newTheme.replace(/change theme/i, '').trim();
          }

          if (newTheme) {
            const previousTheme = threadInfo.theme || 'Default';

            await threadsData.setThreadInfo(threadID, {
              threadID,
              threadName: threadInfo.threadName || null,
              theme: newTheme
            });

            if (!isBotAdmin) {
              await message.reply(
                `@${username}, previous theme was "${previousTheme}".\n` +
                `You changed it to "${newTheme}" without admin permission.\n` +
                `This is a warning. Admins may kick you if you continue.`
              );
            }
          }
        }

        return;
      }

      // --- Badword filter ---
      if (settings.badwordEnabled && type === 'text') {
        const customWords = settings.badwordWords || [];
        if (containsBadword(body, customWords)) {
          await message.reply(
            `@${username}, your message contains prohibited words.\n` +
            `Please follow the group rules and avoid using bad language.`
          );
        }
      }

      // Best-effort fill thread info if missing
      if (!threadInfo.threadName || threadInfo.theme === undefined) {
        await ensureThreadInfo(threadID, api);
      }
    } catch (e) {
      console.error('ANTIGC event error:', e.message);
    }
  }
};

