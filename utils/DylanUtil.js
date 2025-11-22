const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'students.json');

/**
 * Dylan - READ Feature
 * Handles viewing and displaying student rankings
 */

// Get rankings sorted by rating type
const getRankings = async (req, res) => {
    try {
        // Uncomment the following line to test error handling
        // throw new Error('Test error');
        const { sortBy = 'rapid' } = req.query;

        // Error case 1: Invalid Sort Field
        const validSortFields = ['rapid', 'blitz', 'bullet'];
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
            });
        }

        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        // Error case 2: No Students Found
        if (!students.students || students.students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found in the database.',
                rankings: []
            });
        }

        // Error case 3: Corrupted Database Records
        const corrupted = findCorruptedRecords(students.students);
        if (corrupted.length > 0) {
            return res.status(422).json({
                success: false,
                message: `Found ${corrupted.length} corrupted records in the database`,
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

        return res.json({
            success: true,
            message: `Rankings sorted by ${sortBy}`,
            sortBy: sortBy,
            count: rankings.length,
            rankings: rankings
        });

    } catch (error) {
        console.error('Error getting rankings:', error);

        // Error case 4: Database Read Error
        if (error.code === 'ENOENT') {
            return res.status(500).json({
                success: false,
                message: 'Database file not found',
                rankings: []
            });
        }

        // Error case 5: Server Error
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rankings',
            error: error.message,
            rankings: []
        });
    }
};

// Data corruption check
function findCorruptedRecords(rankings) {
    return rankings.filter(student => {
        // Required fields must exist
        const missingField =
            !student.id ||
            student.rapid == null ||
            student.blitz == null ||
            student.bullet == null ||
            !student.createdAt;

        // Must be numbers
        const invalidNumbers =
            isNaN(student.rapid) ||
            isNaN(student.blitz) ||
            isNaN(student.bullet);

        // Must be within valid rating range
        const outOfRange =
            student.rapid < 0 || student.rapid > 3000 ||
            student.blitz < 0 || student.blitz > 3000 ||
            student.bullet < 0 || student.bullet > 3000;

        // createdAt must be valid date
        const invalidDate = isNaN(new Date(student.createdAt).getTime());

        // ID must follow format: 7 digits + 1 letter
        const invalidId = !/^[0-9]{7}[a-z]$/i.test(student.id);

        return missingField || invalidNumbers || outOfRange || invalidDate || invalidId;
    });
}

module.exports = { getRankings };