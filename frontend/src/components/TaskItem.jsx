import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import './TaskItem.css';

function TaskItem({ task, onEdit, onDelete, onToggleStatus }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className={`task-item ${task.status.toLowerCase()}`}>
        <div className="task-header">
          <h3>{task.title}</h3>
          <button 
            className={`status-toggle ${task.status.toLowerCase()}`}
            onClick={() => onToggleStatus(task)}
            title={`Mark as ${task.status === 'Pending' ? 'Completed' : 'Pending'}`}
          >
            {task.status === 'Pending' ? '☐' : '☑'}
          </button>
        </div>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          <span className="status">{task.status}</span>
        </div>
        <div className="task-actions">
          <button 
            className="btn-edit"
            onClick={() => onEdit(task)}
          >
            Edit
          </button>
          <button 
            className="btn-delete"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      {showConfirmDialog && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${task.title}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </>
  );
}

export default TaskItem; 