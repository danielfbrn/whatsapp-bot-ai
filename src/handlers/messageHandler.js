const { shouldProcessMessage, logMessage } = require('../middleware/messageFilter');
const { getSenderInfo, isAdmin, isGroupMessage } = require('../utils/helpers');
const { getState } = require('../services/ai/aiState');
const { getHistory, appendMessage } = require('../services/ai/conversationHistory');
const { chat } = require('../services/ai/groqClient');
const { createLogger } = require('../utils/logger');
const registry = require('../services/registry');
const config   = require('../config');

const logger = createLogger(config.name);

const handleCommand = async (client, message) => {
  const body = message.body || '';
  if (!body.startsWith(config.prefix)) return false;

  const parts   = body.slice(config.prefix.length).trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args    = parts.slice(1);
  const sender  = getSenderInfo(message);

  if (!registry.has(command)) {
    if (isGroupMessage(message)) return false;
    await client.sendText(message.from,
      `❓ Perintah *${config.prefix}${command}* tidak dikenal.\nKetik *${config.prefix}help* untuk bantuan.`
    );
    return true;
  }

  const cmd = registry.get(command);

  if (cmd.adminOnly && !isAdmin(sender.id, config.adminNumber)) {
    await client.sendText(message.from, '🚫 Perintah ini hanya bisa digunakan oleh admin.');
    return true;
  }

  try {
    logger.info(`⚡ Command: ${command} by ${sender.name}`);
    await cmd.handler(client, message, args, sender);
  } catch (err) {
    logger.error(`Error command "${command}": ${err.message}`);
    await client.sendText(message.from, '❌ Terjadi kesalahan. Coba lagi nanti.');
  }
  return true;
};

const handleAiReply = async (client, message) => {
  if (isGroupMessage(message)) return false;

  const state    = getState();
  const senderId = message.sender?.id || message.from;

  if (!state.active) return false;
  if (!state.allowedNumbers.includes(senderId)) return false;

  const userText = (message.body || '').trim();
  if (!userText) return false;

  logger.info(`🤖 AI handling from=${senderId}: "${userText.slice(0, 60)}"`);

  try {
    await client.startTyping(message.from);
    const history = getHistory(senderId);
    const aiReply = await chat([...history, { role: 'user', content: userText }], state.status);
    appendMessage(senderId, 'user', userText);
    appendMessage(senderId, 'assistant', aiReply);
    await client.stopTyping(message.from);
    await client.sendText(message.from, aiReply);
    return true;
  } catch (err) {
    await client.stopTyping(message.from).catch(() => {});
    const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    logger.error(`❌ AI error: ${detail}`);
    await client.sendText(message.from, '⚠️ Maaf, asisten AI sedang tidak bisa memproses pesanmu saat ini.');
    return true;
  }
};

const onMessage = async (client, message) => {
  if (!shouldProcessMessage(message)) return;
  logMessage(message, logger);

  if (await handleCommand(client, message)) return;
  await handleAiReply(client, message);
};

module.exports = { onMessage };
