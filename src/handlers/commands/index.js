const registry = require('../../services/registry');
const config   = require('../../config');
const { isAdmin, extractPhoneFromWaId } = require('../../utils/helpers');
const { getState, activate, deactivate, addNumber, removeNumber } = require('../../services/ai/aiState');

const helpCommand = async (client, message, args, sender) => {
  const adminUser  = isAdmin(sender.id, config.adminNumber);
  const commands   = registry.getAll().filter((c) => adminUser || !c.adminOnly);
  const publicCmds = commands.filter((c) => !c.adminOnly);
  const adminCmds  = commands.filter((c) =>  c.adminOnly);
  const fmt = (cmds) => cmds.map((c) => `• *${config.prefix}${c.usage}*\n  ${c.description}`).join('\n');

  let text = `🤖 *${config.name} — Daftar Perintah*\n${'─'.repeat(30)}\n\n📋 *Umum*\n${fmt(publicCmds)}`;
  if (adminUser && adminCmds.length) text += `\n\n🔐 *Admin Only*\n${fmt(adminCmds)}`;
  text += `\n\nPrefix: *${config.prefix}*`;
  await client.sendText(message.from, text);
};
registry.register('help', helpCommand, { description: 'Tampilkan daftar perintah', usage: 'help' });

const whoamiCommand = async (client, message, args, sender) => {
  const adminUser = isAdmin(sender.id, config.adminNumber);
  await client.sendText(message.from,
    `🔍 *Info Identitas Kamu*\n${'─'.repeat(30)}\n` +
    `📱 WA ID : \`${sender.id}\`\n` +
    `📞 Nomor : ${sender.phone}\n` +
    `👤 Nama  : ${sender.name}\n` +
    `🔐 Admin : ${adminUser ? '✅ Ya' : '❌ Bukan admin'}\n` +
    (!adminUser ? `\n💡 Tambahkan ke *AI_ADMIN_NUMBER* di .env:\n\`${sender.id}\`` : '')
  );
};
registry.register('whoami', whoamiCommand, { description: 'Cek WA ID kamu', usage: 'whoami' });

const setStatusCommand = async (client, message, args, sender) => {
  if (!args.length) {
    const state = getState();
    await client.sendText(message.from,
      state.active
        ? `🤖 AI mode *aktif*\n📌 Status: _${state.status}_\n\nGunakan *!offai* untuk mematikan.`
        : `❓ Gunakan: *!setstatus <kondisimu>*\nContoh: \`!setstatus tidur\``
    );
    return;
  }
  const status = args.join(' ');
  activate(status, sender.id);
  const state = getState();
  await client.sendText(message.from,
    `✅ *AI Mode Aktif!*\n${'─'.repeat(25)}\n` +
    `📌 Status kamu       : _${status}_\n` +
    `📱 Nomor dilayani AI : *${state.allowedNumbers.length} nomor*\n\n` +
    `Ketik *!offai* untuk mematikan.`
  );
};
registry.register('setstatus', setStatusCommand, { description: 'Aktifkan AI auto-reply dengan status tertentu', usage: 'setstatus <kondisi>', adminOnly: true });

const offAiCommand = async (client, message, args, sender) => {
  const state = getState();
  if (!state.active) { await client.sendText(message.from, '⚠️ AI mode sudah *tidak aktif*.'); return; }
  const prevStatus = state.status;
  let durasiText = '';
  if (state.activatedAt) {
    const ms = Date.now() - new Date(state.activatedAt).getTime();
    const jam = Math.floor(ms / 3_600_000);
    const menit = Math.floor((ms % 3_600_000) / 60_000);
    durasiText = `⏱️ Durasi aktif : ${jam > 0 ? `${jam} jam ` : ''}${menit} menit\n`;
  }
  deactivate();
  await client.sendText(message.from,
    `🔴 *AI Mode Dimatikan*\n${'─'.repeat(25)}\n` +
    `📌 Status sebelumnya : _${prevStatus}_\n${durasiText}\n` +
    `Kamu sekarang menerima pesan secara manual.`
  );
};
registry.register('offai', offAiCommand, { description: 'Matikan AI auto-reply mode', usage: 'offai', adminOnly: true });

const normalizeToWaId = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}@c.us`;
  if (digits.length >= 10)   return `${digits}@c.us`;
  return `62${digits}@c.us`;
};

const addNomorCommand = async (client, message, args) => {
  if (!args.length || args[0].toLowerCase() === 'list') {
    const state = getState();
    if (!state.allowedNumbers.length) {
      await client.sendText(message.from,
        `📋 Belum ada nomor terdaftar.\nTambah: *!addnomor <nomor>*\nContoh: \`!addnomor 08123456789\``
      ); return;
    }
    const list = state.allowedNumbers.map((id, i) => `${i + 1}. ${extractPhoneFromWaId(id)}`).join('\n');
    await client.sendText(message.from,
      `📋 *Nomor terdaftar untuk AI (${state.allowedNumbers.length})*\n${'─'.repeat(25)}\n${list}\n\nHapus: *!addnomor hapus <nomor>*`
    ); return;
  }

  if (args[0].toLowerCase() === 'hapus') {
    if (!args[1]) { await client.sendText(message.from, '❌ Sertakan nomor yang ingin dihapus.'); return; }
    const waId = normalizeToWaId(args.slice(1).join(''));
    const removed = removeNumber(waId);
    await client.sendText(message.from,
      removed
        ? `🗑️ Nomor *${extractPhoneFromWaId(waId)}* berhasil dihapus.`
        : `❌ Nomor *${extractPhoneFromWaId(waId)}* tidak ditemukan.`
    ); return;
  }

  const waId = normalizeToWaId(args.join(''));
  const added = addNumber(waId);
  const state = getState();
  await client.sendText(message.from,
    added
      ? `✅ Nomor *${extractPhoneFromWaId(waId)}* ditambahkan!\n📋 Total: *${state.allowedNumbers.length} nomor*`
      : `⚠️ Nomor *${extractPhoneFromWaId(waId)}* sudah ada di daftar.`
  );
};
registry.register('addnomor', addNomorCommand, { description: 'Kelola nomor yang dilayani AI', usage: 'addnomor <nomor> | addnomor hapus <nomor> | addnomor list', adminOnly: true });

const { registerStatusCommand } = require('../../commands/statusCommand');
registerStatusCommand(registry, config);
