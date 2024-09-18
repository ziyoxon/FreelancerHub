const winston = require("winston");
const expressWinston = require("express-winston");
const { format, transports } = require("winston");
const { combine, timestamp, prettyPrint, json } = format;

// Custom logger configuration
const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    prettyPrint(),
    json() // Loglarni JSON formatida yozadi
  ),
  transports: [
    new transports.File({ filename: "log/error.log", level: "error" }), // Loglar 'log/error.log' fayliga yoziladi
    new transports.File({ filename: "log/combined.log" }), // Barcha loglar 'log/combined.log' fayliga yoziladi
  ],
});

// Express uchun so'rovlarni log qilish
const expressWinstonLogger = expressWinston.logger({
  transports: [
    new transports.File({ filename: "log/combined.log" }), // Barcha so'rovlar bu faylga yoziladi
  ],
  format: combine(timestamp(), prettyPrint(), json()),
  msg: "HTTP {{req.method}} {{req.url}}", // Log yozuvidagi xabar
  expressFormat: true, // Express formatini qo'llash
  colorize: false,
});

// Express uchun xatoliklarni log qilish
const expressWinstonErrorLogger = expressWinston.errorLogger({
  transports: [
    new transports.File({ filename: "log/error.log", level: "error" }), // Faqat xatolar 'log/error.log' fayliga yoziladi
  ],
  format: combine(timestamp(), json()),
});

module.exports = {
  logger,
  expressWinstonLogger,
  expressWinstonErrorLogger,
};
