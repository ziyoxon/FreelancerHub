const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, prettyPrint, json, colorize } =
  format;

require("winston-mongodb");
const config = require("config");

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [
    // o'zgazishlarni consolega yozib borish
    new transports.Console({
      level: "debug",
      format: combine(colorize(), format.simple()),
    }),
    // o'zgazishlarni faylga yozib borishv
    new transports.File({
      filename: "log/error.log",
      level: "error",
      handleExceptions: true,
      handleRejections: true,
      //   exitOnError: false,
    }),
    // o'zgazishlarni faylga yozib borish
    new transports.File({ filename: "log/combine.log", level: "debug" }),
    // o'zgazishlarni mongoDB ga yozib borish
    new transports.MongoDB({
      db: config.get("dbAtlasUri"),
      options: { useUnifiedTopology: true },
    }),
  ],
});

// Xatoliklarni faylga yozib borish
logger.exitOnError = false;
// logger.exceptions.handle(
//   new transports.File({ filename: "./log/exceptions.log" })
// );
// logger.rejections.handle(
//   new transports.File({ filename: "./log/rejections.log" })
// );

module.exports = logger;
