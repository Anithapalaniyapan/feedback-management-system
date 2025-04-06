import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import './App.css'
import Login from './components/auth/Login'
import StudentDashboard from './components/dashboards/StudentDashboard'
import StaffDashboard from './components/dashboards/StaffDashboard'
import AcademicDirectorDashboard from './components/dashboards/AcademicDirectorDashboard'
import ExecutiveDirectorDashboard from './components/dashboards/ExecutiveDirectorDashboard'
import { syncAuthState } from './redux/slices/authSlice'

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated: reduxIsAuthenticated, userRole: reduxUserRole } = useSelector(state => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  // Sync state with both localStorage and Redux
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
    const storedRole = localStorage.getItem('userRole');
    
    setIsAuthenticated(storedAuth || reduxIsAuthenticated);
    setUserRole(storedRole || reduxUserRole || '');
    
    // Sync Redux state with localStorage if needed
    dispatch(syncAuthState());
  }, [reduxIsAuthenticated, reduxUserRole, dispatch]);

  // Modified ProtectedRoute to handle case sensitivity in role comparison
  // and use both Redux and local state
  const ProtectedRoute = ({ element, allowedRole }) => {
    // Normalize user role (remove ROLE_ prefix if present)
    const normalizedUserRole = (userRole || reduxUserRole || '').replace('ROLE_', '').toUpperCase();
    const normalizedAllowedRole = allowedRole?.toUpperCase();
    
    // Add debugging logs
    console.log('ProtectedRoute check:', {
      userRole,
      reduxUserRole,
      normalizedUserRole,
      allowedRole,
      normalizedAllowedRole,
      isAuthenticated: isAuthenticated || reduxIsAuthenticated,
      hasAccess: normalizedUserRole === normalizedAllowedRole
    });
    
    return (isAuthenticated || reduxIsAuthenticated) && normalizedUserRole === normalizedAllowedRole ? 
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
