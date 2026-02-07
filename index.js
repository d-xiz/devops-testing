const express = require('express');
const path = require('path');
const logger = require('./logger');
let statusMonitor;
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  statusMonitor = require('express-status-monitor');
}

// Import utility modules for each CRUD operation
const CreateStudentUtil = require('./utils/DaniellaUtil');
const ViewRankingsUtil = require('./utils/DylanUtil');
const UpdateStudentUtil = require('./utils/GengyueUtil');
const DeleteAccountUtil = require('./utils/DanishUtil');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
/* istanbul ignore next */
if (statusMonitor) {
  app.use(statusMonitor());
}

// ===== Daniella - CREATE API Endpoints =====
app.post('/api/students', CreateStudentUtil.createStudent);

// ===== Dylan - READ API Endpoints =====
app.get('/api/rankings', ViewRankingsUtil.getRankings);

// ===== Gengyue - UPDATE API Endpoints =====
app.post('/api/login', UpdateStudentUtil.loginStudent);
app.get('/api/students/:id', UpdateStudentUtil.getStudentById);
app.put('/api/students/:id', UpdateStudentUtil.updateScores);

// ===== Danish- DELETE API Endpoints =====
app.delete('/api/students/:id', DeleteAccountUtil.deleteStudent);

// Serve main page
/* istanbul ignore next */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
/* istanbul ignore next */
if (require.main === module) {

  app.listen(PORT, '0.0.0.0', () => {
      console.log(`Chess Club Ranking System running on port ${PORT}`);
      console.log(`Server started at ${new Date().toLocaleString()}`);
      logger.info(`Server started at ${new Date().toLocaleString()}`);
      logger.error('This is a test error log on server start');
  });

}

module.exports = app;
