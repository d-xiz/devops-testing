/**
 * Dylan - READ Feature (Frontend)
 * Handles viewing and displaying student rankings
 */

// Load and display rankings
async function loadRankings() {
    const sortBy = document.getElementById('sort-by')?.value || 'rapid';
    const tbody = document.getElementById('rankings-body');
    const messageDiv = document.getElementById('view-message');
    const container = document.getElementById('rankings-container');

    // Add updating class for smooth transition
    if (container) {
        container.classList.add('updating');
    }

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading rankings</td></tr>';
    messageDiv.style.display = 'none';

    // Validation 1: Check if sort criteria is valid
    const validSortFields = ['rapid', 'blitz', 'bullet'];
    if (!validSortFields.includes(sortBy)) {
        tbody.innerHTML = '';
        if (container) {
            container.classList.remove('updating');
        }
        messageDiv.textContent = `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`;
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`/api/rankings?sortBy=${sortBy}`);
        const result = await response.json();

        if (result.success && result.rankings.length > 0) {
            // Clear loading state
            tbody.innerHTML = '';

            // Validation 2: Check for corrupted records
            const corrupted = findCorruptedRecords(result.rankings);

            if (corrupted.length > 0) {
                showViewMessage(
                    `Found ${corrupted.length} corrupted record(s). Please fix them in the database.`,
                    'error'
                );

                if (container) container.classList.remove('updating');
                return;
            }

            // Display each student in the table
            result.rankings.forEach(student => {
                const row = document.createElement('tr');

                // Format the date
                const joinDate = new Date(student.createdAt).toLocaleDateString('en-SG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                // Highlight the sorted column
                const rapidClass = sortBy === 'rapid' ? 'class="sorted-column"' : '';
                const blitzClass = sortBy === 'blitz' ? 'class="sorted-column"' : '';
                const bulletClass = sortBy === 'bullet' ? 'class="sorted-column"' : '';

                row.innerHTML = `
                    <td>${student.rank}</td>
                    <td><strong>${student.id}</strong></td>
                    <td ${rapidClass}>${student.rapid}</td>
                    <td ${blitzClass}>${student.blitz}</td>
                    <td ${bulletClass}>${student.bullet}</td>
                    <td>${joinDate}</td>
                `;

                tbody.appendChild(row);
            });

            showViewMessage(`Showing ${result.count} student(s) sorted by ${sortBy.toUpperCase()} rating`, 'success');

            // Remove updating class after a short delay for smooth animation
            setTimeout(() => {
                if (container) {
                    container.classList.remove('updating');
                }
            }, 100);

        } else {
            // Validation 3: No students found / Server error
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No students found. Create accounts to see rankings.</td></tr>';
            showViewMessage(result.message || 'No students found in the database.', 'error');

            if (container) {
                container.classList.remove('updating');
            }
        }

    } catch (error) {
        console.error('Error loading rankings:', error);
        // Validation 4: Network error
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">Failed to load rankings. Please try again.</td></tr>';
        showViewMessage('Failed to load rankings. Please check your connection and try again.', 'error');

        if (container) {
            container.classList.remove('updating');
        }
    }
}

// Show message for view section
function showViewMessage(message, type) {
    const messageDiv = document.getElementById('view-message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Load rankings when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only load if view section exists
    if (document.getElementById('view-section')) {
        loadRankings();
    }
});

// DATA VALIDATION / CORRUPTION CHECK
function findCorruptedRecords(rankings) {
    return rankings.filter(student => {
        // Required fields must exist
        const missingField =
            !student.id ||
            student.rapid == null ||
            student.blitz == null ||
            student.bullet == null ||
            !student.createdAt ||
            student.rank == null;

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
