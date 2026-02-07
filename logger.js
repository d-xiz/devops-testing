const winston = require("winston");

// Start with Console only
const transports = [
  new winston.transports.Console(),
];

// ONLY write files when NOT in test mode
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports,
});

module.exports = logger;
