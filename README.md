# WhatsApp AI Bot

Bot WhatsApp yang berfungsi sebagai asisten autoreply berbasis AI. Kalau kamu lagi sibuk, tidak bisa balas pesan, atau butuh istirahat aktifkan bot ini dan biarkan AI yang membalas pesan masuk atas namamu.

## Fitur

- **AI Auto-reply** — Didukung Groq (Llama 3.1), membalas pesan dari kontak yang sudah didaftarkan saat kamu tidak aktif
- **Persona kustom** — Atur status (misal: "tidur", "rapat") dan AI akan menyesuaikan balasannya
- **Whitelist kontak** — Hanya nomor tertentu yang mendapat balasan AI, bukan semua orang
- **Memori percakapan** — Menyimpan konteks setiap percakapan
- **Sistem perintah** — Kelola semua fitur lewat perintah WhatsApp dengan proteksi admin
- **Monitoring status** — Cek uptime, penggunaan memori, dan CPU bot lewat perintah

## Perintah

| Perintah                  | Keterangan                              |
| ------------------------- | --------------------------------------- |
| `!help`                   | Tampilkan semua perintah yang tersedia  |
| `!whoami`                 | Cek WhatsApp ID dan status admin kamu   |
| `!setstatus <kondisi>`    | Aktifkan mode AI dengan status tertentu |
| `!offai`                  | Matikan mode AI                         |
| `!addnomor <nomor>`       | Tambahkan nomor ke whitelist AI         |
| `!addnomor hapus <nomor>` | Hapus nomor dari whitelist              |
| `!addnomor list`          | Lihat semua nomor yang terdaftar        |
| `!status`                 | Tampilkan metrik performa bot           |

> Perintah khusus admin: `setstatus`, `offai`, `addnomor`, `status`

## Tech Stack

- **Runtime** — Node.js
- **WhatsApp** — [@wppconnect-team/wppconnect](https://github.com/wppconnect-team/wppconnect)
- **AI** — [Groq API](https://groq.com) (llama-3.1-8b-instant)
- **Logging** — Winston
- **Process manager** — PM2

## Cara Penggunaan

### 1. Clone & install

```bash
git clone https://github.com/danielfbrn/whatsapp-bot-ai.git
cd whatsapp-bot-ai
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Edit file `.env` sesuai kebutuhanmu:

```env
AI_BOT_NAME=RyanBot
AI_ADMIN_NUMBER=628xxxxxxxxx@c.us

AI_OWNER_NAME=Ryan
AI_OWNER_TITLE=Staff
AI_OWNER_COMPANY=My Company
AI_OWNER_LANGUAGE=Bahasa Indonesia

GROQ_API_KEY=your_groq_api_key_here
```

Dapatkan Groq API key gratis di [console.groq.com](https://console.groq.com).

### 3. Jalankan bot

```bash
# Development
npm run dev

# Production
npm start

# Dengan PM2
pm2 start src/index.js --name whatsapp-bot-ai
pm2 save
```

### 4. Scan QR code

Saat pertama kali dijalankan, QR code akan muncul di terminal. Scan menggunakan WhatsApp di HP kamu. Sesi akan tersimpan secara lokal sehingga kamu hanya perlu scan sekali.

## Cara Pakai

1. Kirim `!setstatus tidur` untuk mengaktifkan mode AI (ganti "tidur" dengan kondisi kamu)
2. Tambahkan kontak yang ingin dilayani AI: `!addnomor 08123456789`
3. Saat ada yang mengirim pesan, bot akan membalas otomatis atas namamu
4. Kirim `!offai` untuk mematikan mode AI saat kamu sudah aktif kembali

## Struktur Project

```
src/
├── index.js                    # Entry point
├── config.js                   # Konfigurasi dari env
├── handlers/
│   ├── messageHandler.js       # Routing pesan ke command atau AI
│   └── commands/
│       └── index.js            # Definisi semua perintah
├── commands/
│   └── statusCommand.js        # Metrik performa bot
├── services/
│   ├── registry.js             # Registry perintah
│   └── ai/
│       ├── groqClient.js       # Groq API client + system prompt
│       ├── aiState.js          # State aktif/nonaktif + whitelist
│       └── conversationHistory.js  # Riwayat percakapan per kontak
├── middleware/
│   └── messageFilter.js        # Filter pesan sistem/tidak relevan
└── utils/
    ├── helpers.js              # Info pengirim, cek admin
    └── logger.js               # Winston logger
```

## Screenshot

![Image](https://github.com/user-attachments/assets/76a31e71-5643-42b8-ab29-66463e8c0226)

![Image](https://github.com/user-attachments/assets/6988739a-bf8f-4ce3-bbd2-5502d0794b06)
