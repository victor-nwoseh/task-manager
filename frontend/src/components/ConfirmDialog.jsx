import React from 'react';
import './ConfirmDialog.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button 
            className="btn-confirm" 
            onClick={onConfirm}
          >
            Delete
          </button>
          <button 
            className="btn-cancel" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog; 