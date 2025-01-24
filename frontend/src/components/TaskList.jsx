import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

function TaskList({ tasks, onEditTask, onDeleteTask, onToggleStatus }) {
  if (tasks.length === 0) {
    return <p className="no-tasks">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}

export default TaskList; 