require('dotenv').config();

module.exports = {
  name        : process.env.AI_BOT_NAME     || 'RyanBot',
  sessionName : process.env.AI_SESSION_NAME  || 'ai-session',
  prefix      : process.env.AI_BOT_PREFIX   || '!',
  adminNumber : process.env.AI_ADMIN_NUMBER  || '',
  tokenFolder : 'tokens-ai',
};
