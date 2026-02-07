const winston = require("winston");

const transports = [
  new winston.transports.Console(),
];

// Only write files when NOT testing
if (process.env.NODE_ENV !== "test") {
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
