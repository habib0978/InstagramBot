const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const config = global.ST?.config?.database || {};
const dbType = config.type || 'json';
const jsonPath = path.join(process.cwd(), config.jsonPath || './database/data', 'threads.json');

let ThreadModel = null;

if (dbType === 'mongodb' && mongoose.connection.readyState === 1) {
  const threadSchema = new mongoose.Schema({
    threadID: { type: String, required: true, unique: true },
    threadName: String,
    members: [String],
    admins: [String],
    settings: { type: Object, default: {} },
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  try {
    ThreadModel = mongoose.model('Thread');
  } catch {
    ThreadModel = mongoose.model('Thread', threadSchema);
  }
} else if (dbType === 'mongodb') {
  const threadSchema = new mongoose.Schema({
    threadID: { type: String, required: true, unique: true },
    threadName: String,
    members: [String],
    admins: [String],
    settings: { type: Object, default: {} },
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  try {
    ThreadModel = mongoose.model('Thread');
  } catch {
    ThreadModel = mongoose.model('Thread', threadSchema);
  }
}

function loadJSON() {
  try {
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  } catch (e) {
    console.error('ThreadData JSON load error:', e.message);
  }
  return {};
}

function saveJSON(data) {
  try {
    const dir = path.dirname(jsonPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('ThreadData JSON save error:', e.message);
    return false;
  }
}

const threadData = {
  async get(threadID) {
    if (dbType === 'mongodb' && ThreadModel) {
      const thread = await ThreadModel.findOne({ threadID: String(threadID) });
      return thread ? thread.toObject() : null;
    }
    
    const data = loadJSON();
    return data[String(threadID)] || null;
  },
  
  async set(threadID, key, value) {
    threadID = String(threadID);
    
    if (dbType === 'mongodb' && ThreadModel) {
      await ThreadModel.findOneAndUpdate(
        { threadID },
        { $set: { [key]: value, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return true;
    }
    
    const data = loadJSON();
    if (!data[threadID]) {
      data[threadID] = { threadID };
    }
    data[threadID][key] = value;
    return saveJSON(data);
  },
  
  async create(threadID, threadData = {}) {
    threadID = String(threadID);
    
    if (dbType === 'mongodb' && ThreadModel) {
      const thread = new ThreadModel({ threadID, ...threadData });
      await thread.save();
      return thread.toObject();
    }
    
    const data = loadJSON();
    data[threadID] = {
      threadID,
      threadName: threadData.threadName || threadData.name || 'Unknown',
      members: threadData.members || [],
      admins: threadData.admins || [],
      settings: threadData.settings || {},
      data: threadData.data || {},
      createdAt: threadData.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    saveJSON(data);
    return data[threadID];
  },
  
  async getAll() {
    if (dbType === 'mongodb' && ThreadModel) {
      const threads = await ThreadModel.find({});
      return threads.map(t => t.toObject());
    }
    
    const data = loadJSON();
    return Object.values(data);
  },
  
  async delete(threadID) {
    threadID = String(threadID);
    
    if (dbType === 'mongodb' && ThreadModel) {
      await ThreadModel.deleteOne({ threadID });
      return true;
    }
    
    const data = loadJSON();
    delete data[threadID];
    return saveJSON(data);
  },
  
  async addMember(threadID, userID) {
    const thread = await this.get(threadID) || { members: [] };
    const members = thread.members || [];
    if (!members.includes(String(userID))) {
      members.push(String(userID));
      return await this.set(threadID, 'members', members);
    }
    return true;
  },
  
  async removeMember(threadID, userID) {
    const thread = await this.get(threadID) || { members: [] };
    const members = (thread.members || []).filter(m => m !== String(userID));
    return await this.set(threadID, 'members', members);
  },
  
  async setThreadInfo(threadID, info = {}) {
    const thread = (await this.get(threadID)) || { threadID: String(threadID) };
    const updated = {
      ...thread,
      threadName: info.threadName || info.name || thread.threadName || 'Unknown',
      theme: info.theme || thread.theme || null,
      updatedAt: Date.now()
    };
    
    if (dbType === 'mongodb' && ThreadModel) {
      await ThreadModel.findOneAndUpdate(
        { threadID: String(threadID) },
        { $set: updated, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return true;
    }
    
    const data = loadJSON();
    data[String(threadID)] = updated;
    return saveJSON(data);
  },
  
  async updateSettings(threadID, key, value) {
    const thread = (await this.get(threadID)) || { threadID: String(threadID), settings: {} };
    const settings = thread.settings || {};
    settings[key] = value;
    return await this.set(threadID, 'settings', settings);
  }
};

module.exports = threadData;
