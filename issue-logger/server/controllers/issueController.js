const db = require('../db');

const createIssue = async (req, res) => {
  const { issue_text } = req.body;

  if (!issue_text || issue_text.trim() === '') {
    return res.status(400).json({ error: 'Issue cannot be empty.' });
  }

  try {
    const query = 'INSERT INTO issue_logs (issue_text) VALUES ($1) RETURNING *';
    const values = [issue_text.trim()];
    const result = await db.query(query, values);
    
    res.status(201).json({
      message: 'Issue submitted successfully!',
      issue: result.rows[0],
    });
  } catch (err) {
    console.error('Error inserting issue:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getIssues = async (req, res) => {
  try {
    const query = 'SELECT * FROM issue_logs ORDER BY created_at DESC';
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createIssue,
  getIssues,
};
