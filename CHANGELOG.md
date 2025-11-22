# Changelog

All notable changes to the Chess Club Ranking System will be documented in this file.

## [Unreleased]

### Added
- Pull Request template for standardized submissions
- Issue templates (Bug Report, Feature Request, Task)
- Contributing guidelines
- README documentation

### Changed
- Renamed utility files for consistency
  - gengyueutils.js to GengyueUtil.js
  - CreateStudentUtil.js to DaniellaUtil.js
  - ViewRankingsUtil.js to DylanUtil.js
  - DeleteAccountUtil.js to DanishUtil.js

## [1.0.0] - 2025-11

### Added - CREATE Feature (Daniella)
- Student registration functionality
- Automatic student ID generation
- Email validation and duplicate detection
- Three rating categories (Blitz, Rapid, Classical)

### Added - READ Feature (Dylan)
- View all students in table format
- Sort by different rating types
- Rankings display
- Search and filter functionality

### Added - UPDATE Feature (Gengyue)
- Student login system
- Score update functionality
- Rating validation (0-3000 range)
- Student data retrieval by ID

### Added - DELETE Feature (Danish)
- Student account deletion
- Confirmation prompts
- Secure deletion process

### Added - Core System
- Express.js server setup
- JSON-based data storage
- RESTful API endpoints
- Frontend interface
- Error handling

### Added - DevOps Configuration
- Git repository setup
- Branch strategy implementation
- ESLint configuration
- Prettier configuration
- EditorConfig
- VS Code workspace settings

## Version Format

Format: [Major.Minor.Patch]
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

---

Last Updated: November 2025
