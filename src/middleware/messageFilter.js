const { isFromSelf } = require('../utils/helpers');

const shouldProcessMessage = (message) => {
  if (isFromSelf(message)) return false;
  if (!message.body && message.type !== 'image' && message.type !== 'document') return false;
  if (message.chatId === 'status@broadcast') return false;
  return true;
};

const logMessage = (message, logger) => {
  logger.info(
    `[${message.type?.toUpperCase()}] From: ${message.sender?.pushname || message.from} | ` +
    `Chat: ${message.chatId} | Body: "${(message.body || '').slice(0, 60)}"`
  );
};

module.exports = { shouldProcessMessage, logMessage };
