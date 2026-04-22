const winston = require('winston');
const path = require('path');
const { combine, timestamp, printf, colorize, errors } = winston.format;

const createLogger = (botName) => {
  const slug = botName.toLowerCase().replace(/\s/g, '-');
  const logFile = path.resolve(`logs/${slug}.log`);

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      printf(({ level, message, timestamp: ts, stack }) =>
        `[${ts}] ${level.toUpperCase()}: ${stack || message}`
      )
    ),
    transports: [
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          printf(({ level, message, timestamp: ts, stack }) =>
            `[${ts}] [${botName}] ${level.toUpperCase()}: ${stack || message}`
          )
        ),
      }),
      new winston.transports.File({
        filename: logFile,
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
      }),
    ],
  });
};

module.exports = { createLogger };
