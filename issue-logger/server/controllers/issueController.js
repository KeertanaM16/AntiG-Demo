const db = require('../db');

const createIssue = async (req, res) => {
  const { issue_text } = req.body;
  const userId = req.user?.userId; // Get user ID from authenticated user

  if (!issue_text || issue_text.trim() === '') {
    return res.status(400).json({ error: 'Issue cannot be empty.' });
  }

  try {
    const query = 'INSERT INTO issue_logs (issue_text, user_id) VALUES ($1, $2) RETURNING *';
    const values = [issue_text.trim(), userId];
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
    const query = `
      SELECT 
        il.id, 
        il.issue_text, 
        il.created_at,
        il.user_id,
        u.email as user_email,
        u.full_name as user_name
      FROM issue_logs il
      LEFT JOIN users u ON il.user_id = u.id
      ORDER BY il.created_at DESC
    `;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Update an issue (only creator or admin)
 */
const updateIssue = async (req, res) => {
  const { id } = req.params;
  const { issue_text } = req.body;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (!issue_text || issue_text.trim() === '') {
    return res.status(400).json({ error: 'Issue cannot be empty.' });
  }

  try {
    // Check if issue exists and get owner
    const checkQuery = 'SELECT user_id FROM issue_logs WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    const issueOwnerId = checkResult.rows[0].user_id;

    // Check ownership or admin role
    if (issueOwnerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own issues.' });
    }

    // Update issue
    const updateQuery = 'UPDATE issue_logs SET issue_text = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(updateQuery, [issue_text.trim(), id]);

    res.status(200).json({
      message: 'Issue updated successfully!',
      issue: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Delete an issue (only creator or admin)
 */
const deleteIssue = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    // Check if issue exists and get owner
    const checkQuery = 'SELECT user_id FROM issue_logs WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    const issueOwnerId = checkResult.rows[0].user_id;

    // Check ownership or admin role
    if (issueOwnerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own issues.' });
    }

    // Delete issue
    await db.query('DELETE FROM issue_logs WHERE id = $1', [id]);

    res.status(200).json({ message: 'Issue deleted successfully!' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue
};
