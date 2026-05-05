const axios = require('axios');

const getImageBase64 = async (client, message) => {
  if (message.type === 'image') return await client.downloadMedia(message);
    if (message.quotedMsg?.type === 'image' && message.quotedMsg?.id) {
    return await client.downloadMedia(message.quotedMsg);
  }
  return null;
};

const removeBackground = async (base64, apiKey) => {
  const raw = base64.replace(/^data:image\/\w+;base64,/, '');
  const res = await axios.post(
    'https://api.remove.bg/v1.0/removebg',
    { image_file_b64: raw, size: 'auto' },
    { headers: { 'X-Api-Key': apiKey }, responseType: 'arraybuffer' }
  );
  return `data:image/png;base64,${Buffer.from(res.data).toString('base64')}`;
};

const registerStickerCommand = (registry) => {
  const handler = async (client, message, args) => {
    const nobg = args[0]?.toLowerCase() === 'nobg';

    let base64;
    try {
      base64 = await getImageBase64(client, message);
    } catch {
      await client.sendText(message.from, '❌ Gagal mengambil gambar. Coba kirim ulang gambarnya.');
      return;
    }

    if (!base64) {
      await client.sendText(message.from,
        `🖼️ Cara pakai:\n• Kirim gambar dengan caption *!sticker*\n• Reply gambar dengan *!sticker*\n• Hapus background: *!sticker nobg*`
      );
      return;
    }

    try {
      let imageData = base64;
      if (nobg) {
        const apiKey = process.env.REMOVE_BG_API_KEY;
        if (!apiKey) { await client.sendText(message.from, '❌ REMOVE_BG_API_KEY belum diatur di .env'); return; }
        await client.sendText(message.from, '⏳ Menghapus background...');
        imageData = await removeBackground(base64, apiKey);
      }
      await client.sendImageAsSticker(message.from, imageData);
    } catch (err) {
      const msg = err.response?.status === 402
        ? '❌ Kuota remove.bg habis. Coba lagi bulan depan.'
        : '❌ Gagal membuat sticker. Pastikan gambar valid dan coba lagi.';
      await client.sendText(message.from, msg);
    }
  };

  registry.register('sticker', handler, {
    description: 'Buat sticker dari gambar',
    usage: 'sticker | sticker nobg',
  });
};

module.exports = { registerStickerCommand };
