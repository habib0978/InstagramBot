# 🤖 InstagramBot - Realtime Work Chat Bot

<div align="center">

![InstagramBot](https://img.shields.io/badge/InstagramBot-v1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

**A powerful realtime Instagram Direct Message automation bot with command system, event handlers, and cookie-based authentication**

[![GitHub stars](https://img.shields.io/github/stars/sheikhtamimlover/InstagramBot?style=social)](https://github.com/sheikhtamimlover/InstagramBot)
[![GitHub forks](https://img.shields.io/github/forks/sheikhtamimlover/InstagramBot?style=social)](https://github.com/sheikhtamimlover/InstagramBot)
[![GitHub watchers](https://img.shields.io/github/watchers/sheikhtamimlover/InstagramBot?style=social)](https://github.com/sheikhtamimlover/InstagramBot)

[📥 Download](https://github.com/sheikhtamimlover/InstagramBot/archive/refs/heads/main.zip) • [📖 Documentation](#) • [🐛 Report Bug](https://github.com/sheikhtamimlover/InstagramBot/issues) • [💡 Request Feature](https://github.com/sheikhtamimlover/InstagramBot/issues)

</div>

---

## 📸 Screenshots

<div align="center">

![Bot Interface](https://ibb.co.com/6dw2pDh)
![Bot Features](https://ibb.co.com/nMRmvSHM)

</div>

---

## ✨ Features

- 🔐 **Multiple Authentication Methods**
  - Cookie-based authentication (recommended)
  - Username/Password login
  - Session auto-save and restore

- 💬 **Realtime Message Handling**
  - Real-time message processing
  - Group and DM support
  - Attachment handling (images, videos, audio, reels, stories)
  - Message reply support

- ⚙️ **Command System**
  - Easy command creation
  - Command aliases
  - Cooldown system
  - Permission-based access control
  - Command categories

- 🎯 **Event System**
  - Welcome messages for new members
  - Leave messages
  - Custom event handlers
  - Anti-group chat features

- 🛡️ **Security Features**
  - Admin-only mode
  - Thread approval system
  - Bad word filtering
  - User permission management

- 📊 **Database Support**
  - JSON database (default)
  - MongoDB support (optional)
  - User and thread data management

---

## 🚀 Installation

### Quick Install

```bash
git clone https://github.com/sheikhtamimlover/InstagramBot.git && cp -r InstagramBot/. . && rm -rf InstagramBot
```

### Manual Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sheikhtamimlover/InstagramBot.git
cd InstagramBot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure the bot:**
   - Copy `config.json` and edit it with your settings
   - See [Configuration](#-configuration) section for details

4. **Set up authentication:**
   - **Option 1 (Recommended):** Export cookies from your browser to `cookie.json`
   - **Option 2:** Add credentials to `config.json` or use environment variables

5. **Run the bot:**
```bash
node ST.js
```

---

## ⚙️ Configuration

Edit `config.json` to customize your bot:

### Basic Configuration

```json
{
  "botName": "InstagramBot",
  "prefix": "/",
  "adminNames": ["Admin"],
  "adminUIDs": ["21841921822", "76537414627"],
  "dmWork": true,
  "adminOnly": true
}
```

### Authentication Options

#### Cookie Authentication (Recommended)

```json
{
  "cookieAuth": {
    "enabled": true,
    "cookiePath": "./cookie.json"
  }
}
```

**How to get cookies:**
1. Open Instagram in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage → Cookies → `https://www.instagram.com`
4. Export cookies as JSON format
5. Save to `cookie.json`

#### Credential Authentication

```json
{
  "credentials": {
    "email": "your_username",
    "password": "your_password"
  }
}
```

**Or use environment variables:**
```bash
export IG_EMAIL="your_username"
export IG_PASSWORD="your_password"
```

### Session Management

```json
{
  "session": {
    "autoSave": true,
    "sessionPath": "./session"
  }
}
```

### Database Configuration

#### JSON Database (Default)

```json
{
  "database": {
    "type": "json",
    "jsonPath": "./database/data"
  }
}
```

#### MongoDB (Optional)

```json
{
  "database": {
    "type": "mongo",
    "mongoURL": "mongodb://localhost:27017/instagrambot"
  }
}
```

### Bot Options

```json
{
  "options": {
    "cmdSkip": [],
    "eventSkip": [],
    "autoReconnect": true,
    "reconnectDelay": 5000,
    "logLevel": "info"
  }
}
```

### Features Toggle

```json
{
  "features": {
    "welcomeMessage": true,
    "leaveMessage": true,
    "autoReact": false
  }
}
```

### Approval Mode

```json
{
  "approvalMode": true,
  "approvedThreads": [""]
}
```

When `approvalMode` is enabled, the bot only works in threads listed in `approvedThreads`.

---

## 📝 Creating Commands

Commands are located in `scripts/cmds/` directory. Each command is a JavaScript file that exports a module with specific structure.

### Basic Command Structure

```javascript
module.exports = {
  config: {
    name: "commandname",
    aliases: ["alias1", "alias2"],
    version: "1.0",
    author: "Your Name",
    countDown: 5,        // Cooldown in seconds
    role: 0,            // 0 = everyone, 1+ = admin only
    shortDescription: "Short description",
    longDescription: "Long description",
    category: "general",
    guide: {
      en: "{pn} [args] - Command usage"
    }
  },

  onStart: async function ({ message, event, args, api, commandName, prefix }) {
    // Command logic here
    await message.reply("Hello! This is a command response.");
  }
};
```

### Command Parameters

The `onStart` function receives an object with:

- `message`: MessageAPI instance for sending replies
- `event`: Event object containing message data
- `args`: Array of command arguments
- `api`: Instagram API wrapper
- `commandName`: Name of the command
- `prefix`: Command prefix
- `usersData`: User database access
- `threadsData`: Thread database access

### Example: Simple Command

```javascript
// scripts/cmds/ping.js
module.exports = {
  config: {
    name: "ping",
    aliases: ["p", "latency"],
    version: "1.0",
    author: "ST | InstagramBot",
    countDown: 3,
    role: 0,
    shortDescription: "Check bot latency",
    category: "system"
  },

  onStart: async function ({ message, event }) {
    const start = Date.now();
    await message.reply('Pinging...');
    const latency = Date.now() - start;
    await message.reply(`Pong! Latency: ${latency}ms`);
  }
};
```

### Advanced Command Features

#### Using onReply (Reply Handler)

```javascript
module.exports = {
  config: {
    name: "example",
    // ... other config
  },

  onStart: async function ({ message, event, args }) {
    await message.reply("Please reply to this message");
    
    // Register reply handler
    global.ST.onReply.set(event.messageID, {
      commandName: "example",
      author: event.senderID,
      threadID: event.threadID,
      timestamp: Date.now()
    });
  },

  onReply: async function ({ message, event, Reply, api }) {
    // Handle user's reply
    await message.reply(`You replied: ${event.body}`);
  }
};
```

#### Using onReaction (Reaction Handler)

```javascript
module.exports = {
  config: {
    name: "react",
    // ... other config
  },

  onStart: async function ({ message, event }) {
    const sent = await message.reply("React to this message!");
    
    // Register reaction handler
    global.ST.onReaction.set(sent.messageID, {
      commandName: "react",
      author: event.senderID
    });
  },

  onReaction: async function ({ message, event, Reaction, api }) {
    await message.reply(`You reacted with: ${event.reaction}`);
  }
};
```

#### Using onChat (Non-command Message Handler)

```javascript
module.exports = {
  config: {
    name: "autorespond",
    // ... other config
  },

  onChat: async function ({ message, event, api }) {
    // This runs for every message (not just commands)
    if (event.body.toLowerCase().includes("hello")) {
      await message.reply("Hi there!");
    }
  }
};
```

### Command Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | string | Command name (required) | - |
| `aliases` | array | Alternative names for command | [] |
| `version` | string | Command version | "1.0" |
| `author` | string | Command author | "Unknown" |
| `countDown` | number | Cooldown in seconds | 0 |
| `role` | number | Permission level (0=all, 1+=admin) | 0 |
| `shortDescription` | string | Brief description | "" |
| `longDescription` | string | Detailed description | "" |
| `category` | string | Command category | "general" |
| `guide` | object | Usage guide | {} |

---

## 🎯 Creating Events

Events are located in `scripts/events/` directory. Events handle non-command interactions.

### Basic Event Structure

```javascript
module.exports = {
  config: {
    name: "eventname",
    version: "1.0",
    author: "Your Name",
    eventType: ["message_live", "action_log"],
    description: "Event description"
  },

  onEvent: async function ({ message, event, api }) {
    // Event logic here
  }
};
```

### Example: Welcome Event

```javascript
// scripts/events/welcome.js
module.exports = {
  config: {
    name: "welcome",
    version: "1.2",
    author: "ST | InstagramBot",
    eventType: ["member_add", "participant_join", "action_log"],
    description: "Welcome new members to the thread"
  },

  onEvent: async function ({ message, event, api }) {
    const config = global.ST.config;
    
    if (!config.features?.welcomeMessage) {
      return;
    }

    const eventBody = event.body || event.text || '';
    const isAddEvent = event.type === 'member_add' || 
                       event.type === 'participant_join' ||
                       (event.type === 'action_log' && eventBody.includes(' added '));

    if (isAddEvent) {
      await message.reply("Welcome to the group! 🎉");
    }
  }
};
```

### Event Object Properties

The `event` object contains:

- `senderID`: User ID of message sender
- `threadID`: Thread/Group ID
- `messageID`: Message ID
- `body`: Message text
- `username`: Sender username
- `itemType`: Type of item (text, media, etc.)
- `timestamp`: Message timestamp
- `isGroup`: Boolean indicating if it's a group
- `mentions`: Array of mentioned users
- `attachments`: Array of attachments
- `messageReply`: Reply data if message is a reply
- `reaction`: Reaction data if applicable

---

## 📚 MessageAPI Methods

The `message` object provides various methods for interacting:

### Basic Methods

```javascript
// Send a text message
await message.reply("Hello!");

// Send a message (not a reply)
await message.send("Hello!");

// React to a message
await message.react("❤️");

// Unsend a message
await message.unsend(messageID);
```

### Advanced Methods

```javascript
// Get thread info
const threadInfo = await api.getThreadInfo(event.threadID);

// Get user info
const userInfo = await api.getUserInfo(event.senderID);

// Send text directly
await api.sendText(event.threadID, "Message text");
```

---

## 🔧 Available Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/help` | Show all commands | Everyone |
| `/ping` | Check bot latency | Everyone |
| `/cmd` | Manage commands | Admin |
| `/admin` | Admin utilities | Admin |
| `/user` | User information | Everyone |
| `/thread` | Thread information | Everyone |
| `/approval` | Manage thread approvals | Admin |
| `/rules` | Show group rules | Everyone |
| `/badword` | Bad word management | Admin |
| `/kick` | Kick user from group | Admin |
| `/unsend` | Unsend messages | Admin |

*Run `/help` in your bot to see all available commands.*

---

## 🛠️ Development

### Project Structure

```
InstagramBot/
├── bot/
│   ├── handler/
│   │   └── handlerEvents.js    # Message and event handlers
│   ├── login/
│   │   └── login.js            # Authentication logic
│   └── loadData.js            # Command/Event loader
├── scripts/
│   ├── cmds/                  # Command files
│   └── events/                # Event files
├── utils/                     # Utility functions
├── func/                      # Helper functions
├── logger/                    # Logging system
├── database/                  # Database files
├── session/                   # Session files
├── config.json               # Configuration file
├── cookie.json               # Cookie file (create this)
└── ST.js                     # Main entry point
```

### Adding New Commands

1. Create a new file in `scripts/cmds/` (e.g., `mycommand.js`)
2. Follow the command structure template
3. Restart the bot or use `/cmd load mycommand.js`

### Adding New Events

1. Create a new file in `scripts/events/` (e.g., `myevent.js`)
2. Follow the event structure template
3. Restart the bot or use `/cmd event load myevent.js`

### Debugging

Enable debug logging in `config.json`:

```json
{
  "options": {
    "logLevel": "debug"
  }
}
```

---

## 📖 Usage Examples

### Example 1: Simple Echo Command

```javascript
module.exports = {
  config: {
    name: "echo",
    aliases: ["say"],
    version: "1.0",
    author: "ST",
    countDown: 2,
    role: 0,
    shortDescription: "Echo your message",
    category: "fun"
  },

  onStart: async function ({ message, event, args }) {
    if (!args.length) {
      return message.reply("Please provide a message to echo!");
    }
    
    const text = args.join(" ");
    await message.reply(text);
  }
};
```

### Example 2: User Info Command

```javascript
module.exports = {
  config: {
    name: "userinfo",
    aliases: ["ui", "whois"],
    version: "1.0",
    author: "ST",
    countDown: 5,
    role: 0,
    shortDescription: "Get user information",
    category: "info"
  },

  onStart: async function ({ message, event, api }) {
    const targetID = event.messageReply?.senderID || event.senderID;
    
    try {
      const userInfo = await api.getUserInfo(targetID);
      const info = `👤 User Information\n` +
                  `Username: @${userInfo.username}\n` +
                  `Full Name: ${userInfo.full_name || 'N/A'}\n` +
                  `User ID: ${userInfo.pk}\n` +
                  `Followers: ${userInfo.follower_count || 'N/A'}\n` +
                  `Following: ${userInfo.following_count || 'N/A'}`;
      
      await message.reply(info);
    } catch (e) {
      await message.reply("Failed to get user information: " + e.message);
    }
  }
};
```

### Example 3: Custom Event Handler

```javascript
module.exports = {
  config: {
    name: "messageLogger",
    version: "1.0",
    author: "ST",
    eventType: ["message_live"],
    description: "Log all messages"
  },

  onEvent: async function ({ message, event, api }) {
    // Only log group messages
    if (event.isGroup) {
      console.log(`[${event.threadID}] @${event.username}: ${event.body}`);
    }
  }
};
```

---

## 🔐 Security Best Practices

1. **Never commit sensitive data:**
   - Add `cookie.json`, `config.json` to `.gitignore`
   - Use environment variables for credentials

2. **Use cookie authentication:**
   - More secure than password login
   - Less likely to trigger Instagram security

3. **Enable approval mode:**
   - Only allow bot in specific threads
   - Prevents unauthorized access

4. **Set admin-only mode:**
   - Restrict commands to admins only
   - Use `adminOnly: true` in config

5. **Regular updates:**
   - Keep dependencies updated
   - Monitor for security patches

---

## 🐛 Troubleshooting

### Bot won't start

- Check Node.js version (requires 18+)
- Verify all dependencies are installed: `npm install`
- Check `config.json` syntax

### Authentication fails

- **Cookie auth:** Ensure `cookie.json` is valid and recent
- **Password auth:** Check credentials in config
- Try exporting fresh cookies from browser

### Commands not working

- Verify command file is in `scripts/cmds/`
- Check command has valid `config.name`
- Ensure prefix is correct (default: `/`)
- Check if command is in `cmdSkip` list

### Events not triggering

- Verify event file is in `scripts/events/`
- Check event has valid `config.name`
- Ensure feature is enabled in config
- Check if event is in `eventSkip` list

### Realtime connection issues

- Check internet connection
- Verify Instagram account is not restricted
- Try restarting the bot
- Check `autoReconnect` is enabled

---

## 📊 Statistics

- **Total Downloads:** [Auto-updated via GitHub API]
- **GitHub Stars:** [Auto-updated via GitHub API]
- **GitHub Forks:** [Auto-updated via GitHub API]
- **Total Visits:** [Auto-updated via GitHub API]

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Sheikh Tamim**

- 📧 Email: [tamimsheikh142@gmail.com](mailto:tamimsheikh142@gmail.com)
- 📷 Instagram: [@sheikh.tamim_lover](https://instagram.com/sheikh.tamim_lover)
- 🐙 GitHub: [@sheikhtamimlover](https://github.com/sheikhtamimlover)

---

## 🙏 Acknowledgments

- Instagram Bot API community
- All contributors and testers
- Open source libraries used in this project

---

## ⚠️ Disclaimer

This bot is for educational purposes only. Use at your own risk. The authors are not responsible for any misuse or damage caused by this software. Please comply with Instagram's Terms of Service.

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/sheikhtamimlover/InstagramBot/issues)
- 💬 [Discussions](https://github.com/sheikhtamimlover/InstagramBot/discussions)
- 📧 Email: tamimsheikh142@gmail.com

---

<div align="center">

**⭐ If you like this project, please give it a star! ⭐**

Made with ❤️ by Sheikh Tamim

[⬆ Back to Top](#-instagrambot---realtime-work-chat-bot)

</div>
