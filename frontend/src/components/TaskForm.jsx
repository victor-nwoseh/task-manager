import { useState, useEffect } from 'react';
import './TaskForm.css';

function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });
  const [error, setError] = useState(null);

  // If task prop is provided, populate form for editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: new Date(task.due_date).toISOString().split('T')[0],
        status: task.status
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.due_date) {
      setError('Due date is required');
      return;
    }

    try {
      const url = task 
        ? `http://localhost:3000/tasks/${task.id}`
        : 'http://localhost:3000/tasks';
      
      const method = task ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to save task');
      }

      const savedTask = await response.json();
      onSubmit(savedTask.task);
      
      // Reset form if adding new task
      if (!task) {
        setFormData({
          title: '',
          description: '',
          due_date: new Date().toISOString().split('T')[0],
          status: 'Pending'
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="due_date">Due Date *</label>
        <input
          type="date"
          id="due_date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {task ? 'Update Task' : 'Add Task'}
        </button>
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm; 