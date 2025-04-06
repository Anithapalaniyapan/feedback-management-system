import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { login } from '../../redux/slices/authSlice';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Dispatch Redux login action
      const resultAction = await dispatch(login(formData));
      
      if (login.fulfilled.match(resultAction)) {
        // Get the role from the result
        const userRole = resultAction.payload.userRole;
        const normalizedRole = userRole.replace('ROLE_', '').toUpperCase();
        
        // Also update App.js state for backward compatibility
            setIsAuthenticated(true);
            setUserRole(normalizedRole);

            // Determine target route based on normalized role
            let targetRoute = '';
            switch (normalizedRole) {
              case 'STUDENT':
                targetRoute = '/student-dashboard';
                break;
              case 'STAFF':
                targetRoute = '/staff-dashboard';
                break;
              case 'ACADEMIC_DIRECTOR':
                targetRoute = '/academic-director-dashboard';
                break;
              case 'EXECUTIVE_DIRECTOR':
                targetRoute = '/executive-director-dashboard';
                break;
              default:
            throw new Error(`Invalid user role: ${normalizedRole}`);
        }
        
        // Navigate to the appropriate dashboard
            navigate(targetRoute, { replace: true });
      } else if (login.rejected.match(resultAction)) {
        // Handle login error
        setError(resultAction.payload || 'Login failed. Please try again.');
        }
      } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ color: 'darkblue', mb: 3 }}>
            Class Committee Meeting and Feedback System
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: 'darkblue',
                '&:hover': {
                  backgroundColor: '#1a237e'
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;