const formatPhoneToWaId = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.endsWith('@c.us') ? cleaned : `${cleaned}@c.us`;
};

const extractPhoneFromWaId = (waId) =>
  waId.replace('@c.us', '').replace('@g.us', '');

const isGroupMessage = (message) => message.chatId?.endsWith('@g.us') ?? false;

const isFromSelf = (message) => message.fromMe === true;

const getSenderInfo = (message) => {
  const senderId = message.sender?.id || message.author || message.from;
  return {
    id: senderId,
    name: message.sender?.name || message.sender?.pushname || 'Unknown',
    phone: extractPhoneFromWaId(senderId),
    isGroup: isGroupMessage(message),
  };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseAdminList = (envStr = '') =>
  envStr.split(',').map((n) => n.trim()).filter(Boolean);

const isAdmin = (senderId, adminEnvStr) =>
  parseAdminList(adminEnvStr).includes(senderId);

module.exports = {
  formatPhoneToWaId,
  extractPhoneFromWaId,
  isGroupMessage,
  isFromSelf,
  getSenderInfo,
  delay,
  parseAdminList,
  isAdmin,
};
