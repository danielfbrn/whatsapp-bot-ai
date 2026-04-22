const os = require('os');

const fmt = (n) => n.toFixed(1);
const fmtMb = (bytes) => `${fmt(bytes / 1024 / 1024)} MB`;

const fmtUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m ${s}d`;
  return `${m}m ${s}d`;
};

const nowWIB = () =>
  new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

const getCpuUsage = () =>
  new Promise((resolve) => {
    const start = process.cpuUsage();
    setTimeout(() => {
      const diff = process.cpuUsage(start);
      const totalMs = (diff.user + diff.system) / 1000;
      const pct = (totalMs / 500) * 100;
      resolve(Math.min(pct, 100));
    }, 500);
  });

const registerStatusCommand = (registry, config) => {
  const handler = async (client, message, args, sender, target) => {
    const replyTo = target || message.from;

    const mem       = process.memoryUsage();
    const cpuPct    = await getCpuUsage();
    const uptimeSec = process.uptime();
    const totalMem  = os.totalmem();
    const freeMem   = os.freemem();
    const usedMem   = totalMem - freeMem;
    const cpuCount  = os.cpus().length;
    const loadAvg   = os.loadavg();

    const text =
      `📊 *Status Bot — ${config.name}*\n${'─'.repeat(30)}\n\n` +
      `🕐 Waktu      : ${nowWIB()} WIB\n` +
      `⏱️  Uptime     : ${fmtUptime(uptimeSec)}\n\n` +
      `💻 *Proses (Node.js)*\n` +
      `   Heap Used  : ${fmtMb(mem.heapUsed)}\n` +
      `   Heap Total : ${fmtMb(mem.heapTotal)}\n` +
      `   RSS        : ${fmtMb(mem.rss)}\n` +
      `   CPU Sample : ${fmt(cpuPct)}%\n\n` +
      `🖥️  *Server*\n` +
      `   RAM Used   : ${fmtMb(usedMem)} / ${fmtMb(totalMem)}\n` +
      `   RAM Free   : ${fmtMb(freeMem)}\n` +
      (loadAvg[0] > 0
        ? `   Load Avg   : ${fmt(loadAvg[0])} / ${fmt(loadAvg[1])} / ${fmt(loadAvg[2])}\n`
        : '') +
      `   CPU        : ${cpuCount} core\n` +
      `   Platform   : ${os.platform()} ${os.arch()}\n` +
      `   Node.js    : ${process.version}`;

    await client.sendText(replyTo, text);
  };

  registry.register('status', handler, {
    description: 'Cek performa & resource bot',
    usage: 'status',
    adminOnly: true,
  });
};

module.exports = { registerStatusCommand };
