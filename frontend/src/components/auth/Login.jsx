import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  Link
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { login } from '../../redux/slices/authSlice';
// Import images
import logoImage from '../../assets/sri shanmugha logo.jpg';
import graduationCapIcon from '../../assets/graduation-cap-icon.webp';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
        
        console.log('Login response role:', userRole);
        
        // Extract role for consistent dashboard routing
        let normalizedRole = '';
        let targetRoute = '';
        
        // Normalize role
        if (userRole && typeof userRole === 'string') {
          // Convert to lowercase for consistent comparison
          const roleLower = userRole.toLowerCase();
          
          if (roleLower.includes('student')) {
            normalizedRole = 'student';
                targetRoute = '/student-dashboard';
          } else if (roleLower.includes('staff')) {
            normalizedRole = 'staff';
                targetRoute = '/staff-dashboard';
          } else if (roleLower.includes('academic')) {
            normalizedRole = 'academic-director';
                targetRoute = '/academic-director-dashboard';
          } else if (roleLower.includes('executive')) {
            normalizedRole = 'executive-director';
                targetRoute = '/executive-director-dashboard';
          } else {
            // Default
            normalizedRole = roleLower;
            throw new Error(`Unrecognized user role: ${userRole}`);
          }
        } else {
          throw new Error('Invalid role data received from server');
        }
        
        console.log(`Normalized role to: ${normalizedRole}, route: ${targetRoute}`);
        
        // Store the normalized role in localStorage with consistent format
        localStorage.setItem('userRole', normalizedRole);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Update App.js state for backward compatibility
        setIsAuthenticated(true);
        setUserRole(normalizedRole);
        
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

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      className="login-page"
      sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        bgcolor: '#F5F8FD',
      }}
    >
      {/* Left side - Welcome message with logo (hidden on mobile) */}
      <Box 
        sx={{ 
          flex: { xs: 0, md: 1 }, 
          background: 'linear-gradient(135deg, #E6F0FF 0%, #B8D3FF 100%)', 
          color: 'white',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          position: 'relative'
        }}
      >
      <Box
        sx={{
            position: 'absolute', 
            top: 20, 
            left: 20,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Box 
            component="img" 
            src={logoImage} 
            alt="Sri Shanmugha Logo" 
            sx={{ 
              width: '35px',
              height: '35px',
              mr: 1.5
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1A2137', lineHeight: 1.2, fontSize: '1rem' }}>
              SRI SHANMUGHA
            </Typography>
            <Typography variant="caption" sx={{ color: '#1A2137', lineHeight: 1.2, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              EDUCATIONAL INSTITUTIONS
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
          maxWidth: '80%',
          mt: 6
        }}>
          <Box 
            component="div"
            sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              component="img"
              src={graduationCapIcon}
              alt="Graduation Cap"
              sx={{
                width: '70px',
                height: '70px',
                filter: 'brightness(0)',
                padding: 0,
                borderRadius: 0,
                border: 'none'
              }}
            />
          </Box>
          
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', color: '#1A2137' }}>
            Welcome to Our Feedback Portal
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, color: '#333333', fontWeight: 'normal' }}>
            Your feedback helps us improve and provide better educational services
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            alignItems: 'flex-start', 
            width: '100%', 
            backgroundColor: '#E6F0FF', 
            padding: 2.5,
            borderRadius: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: 'rgba(26, 33, 55, 0.1)', 
                borderRadius: '50%', 
                width: 30, 
                height: 30, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#1A2137',
                fontWeight: 'medium',
                fontSize: '0.8rem'
              }}>
                01
              </Box>
              <Typography color="#1A2137" variant="body2">Login with your institutional credentials</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: 'rgba(26, 33, 55, 0.1)', 
                borderRadius: '50%', 
                width: 30, 
                height: 30, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#1A2137',
                fontWeight: 'medium',
                fontSize: '0.8rem'
              }}>
                02
              </Box>
              <Typography color="#1A2137" variant="body2">Navigate to your specific feedback forms</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: 'rgba(26, 33, 55, 0.1)', 
                borderRadius: '50%', 
                width: 30, 
                height: 30, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#1A2137',
                fontWeight: 'medium',
                fontSize: '0.8rem'
              }}>
                03
              </Box>
              <Typography color="#1A2137" variant="body2">Submit your valuable feedback</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right side - Login form */}
      <Box 
        className="login-form-container"
        sx={{ 
          flex: { xs: 1, md: 1 }, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 4 }
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'white',
            borderRadius: 2
          }}
        >
          {/* Logo for mobile view */}
          <Box 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              justifyContent: 'center', 
              mb: 2,
              alignItems: 'center'
            }}
          >
            <Box 
              component="img" 
              src={logoImage} 
              alt="Sri Shanmugha Logo" 
              sx={{ 
                width: '35px',
                height: '35px',
                mr: 1.5
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1A2137', lineHeight: 1.2, fontSize: '1rem' }}>
                SRI SHANMUGHA
              </Typography>
              <Typography variant="caption" sx={{ color: '#1A2137', lineHeight: 1.2, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                EDUCATIONAL INSTITUTIONS
              </Typography>
            </Box>
          </Box>
          
          <Typography 
            variant="h6" 
            component="h1" 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1A2137',
              mb: 0.5
            }}
          >
            Feedback Management System
          </Typography>
          
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Login to your account
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', display: 'block' }}>
              Email Address
            </Typography>
            <TextField
              fullWidth
              id="username"
              name="username"
              placeholder="Enter your email"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium', display: 'block' }}>
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 1.5 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box 
                      component="button"
                      type="button"
                      onClick={handleTogglePasswordVisibility}
                      sx={{ 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showPassword ? 
                        <VisibilityOffIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /> : 
                        <VisibilityIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                      }
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}
            >
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: '#1A2137',
                      '&.Mui-checked': {
                        color: '#1A2137',
                      },
                    }}
                  />
                } 
                label={<Typography variant="caption">Remember me</Typography>}
              />
              <Link href="#" variant="caption" sx={{ color: '#1A2137', textDecoration: 'none', fontWeight: 'medium' }}>
                Forgot Password?
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1,
                backgroundColor: '#1A2137',
                '&:hover': {
                  backgroundColor: '#2A3147'
                },
                borderRadius: 1,
                fontWeight: 'medium',
                fontSize: '0.875rem'
              }}
            >
              Login
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Having trouble logging in? <Link href="#" sx={{ color: '#1A2137', textDecoration: 'none', fontWeight: 'medium' }}>Contact Support</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;