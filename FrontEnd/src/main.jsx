import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './Contexts/ThemeContext';
import { NotesProvider } from './Contexts/NotesContext';
import { TaskProvider } from './Contexts/TaskContext';
import { TrashProvider } from './Contexts/TrashContext';
import { AuthProvider } from './Contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TrashProvider>
            <NotesProvider>
              <TaskProvider>
                <App />
              </TaskProvider>
            </NotesProvider>
          </TrashProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

