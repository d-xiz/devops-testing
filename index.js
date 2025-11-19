const express = require('express');
const path = require('path');

// Import utility modules for each CRUD operation
const CreateStudentUtil = require('./utils/CreateStudentUtil');
const ViewRankingsUtil = require('./utils/DylanUtil');
const gengyueutils = require('./utils/gengyueutils');
const DeleteAccountUtil = require('./utils/DanishUtil');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ===== Daniella - CREATE API Endpoints =====
app.post('/api/students', CreateStudentUtil.createStudent);

// ===== Dylan - READ API Endpoints =====
app.get('/api/rankings', ViewRankingsUtil.getRankings);

// ===== Gengyue - UPDATE API Endpoints =====
app.post('/api/login', gengyueutils.loginStudent);
app.get('/api/students/:id', gengyueutils.getStudentById);
app.put('/api/students/:id', gengyueutils.updateScores);

// ===== Danish- DELETE API Endpoints =====
app.delete('/api/students/:id', DeleteAccountUtil.deleteStudent);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Chess Club Ranking System running on http://localhost:${PORT}`);
    console.log(`Server started at ${new Date().toLocaleString()}`);
});