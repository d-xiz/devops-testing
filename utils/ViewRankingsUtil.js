const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'students.json');

/**
 * Dylan - READ Feature
 * Handles viewing and displaying student rankings
 */

// Get all students (basic read operation)
const getAllStudents = async (req, res) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        // Error case 1: No students found
        if (!students.students || students.students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found in the database.',
                students: []
            });
        }

        res.json({
            success: true,
            message: `Found ${students.students.length} student(s)`,
            count: students.students.length,
            students: students.students
        });

    } catch (error) {
        console.error('Error reading students:', error);

        // Error case 2: Database read error
        if (error.code === 'ENOENT') {
            return res.status(500).json({
                success: false,
                message: 'Database file not found. Please create student accounts first.',
                students: []
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve student data',
            error: error.message,
            students: []
        });
    }
};

// Get rankings sorted by rating type
const getRankings = async (req, res) => {
    try {
        // Uncomment the following line to test error handling
        // throw new Error('Test error');
        const { sortBy = 'rapid' } = req.query;

        // Validation: Check if sortBy is valid
        const validSortFields = ['rapid', 'blitz', 'bullet'];
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
            });
        }

        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        // Error case 1: No students found
        if (!students.students || students.students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found in the database.',
                rankings: []
            });
        }

        // Sort students by the selected rating (descending order)
        const sortedStudents = [...students.students].sort((a, b) => {
            return b[sortBy] - a[sortBy];
        });

        // Add ranking position
        const rankings = sortedStudents.map((student, index) => ({
            rank: index + 1,
            ...student
        }));

        res.json({
            success: true,
            message: `Rankings sorted by ${sortBy}`,
            sortBy: sortBy,
            count: rankings.length,
            rankings: rankings
        });

    } catch (error) {
        console.error('Error getting rankings:', error);

        // Error case 2: Database read error
        if (error.code === 'ENOENT') {
            return res.status(500).json({
                success: false,
                message: 'Database file not found. Please create student accounts first.',
                rankings: []
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rankings',
            error: error.message,
            rankings: []
        });
    }
};

module.exports = {
    getAllStudents,
    getRankings
};
