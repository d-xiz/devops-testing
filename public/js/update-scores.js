/**
 * Member C - UPDATE Feature (Frontend)
 * Handles student login and score updates
 */

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('login-id').value.trim();

    if (!id) {
        showUpdateMessage('login', 'Please enter your Student ID.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });

        const result = await response.json();

        if (result.success) {
            // Login successful - show update form
            showUpdateMessage('login', result.message, 'success');

            // Hide login form, show update form
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('update-container').style.display = 'block';

            // Populate current scores
            document.getElementById('current-rapid').textContent = result.student.rapid;
            document.getElementById('current-blitz').textContent = result.student.blitz;
            document.getElementById('current-bullet').textContent = result.student.bullet;

            // Set hidden ID field
            document.getElementById('update-id').value = result.student.id;

            // Pre-fill form with current scores
            document.getElementById('new-rapid').value = result.student.rapid;
            document.getElementById('new-blitz').value = result.student.blitz;
            document.getElementById('new-bullet').value = result.student.bullet;

        } else {
            showUpdateMessage('login', result.message, 'error');
        }

    } catch (error) {
        console.error('Error during login:', error);
        showUpdateMessage('login', 'Login failed. Please try again.', 'error');
    }
});

// Handle update form submission
document.getElementById('update-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('update-id').value;
    const rapid = document.getElementById('new-rapid').value;
    const blitz = document.getElementById('new-blitz').value;
    const bullet = document.getElementById('new-bullet').value;

    if (!rapid || !blitz || !bullet) {
        showUpdateMessage('update', 'Please fill in all rating fields.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rapid: parseInt(rapid),
                blitz: parseInt(blitz),
                bullet: parseInt(bullet)
            })
        });

        const result = await response.json();

        if (result.success) {
            showUpdateMessage('update', result.message, 'success');

            // Update displayed current scores
            document.getElementById('current-rapid').textContent = result.student.rapid;
            document.getElementById('current-blitz').textContent = result.student.blitz;
            document.getElementById('current-bullet').textContent = result.student.bullet;

            // Show changes
            if (result.changes) {
                const changesText = `
                    Rapid: ${result.changes.rapid.old} → ${result.changes.rapid.new}
                    Blitz: ${result.changes.blitz.old} → ${result.changes.blitz.new}
                    Bullet: ${result.changes.bullet.old} → ${result.changes.bullet.new}
                `;
                console.log('Score Changes:', changesText);
            }

            // Reload rankings if on view page
            if (typeof loadRankings === 'function') {
                setTimeout(() => loadRankings(), 500);
            }

        } else {
            showUpdateMessage('update', result.message, 'error');
        }

    } catch (error) {
        console.error('Error updating scores:', error);
        showUpdateMessage('update', 'Failed to update scores. Please try again.', 'error');
    }
});

// Logout function
function logoutUpdate() {
    // Hide update form, show login form
    document.getElementById('update-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';

    // Reset forms
    document.getElementById('login-form').reset();
    document.getElementById('update-form').reset();

    // Clear messages
    document.getElementById('login-message').style.display = 'none';
    document.getElementById('update-message').style.display = 'none';
}

// Show message for update section
function showUpdateMessage(form, message, type) {
    const messageDiv = document.getElementById(`${form}-message`);
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
