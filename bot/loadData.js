const fs = require('fs');
const path = require('path');
const { colors } = require('../func/colors.js');
const log = require('../logger/log.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadingItem(type, name, index, total) {
  const progress = Math.round((index / total) * 100);
  const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
  process.stdout.write(`\r  ${colors.cyan(type)} [${colors.green(bar)}] ${colors.yellow(progress + '%')} ${colors.gray(name)}`);
  await sleep(50);
}

async function loadCommands() {
  const cmdsPath = path.join(process.cwd(), 'scripts', 'cmds');
  const config = global.ST.config;
  const skipList = config.options?.cmdSkip || [];

  if (!fs.existsSync(cmdsPath)) {
    fs.mkdirSync(cmdsPath, { recursive: true });
    return { loaded: 0, failed: 0 };
  }

  const cmdFiles = fs.readdirSync(cmdsPath).filter(f => f.endsWith('.js'));
  let loaded = 0;
  let failed = 0;

  console.log();
  console.log(colors.cyan('━'.repeat(60)));
  console.log(colors.cyanBright.bold('  Loading Commands'));
  console.log(colors.cyan('━'.repeat(60)));

  for (let i = 0; i < cmdFiles.length; i++) {
    const file = cmdFiles[i];
    const cmdName = file.replace('.js', '');

    if (skipList.includes(cmdName)) {
      await loadingItem('CMD', `${cmdName} (skipped)`, i + 1, cmdFiles.length);
      continue;
    }

    try {
      const cmdPath = path.join(cmdsPath, file);
      delete require.cache[require.resolve(cmdPath)];
      const cmd = require(cmdPath);

      if (cmd.config && cmd.config.name) {
        global.ST.commands.set(cmd.config.name, cmd);

        if (cmd.config.aliases && Array.isArray(cmd.config.aliases)) {
          for (const alias of cmd.config.aliases) {
            global.ST.commands.set(alias, cmd);
          }
        }

        loaded++;
        await loadingItem('CMD', cmdName, i + 1, cmdFiles.length);
      } else {
        failed++;
        await loadingItem('CMD', `${cmdName} (invalid config)`, i + 1, cmdFiles.length);
      }
    } catch (e) {
      failed++;
      await loadingItem('CMD', `${cmdName} (error)`, i + 1, cmdFiles.length);
      log.error('CMD', `Failed to load ${cmdName}: ${e.message}`);
    }
  }

  console.log();
  console.log(`  ${colors.green('✓')} Commands loaded: ${colors.greenBright(loaded)} | Failed: ${colors.redBright(failed)}`);

  return { loaded, failed };
}

async function loadEvents() {
  const eventsPath = path.join(process.cwd(), 'scripts', 'events');
  const config = global.ST.config;
  const skipList = config.options?.eventSkip || [];

  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
    return { loaded: 0, failed: 0 };
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  let loaded = 0;
  let failed = 0;

  console.log();
  console.log(colors.cyan('━'.repeat(60)));
  console.log(colors.cyanBright.bold('  Loading Events'));
  console.log(colors.cyan('━'.repeat(60)));

  for (let i = 0; i < eventFiles.length; i++) {
    const file = eventFiles[i];
    const eventName = file.replace('.js', '');

    if (skipList.includes(eventName)) {
      await loadingItem('EVT', `${eventName} (skipped)`, i + 1, eventFiles.length);
      continue;
    }

    try {
      const eventPath = path.join(eventsPath, file);
      delete require.cache[require.resolve(eventPath)];
      const event = require(eventPath);

      if (event.config && event.config.name) {
        global.ST.events.set(event.config.name, event);
        loaded++;
        await loadingItem('EVT', eventName, i + 1, eventFiles.length);
      } else {
        failed++;
        await loadingItem('EVT', `${eventName} (invalid config)`, i + 1, eventFiles.length);
      }
    } catch (e) {
      failed++;
      await loadingItem('EVT', `${eventName} (error)`, i + 1, eventFiles.length);
      log.error('EVT', `Failed to load ${eventName}: ${e.message}`);
    }
  }

  console.log();
  console.log(`  ${colors.green('✓')} Events loaded: ${colors.greenBright(loaded)} | Failed: ${colors.redBright(failed)}`);

  return { loaded, failed };
}

async function loadDatabase() {
  const config = global.ST.config;
  const dbConfig = config.database || {};

  console.log();
  console.log(colors.cyan('━'.repeat(60)));
  console.log(colors.cyanBright.bold('  Loading Database'));
  console.log(colors.cyan('━'.repeat(60)));

  try {
    if (dbConfig.type === 'mongodb' && dbConfig.mongoURL) {
      const mongoose = require('mongoose');
      await mongoose.connect(dbConfig.mongoURL);
      console.log(`  ${colors.green('✓')} MongoDB connected`);

      global.ST.userData = require('../database/userdata.js');
      global.ST.threadData = require('../database/threaddata.js');
    } else {
      const jsonPath = dbConfig.jsonPath || './database/data';
      if (!fs.existsSync(jsonPath)) {
        fs.mkdirSync(jsonPath, { recursive: true });
      }

      global.ST.userData = require('../database/userdata.js');
      global.ST.threadData = require('../database/threaddata.js');

      console.log(`  ${colors.green('✓')} JSON database initialized`);
    }
  } catch (e) {
    console.log(`  ${colors.red('✗')} Database error: ${e.message}`);

    global.ST.userData = {
      get: () => ({}),
      set: () => true,
      getAll: () => ({})
    };
    global.ST.threadData = {
      get: () => ({}),
      set: () => true,
      getAll: () => ({})
    };
  }
}

async function loadData() {
  const cmdResult = await loadCommands();
  const eventResult = await loadEvents();
  await loadDatabase();

  console.log();
  console.log(colors.cyan('━'.repeat(60)));
  console.log(colors.greenBright.bold('  All modules loaded successfully!'));
  console.log(colors.cyan('━'.repeat(60)));
  console.log();

  return {
    commands: cmdResult,
    events: eventResult
  };
}

module.exports = loadData;
