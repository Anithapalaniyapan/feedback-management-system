import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import './App.css'
import Login from './components/auth/Login'
import StudentDashboard from './components/dashboards/StudentDashboard'
import StaffDashboard from './components/dashboards/StaffDashboard'
import AcademicDirectorDashboard from './components/dashboards/AcademicDirectorDashboard'
import ExecutiveDirectorDashboard from './components/dashboards/ExecutiveDirectorDashboard'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
    const storedRole = localStorage.getItem('userRole');
    setIsAuthenticated(storedAuth);
    setUserRole(storedRole || '');
  }, []);

  // Modified ProtectedRoute to handle case sensitivity in role comparison
  const ProtectedRoute = ({ element, allowedRole }) => {
    const normalizedUserRole = userRole?.toUpperCase();
    const normalizedAllowedRole = allowedRole?.toUpperCase();
    
    return isAuthenticated && normalizedUserRole === normalizedAllowedRole ? 
      element : 
      <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/student-dashboard" element={<ProtectedRoute element={<StudentDashboard />} allowedRole="STUDENT" />} />
          <Route path="/staff-dashboard" element={<ProtectedRoute element={<StaffDashboard />} allowedRole="STAFF" />} />
          <Route path="/academic-director-dashboard" element={<ProtectedRoute element={<AcademicDirectorDashboard />} allowedRole="ACADEMIC_DIRECTOR" />} />
          <Route path="/executive-director-dashboard" element={<ProtectedRoute element={<ExecutiveDirectorDashboard />} allowedRole="EXECUTIVE_DIRECTOR" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
