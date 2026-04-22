# WhatsApp AI Bot

A WhatsApp bot that acts as an AI-powered auto-reply assistant. When you're busy, unavailable, or just want a break — activate it and it handles incoming messages on your behalf using a conversational AI that speaks in your style.

## Features

- **AI Auto-reply** — Powered by Groq (Llama 3.1), replies to whitelisted contacts when you're away
- **Custom persona** — Set a status (e.g. "sleeping", "in a meeting") and the AI adapts its replies accordingly
- **Contact whitelist** — Only specific numbers get AI replies, not everyone
- **Conversation memory** — Keeps context of each conversation (up to 20 messages per contact)
- **Command system** — Manage everything via WhatsApp commands with admin protection
- **Status monitoring** — Check bot uptime, memory, and CPU usage via command

## Commands

| Command | Description |
|---|---|
| `!help` | Show all available commands |
| `!whoami` | Check your WhatsApp ID and admin status |
| `!setstatus <condition>` | Activate AI mode with a custom status |
| `!offai` | Deactivate AI mode |
| `!addnomor <number>` | Add a number to the AI whitelist |
| `!addnomor hapus <number>` | Remove a number from the whitelist |
| `!addnomor list` | View all whitelisted numbers |
| `!status` | Show bot performance metrics |

> Admin-only commands: `setstatus`, `offai`, `addnomor`, `status`

## Tech Stack

- **Runtime** — Node.js
- **WhatsApp** — [@wppconnect-team/wppconnect](https://github.com/wppconnect-team/wppconnect)
- **AI** — [Groq API](https://groq.com) (llama-3.1-8b-instant)
- **Logging** — Winston
- **Process manager** — PM2 (recommended for production)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/your-username/whatsapp-bot-ai.git
cd whatsapp-bot-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
AI_BOT_NAME=RyanBot
AI_ADMIN_NUMBER=628xxxxxxxxx@c.us

AI_OWNER_NAME=Ryan
AI_OWNER_TITLE=Staff
AI_OWNER_COMPANY=My Company
AI_OWNER_LANGUAGE=Bahasa Indonesia

GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Run

```bash
# Development
npm run dev

# Production
npm start

# With PM2
pm2 start src/index.js --name whatsapp-bot-ai
pm2 save
```

### 4. Scan QR code

On first run, a QR code will appear in the terminal. Scan it with WhatsApp on your phone. The session is saved locally so you only need to scan once.

## Usage

1. Send `!setstatus tidur` to activate AI mode (replace "tidur" with your actual status)
2. Add contacts that should receive AI replies: `!addnomor 08123456789`
3. When someone messages you, the bot replies automatically on your behalf
4. Send `!offai` to deactivate when you're back

## Project Structure

```
src/
├── index.js                    # Entry point
├── config.js                   # App config from env
├── handlers/
│   ├── messageHandler.js       # Routes messages to commands or AI
│   └── commands/
│       └── index.js            # Command definitions
├── commands/
│   └── statusCommand.js        # Bot status metrics
├── services/
│   ├── registry.js             # Command registry
│   └── ai/
│       ├── groqClient.js       # Groq API client + system prompt
│       ├── aiState.js          # Active/inactive state + whitelist
│       └── conversationHistory.js  # Per-contact message history
├── middleware/
│   └── messageFilter.js        # Filter out system/irrelevant messages
└── utils/
    ├── helpers.js              # Sender info, admin check
    └── logger.js               # Winston logger
```

## License

MIT
