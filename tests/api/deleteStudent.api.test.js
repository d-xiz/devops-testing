const request = require('supertest');
const fs = require('fs').promises;
const app = require('../../index');

// Mock filesystem
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('DELETE /api/students/:id - API Testing', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Student ID does not exist (404)
  test('should return 404 when student ID does not exist', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({ students: [] })
    );

    const response = await request(app)
      .delete('/api/students/9999999a');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({ success: false })
    );
  });

  // Test 2: Successful deletion (200) + persistence check
  test('should delete existing student and persist changes', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({
        students: [
          { id: '1234567a', rapid: 1200, blitz: 1100, bullet: 1000 }
        ]
      })
    );

    fs.writeFile.mockResolvedValue();

    const response = await request(app)
      .delete('/api/students/1234567a');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ success: true })
    );

    expect(fs.writeFile).toHaveBeenCalledTimes(1);

    const writtenData = fs.writeFile.mock.calls[0][1];
    const parsed = JSON.parse(writtenData);

    expect(parsed.students).toHaveLength(0);
  });

  // Test 3: Malformed JSON in database (500)
  test('should return 500 when database JSON is malformed', async () => {
    fs.readFile.mockResolvedValue('THIS IS NOT JSON');

    const response = await request(app)
      .delete('/api/students/1234567a');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ success: false })
    );
  });

  // Test 4: writeFile failure (500)
  test('should return 500 when writeFile fails', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({
        students: [{ id: '1234567a' }]
      })
    );

    fs.writeFile.mockRejectedValue(new Error('Disk write failed'));

    const response = await request(app)
      .delete('/api/students/1234567a');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ success: false })
    );
  });

  // Test 5: Database file missing (ENOENT) (500)
  test('should return 500 when database file is missing', async () => {
    const error = new Error('File not found');
    error.code = 'ENOENT';

    fs.readFile.mockRejectedValue(error);

    const response = await request(app)
      .delete('/api/students/1234567a');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({ success: false })
    );
  });

});
