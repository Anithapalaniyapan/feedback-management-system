import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    let retryCount = 0;
    const maxRetries = 2;

    const attemptLogin = async () => {
      try {
         const serverUrl = 'http://localhost:8080';
        const response = await axios.post(`${serverUrl}/api/auth/signin`, {
          username: formData.username,
          password: formData.password
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.accessToken) {
          try {
            // Validate token
            if (!response.data.accessToken) {
              throw new Error('Invalid token received');
            }

            // Validate and normalize the role first
            const roles = response.data.roles;
            if (!roles || roles.length === 0) {
              throw new Error('User role not found in response. Please contact support.');
            }

            // Get the first role and normalize it by removing ROLE_ prefix if it exists
            const role = roles[0];
            const normalizedRole = role.replace('ROLE_', '').toUpperCase();
            console.log('Normalized Role:', normalizedRole); // Debug log

            // Validate the normalized role
            const validRoles = ['STUDENT', 'STAFF', 'ACADEMIC_DIRECTOR', 'EXECUTIVE_DIRECTOR'];
            if (!validRoles.includes(normalizedRole)) {
              console.error('Invalid role received:', role);
              throw new Error(`Invalid user role: ${role}`);
            }

            // Clear any existing auth data
            localStorage.clear();
            
            // Update authentication state first
            setIsAuthenticated(true);
            setUserRole(normalizedRole);
            
            // Then store authentication data
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', normalizedRole);
            
            // Set axios default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;

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
                console.error('Invalid role received:', role);
                throw new Error(`Invalid user role: ${role}`);
            }

            console.log('Target Route:', targetRoute); // Debug log

            // Ensure the route is set before navigating
            if (!targetRoute) {
              throw new Error('Navigation route not determined');
            }

            // Use navigate with replace option to prevent going back to login
            navigate(targetRoute, { replace: true });
          } catch (error) {
            console.error('Authentication error:', error);
            setError(error.message);
            localStorage.clear();
            setIsAuthenticated(false);
            setUserRole('');
          }
        } else {
          setError('Invalid response from server');
        }
      } catch (err) {
        if (!err.response) {
          if (retryCount < maxRetries) {
            retryCount++;
            setError(`Connection attempt ${retryCount} failed. Retrying in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
            return attemptLogin();
          }
          setError('Unable to connect to the server. Please ensure the backend service is running and try again.');
        } else {
          switch (err.response.status) {
            case 401:
            case 404:
              setError('User not found or invalid credentials. Please check your username and password.');
              break;
            case 403:
              setError('Access forbidden. Please check your credentials.');
              break;
            case 500:
              setError('Server error. Please try again later.');
              break;
            default:
              setError(err.response.data?.message || 'An error occurred during login. Please try again.');
          }
        }
        // Clear any existing auth data on error
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole('');
      }
    };

    await attemptLogin();
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