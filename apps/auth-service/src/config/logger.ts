import { createLogger, format, transports } from "winston";

export const authLogger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: "logs/refresh.log" }),
    new transports.Console(),
  ],
});
