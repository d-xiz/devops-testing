const fs = require('fs').promises;
const { deleteStudent } = require('../../utils/DanishUtil');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('Delete Student - Backend Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Missing Student ID (400)
  test('should return 400 if student ID is missing', async () => {
    const req = { params: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // Test 2: Student ID not found (404)
  test('should return 404 if student ID is not found', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({ students: [] })
    );

    const req = { params: { id: '1111111a' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // Test 3: Successful Deletion (200)
  test('should delete student and update file correctly', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({
        students: [
          { id: '1234567a', rapid: 1200, blitz: 1100, bullet: 1000 }
        ]
      })
    );

    fs.writeFile.mockResolvedValue();

    const req = { params: { id: '1234567a' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);

    const writtenData = fs.writeFile.mock.calls[0][1];
    const parsed = JSON.parse(writtenData);

    expect(parsed.students).toHaveLength(0);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  // Test 4: Malformed JSON in database (500)
  test('should return 500 if stored JSON is malformed', async () => {
    fs.readFile.mockResolvedValue('THIS IS NOT JSON');

    const req = { params: { id: '1234567a' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // Test 5: Deleting already deleted student (404)
  test('should return 404 when deleting already deleted student', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({ students: [] })
    );

    const req = { params: { id: '1234567a' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // Test 6: writeFile failure (500)
  test('should return 500 if writeFile fails', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({
        students: [{ id: '1234567a' }]
      })
    );

    fs.writeFile.mockRejectedValue(new Error('Disk write failed'));

    const req = { params: { id: '1234567a' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // Test 7: Database file missing (ENOENT) (500)
  test('should return 500 if database file is missing', async () => {
    const error = new Error('File not found');
    error.code = 'ENOENT';

    fs.readFile.mockRejectedValue(error);

    const req = { params: { id: '1234567a' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
