
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] : ${message}`;
});

// Create logger
export const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),

  transports: [
    // Colorful console output
    new transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),

    // File logs
    new transports.File({ filename: "logs/error.log", level: "error" }), // error only
    new transports.File({ filename: "logs/warn.log", level: "warn" }),   // warn only
    new transports.File({ filename: "logs/combined.log" }),              // all logs
  ],
});

// Shortcut functions
export const log = {
  info: (msg: string) => logger.info(msg),
  warn: (msg: string) => logger.warn(msg),
  error: (msg: string) => logger.error(msg),
  debug: (msg: string) => logger.debug(msg),
};
