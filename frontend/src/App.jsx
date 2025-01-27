import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }

        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://planit-api-1a8b4a3f0d64.herokuapp.com'
          : 'http://localhost:3000';
          
        const url = filter === 'all'
          ? `${baseUrl}/tasks` 
          : `${baseUrl}/tasks?status=${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
            return;
          }
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data.tasks);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [filter, user]);

  // Add this useEffect for checking authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://planit-api-1a8b4a3f0d64.herokuapp.com'
            : 'http://localhost:3000';
          
          const response = await fetch(`${baseUrl}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleTaskSubmit = (task) => {
    if (editingTask) {
      // Update existing task in the list
      setTasks(tasks.map(t => t.id === task.id ? task : t));
      setEditingTask(null);
    } else {
      // Add new task to the list
      setTasks([task, ...tasks]);
    }
    setShowForm(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://planit-api-1a8b4a3f0d64.herokuapp.com'
        : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove the task from the state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task. Please try again later.');
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://planit-api-1a8b4a3f0d64.herokuapp.com'
        : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      
      // Update the task in the state
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      setError('Failed to update task status. Please try again later.');
    }
  };

  // Add this function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login 
        onLogin={setUser} 
        onSwitchToRegister={() => setAuthMode('register')} 
      />
    ) : (
      <Register 
        onRegister={setUser} 
        onSwitchToLogin={() => setAuthMode('login')} 
      />
    );
  }

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Task Manager</h1>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <button 
          className="add-task-btn"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          Add New Task
        </button>
        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </header>

      {showForm && (
        <div className="form-container">
          <TaskForm
            task={editingTask}
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      <TaskList 
        tasks={tasks} 
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}

export default App; 