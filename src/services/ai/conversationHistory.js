const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.resolve(__dirname, '../../../data/ai_conversations.json');
const MAX = 20;

let _cache = null;

const loadAll = () => {
  if (_cache) return _cache;
  if (!fs.existsSync(HISTORY_FILE)) { _cache = {}; return _cache; }
  try { _cache = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); }
  catch { _cache = {}; }
  return _cache;
};

const saveAll = (data) => {
  _cache = data;
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const getHistory = (waId) => loadAll()[waId] || [];

const appendMessage = (waId, role, content) => {
  const all = loadAll();
  if (!all[waId]) all[waId] = [];
  all[waId].push({ role, content });
  if (all[waId].length > MAX) all[waId] = all[waId].slice(-MAX);
  saveAll(all);
};

const clearHistory = (waId) => {
  const all = loadAll();
  delete all[waId];
  saveAll(all);
};

module.exports = { getHistory, appendMessage, clearHistory };
