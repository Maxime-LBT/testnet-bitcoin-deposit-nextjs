import { createLogger, format, transports, Logger } from 'winston';

// Define the log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => {
    const log = `${timestamp} [${level}] : ${message} `;
    return log;
  }),
);

// Create a Winston logger instance
const logger: Logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [new transports.Console()],
});

export default logger;
