require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const wppconnect = require('@wppconnect-team/wppconnect');
const config = require('./config');
const { onMessage } = require('./handlers/messageHandler');
const { createLogger } = require('./utils/logger');

require('./handlers/commands/index');

const logger = createLogger(config.name);

function clearChromeLocks() {
  const sessionDir = path.resolve(config.tokenFolder, config.sessionName);
  const lockFiles = ['SingletonLock', 'SingletonCookie', 'SingletonSocket'];
  for (const file of lockFiles) {
    const lockPath = path.join(sessionDir, file);
    try {
      if (fs.existsSync(lockPath)) {
        fs.rmSync(lockPath, { force: true, recursive: true });
        logger.info(`Removed stale lock: ${lockPath}`);
      }
    } catch (e) {
      logger.warn(`Could not remove lock ${lockPath}: ${e.message}`);
    }
  }
}

const start = async () => {
  logger.info(`Starting ${config.name}...`);
  clearChromeLocks();

  const client = await wppconnect.create({
    session: config.sessionName,
    folderNameToken: config.tokenFolder,
    headless: true,
    logLevel: 'error',
    debug: false,
    logQR: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--js-flags=--max-old-space-size=256',
      '--renderer-process-limit=2',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
    autoClose: false,
    disableWelcome: true,
    updatesLog: false,
    waitForLogin: true,
    puppeteerOptions: { protocolTimeout: 600000 },

    catchQR: (_, asciiQR, attempt) => {
      logger.info(`[${config.name}] QR attempt ${attempt} — scan below:`);
      console.log(asciiQR);
    },
    statusFind: (status, session) => {
      logger.info(`[${session}] ${status}`);
      if (status === 'qrReadError' || status === 'autocloseCalled') {
        logger.warn(`Session error: ${status} — restarting in 5s...`);
        setTimeout(() => process.exit(1), 5000);
      }
    },
  });

  client.onMessage((msg) => onMessage(client, msg));

  setInterval(async () => {
    try { await client.getConnectionState(); } catch {}
  }, 55 * 1000);

  client.onStateChange((state) => {
    logger.info(`State: ${state}`);
    if (state === 'CONFLICT') client.useHere().catch(() => {});
  });

  client.onStreamChange((state) => {
    if (state === 'DISCONNECTED') logger.warn('Stream disconnected');
  });

  logger.info(`${config.name} ready!`);
};

process.on('uncaughtException',  (e) => logger.error('uncaughtException:', e));
process.on('unhandledRejection', (e) => logger.error('unhandledRejection:', e));
process.on('SIGINT',  () => { logger.info('Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { logger.info('Shutting down...'); process.exit(0); });

start();
