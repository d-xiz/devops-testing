const winston = require('winston');

const NODE_ENV = process.env.NODE_ENV || 'development';

const transports = [
  new winston.transports.Console()
];

// 🔥 File logging ONLY in dev & prod
if (NODE_ENV === 'development' || NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports
});

module.exports = logger;
