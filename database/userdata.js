const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const config = global.ST?.config?.database || {};
const dbType = config.type || 'json';
const jsonPath = path.join(process.cwd(), config.jsonPath || './database/data', 'users.json');

let UserModel = null;

if (dbType === 'mongodb' && mongoose.connection.readyState === 1) {
  const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    username: String,
    name: String,
    exp: { type: Number, default: 0 },
    money: { type: Number, default: 0 },
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  try {
    UserModel = mongoose.model('User');
  } catch {
    UserModel = mongoose.model('User', userSchema);
  }
} else if (dbType === 'mongodb') {
  const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    username: String,
    name: String,
    exp: { type: Number, default: 0 },
    money: { type: Number, default: 0 },
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  try {
    UserModel = mongoose.model('User');
  } catch {
    UserModel = mongoose.model('User', userSchema);
  }
}

function loadJSON() {
  try {
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  } catch (e) {
    console.error('UserData JSON load error:', e.message);
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
    console.error('UserData JSON save error:', e.message);
    return false;
  }
}

const userData = {
  async get(userID) {
    if (dbType === 'mongodb' && UserModel) {
      const user = await UserModel.findOne({ userID: String(userID) });
      return user ? user.toObject() : null;
    }
    
    const data = loadJSON();
    return data[String(userID)] || null;
  },
  
  async set(userID, key, value) {
    userID = String(userID);
    
    if (dbType === 'mongodb' && UserModel) {
      await UserModel.findOneAndUpdate(
        { userID },
        { $set: { [key]: value, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      return true;
    }
    
    const data = loadJSON();
    if (!data[userID]) {
      data[userID] = { userID };
    }
    data[userID][key] = value;
    return saveJSON(data);
  },
  
  async create(userID, userData = {}) {
    userID = String(userID);
    
    if (dbType === 'mongodb' && UserModel) {
      const user = new UserModel({ userID, ...userData });
      await user.save();
      return user.toObject();
    }
    
    const data = loadJSON();
    data[userID] = { userID, ...userData, createdAt: Date.now() };
    saveJSON(data);
    return data[userID];
  },
  
  async getAll() {
    if (dbType === 'mongodb' && UserModel) {
      const users = await UserModel.find({});
      return users.map(u => u.toObject());
    }
    
    const data = loadJSON();
    return Object.values(data);
  },
  
  async delete(userID) {
    userID = String(userID);
    
    if (dbType === 'mongodb' && UserModel) {
      await UserModel.deleteOne({ userID });
      return true;
    }
    
    const data = loadJSON();
    delete data[userID];
    return saveJSON(data);
  },
  
  async addMoney(userID, amount) {
    const user = await this.get(userID) || { money: 0 };
    return await this.set(userID, 'money', (user.money || 0) + amount);
  },
  
  async addExp(userID, amount) {
    const user = await this.get(userID) || { exp: 0 };
    return await this.set(userID, 'exp', (user.exp || 0) + amount);
  }
};

module.exports = userData;
