const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../../../data/ai_state.json');

const defaultState = () => ({
  active: false, status: '', activatedAt: null, activatedBy: null, allowedNumbers: [],
});

let _state = null;

const loadState = () => {
  if (_state) return _state;
  if (!fs.existsSync(STATE_FILE)) { _state = defaultState(); return _state; }
  try { _state = { ...defaultState(), ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) }; }
  catch { _state = defaultState(); }
  return _state;
};

const saveState = (state) => {
  _state = state;
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
};

const getState     = () => loadState();
const activate     = (status, by) => saveState({ ...loadState(), active: true, status, activatedAt: new Date().toISOString(), activatedBy: by });
const deactivate   = () => saveState({ ...loadState(), active: false, status: '', activatedAt: null });
const addNumber    = (waId) => { const s = loadState(); if (s.allowedNumbers.includes(waId)) return false; s.allowedNumbers.push(waId); saveState(s); return true; };
const removeNumber = (waId) => { const s = loadState(); const before = s.allowedNumbers.length; s.allowedNumbers = s.allowedNumbers.filter((n) => n !== waId); if (s.allowedNumbers.length === before) return false; saveState(s); return true; };
const isAllowed    = (waId) => loadState().allowedNumbers.includes(waId);

module.exports = { getState, activate, deactivate, addNumber, removeNumber, isAllowed };
