const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /tasks - Get all tasks
router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status;
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [req.user.id];
    
    if (status && ['Pending', 'Completed'].includes(status)) {
      query += ' AND status = $2';
      values.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, values);
    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a new task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, due_date, status = 'Pending' } = req.body;
    
    // Validate required fields
    if (!title || !due_date) {
      return res.status(400).json({
        error: {
          message: "Title and due date are required",
          status: 400
        }
      });
    }

    // Validate status value
    if (status && !['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({
        error: {
          message: "Status must be either 'Pending' or 'Completed'",
          status: 400
        }
      });
    }

    // Insert task into database
    const query = `
      INSERT INTO tasks (title, description, due_date, status, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [title, description, due_date, status, req.user.id];
    const result = await db.query(query, values);
    
    res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0]
    });
  } catch (error) {
    // Check for specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: {
          message: "Task with this title already exists",
          status: 409
        }
      });
    }
    
    next(error);
  }
});

// PUT /tasks/:id - Update a task
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, status } = req.body;

    // Validate if task exists
    const checkTask = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (checkTask.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: "Task not found",
          status: 404
        }
      });
    }

    // Validate status if provided
    if (status && !['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({
        error: {
          message: "Status must be either 'Pending' or 'Completed'",
          status: 400
        }
      });
    }

    // Build update query dynamically based on provided fields
    let updates = [];
    let values = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {  // Allow empty description
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (due_date) {
      updates.push(`due_date = $${paramCount}`);
      values.push(due_date);
      paramCount++;
    }
    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    // If no updates provided, return early
    if (updates.length === 0) {
      return res.status(400).json({
        error: {
          message: "No valid fields provided for update",
          status: 400
        }
      });
    }

    // Add id as the last parameter
    values.push(id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    res.json({
      message: "Task updated successfully",
      task: result.rows[0]
    });
  } catch (error) {
    // Check for specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: {
          message: "Task with this title already exists",
          status: 409
        }
      });
    }
    next(error);
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if task exists before attempting to delete
    const checkTask = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (checkTask.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: "Task not found",
          status: 404
        }
      });
    }

    // Delete the task
    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    res.json({
      message: "Task deleted successfully",
      task: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update other routes to check task ownership
const checkTaskOwnership = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT user_id FROM tasks WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          status: 404
        }
      });
    }
    
    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to access this task',
          status: 403
        }
      });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

// Add ownership check to PUT and DELETE routes
router.put('/:id', checkTaskOwnership, async (req, res, next) => {
  // ... existing code ...
});

router.delete('/:id', checkTaskOwnership, async (req, res, next) => {
  // ... existing code ...
});

module.exports = router; 