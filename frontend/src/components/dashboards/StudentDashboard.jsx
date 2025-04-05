import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Rating,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Container
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    department: 'Computer Science',
    sin: 'ST23456789',
    year: 'Third Year',
    email: 'john.doe@university.edu'
  });
  const [meetings, setMeetings] = useState([]);
  const [questions, setQuestions] = useState([
    { id: 1, text: 'How would you rate the course content?' },
    { id: 2, text: 'How would you rate the instructor\'s teaching?' },
    { id: 3, text: 'How would you rate the learning environment?' },
    { id: 4, text: 'How would you rate the overall experience?' }
  ]);
  const [ratings, setRatings] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [nextMeeting, setNextMeeting] = useState({
    date: 'January 25, 2024',
    time: '09:00 AM',
    minutesLeft: 45,
    secondsLeft: 30
  });

  // Check authentication and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (userRole !== 'STUDENT') {
      console.log('User role is not STUDENT:', userRole);
      setSnackbar({
        open: true,
        message: 'You do not have permission to access this dashboard',
        severity: 'error'
      });
      navigate('/login');
      return;
    }

    console.log('Loading student profile...');
    // Fetch user profile
    fetchUserProfile();
  }, [navigate]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Fetching user profile with token:', token.substring(0, 10) + '...');
      
      // First try to get user data from login response that might be stored in localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          console.log('Found stored user data:', parsedUserData);
          
          setUserProfile({
            name: parsedUserData.fullName || 'John Doe',
            department: parsedUserData.department?.name || 'Computer Science',
            sin: parsedUserData.sinNumber || parsedUserData.username || 'ST23456789',
            year: parsedUserData.year ? `Year ${parsedUserData.year}` : 'Third Year',
            email: parsedUserData.email || 'john.doe@university.edu'
          });
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      
      // Still try the API call to ensure data is fresh
      console.log('Making API request to users/profile endpoint');
      
      // Use the correct endpoint from the API documentation
      const response = await axios.get('http://localhost:8080/api/users/profile', {
        headers: {
          'x-access-token': token
        }
      });
      
      console.log('Profile API response received:', response.data);
      
      if (response.data && Object.keys(response.data).length > 0) {
        // Set user profile with data from backend using the field names from API documentation
        setUserProfile({
          name: response.data.fullName || 'John Doe',
          department: response.data.department?.name || 'Computer Science',
          sin: response.data.sinNumber || response.data.username || 'ST23456789',
          year: response.data.year ? `Year ${response.data.year}` : 'Third Year',
          email: response.data.email || 'john.doe@university.edu'
        });
        
        // Store the user data for future use
        localStorage.setItem('userData', JSON.stringify(response.data));
      } else {
        console.error('Empty profile data received from API');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error response:', error.response?.data);
      
      // Don't show error notification to user if we already loaded data from localStorage
      if (!localStorage.getItem('userData')) {
        setSnackbar({
          open: true,
          message: 'Unable to load profile from server. Using default values.',
          severity: 'warning'
        });
      }
    }
  };

  // Fetch meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8080/api/meetings', {
          headers: {
            'x-access-token': localStorage.getItem('token')
          }
        });
        
        // Sort meetings by date
        const sortedMeetings = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMeetings(sortedMeetings);
        
        // Find next upcoming meeting for timer
        const now = new Date();
        const upcomingMeeting = sortedMeetings.find(m => new Date(m.date) > now);
        
        if (upcomingMeeting) {
          const meetingDate = new Date(upcomingMeeting.date);
          meetingDate.setHours(parseInt(upcomingMeeting.startTime.split(':')[0]));
          meetingDate.setMinutes(parseInt(upcomingMeeting.startTime.split(':')[1]));
          
          const diffMs = meetingDate - now;
          const diffMins = Math.floor(diffMs / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          
          setNextMeeting({
            date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: upcomingMeeting.startTime,
            minutesLeft: diffMins,
            secondsLeft: diffSecs
          });
        }
      } catch (error) {
        console.error('Error in fetchMeetings:', error);
        setError(error.message);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to load meetings',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Fetch questions for feedback
  const fetchQuestions = async (meetingId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/questions/meeting/${meetingId}`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      });
      
      setQuestions(response.data);
      
      // Initialize ratings for each question
      const initialRatings = {};
      response.data.forEach(question => {
        initialRatings[question.id] = 0;
      });
      setRatings(initialRatings);
      
      // Switch to feedback section
      setActiveSection('feedback');
    } catch (error) {
      console.error('Error fetching questions:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load questions',
        severity: 'error'
      });
    }
  };

  const handleRatingChange = (questionId, value) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitFeedback = async () => {
    try {
      // Validate that all questions have ratings
      const hasEmptyRatings = Object.values(ratings).some(rating => rating === 0);
      
      if (hasEmptyRatings) {
        setSnackbar({
          open: true,
          message: 'Please rate all questions before submitting',
          severity: 'warning'
        });
        return;
      }
      
      const feedbackData = {
        responses: Object.entries(ratings).map(([questionId, rating]) => ({
          questionId: parseInt(questionId),
          rating
        }))
      };

      await axios.post('http://localhost:8080/api/feedback', feedbackData, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      });

      // Mark feedback as submitted
      await axios.post('http://localhost:8080/api/feedback/mark-submitted', {
        meetingId: meetings[0].id  // Assuming we're submitting for the first meeting
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      });

      setSnackbar({
        open: true,
        message: 'Feedback submitted successfully',
        severity: 'success'
      });

      // Reset ratings
      const resetRatings = {};
      questions.forEach(q => {
        resetRatings[q.id] = 0;
      });
      setRatings(resetRatings);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit feedback',
        severity: 'error'
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render student profile section
  const renderProfile = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Student Profile</Typography>
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        mb: 4
      }}>
        <Avatar sx={{ width: 76, height: 76, bgcolor: '#1A2137', mr: 4 }}>
          {userProfile.name ? userProfile.name.charAt(0) : 'J'}
        </Avatar>
        
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Name</Typography>
              <Typography variant="body1">{userProfile.name}</Typography>
            </Box>
            
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Department</Typography>
              <Typography variant="body1">{userProfile.department}</Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Email ID</Typography>
              <Typography variant="body1">{userProfile.email}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>SIN Number</Typography>
              <Typography variant="body1">{userProfile.sin}</Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Year</Typography>
              <Typography variant="body1">{userProfile.year}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  // Render feedback section
  const renderFeedback = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Submit Feedback</Typography>
      
      {questions.map((question) => (
        <Box key={question.id} sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            {question.text}
          </Typography>
          <Rating
            value={ratings[question.id] || 0}
            onChange={(event, newValue) => handleRatingChange(question.id, newValue)}
            size="medium"
            sx={{ color: '#FFD700', mt: 1 }}
          />
        </Box>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          onClick={handleSubmitFeedback}
          sx={{ 
            mt: 2, 
            bgcolor: '#1A2137', 
            '&:hover': { bgcolor: '#2A3147' },
            fontWeight: 'medium',
            px: 4,
            py: 1
          }}
        >
          Submit Feedback
        </Button>
      </Box>
    </Paper>
  );

  // Render meeting schedule section
  const renderMeetingSchedule = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" gutterBottom>Meeting Schedule</Typography>
      
      {/* Past meetings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Past Meeting Schedule</Typography>
        
        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>2024-01-15</Typography>
          <Typography variant="body2" color="text.secondary">10:00 AM</Typography>
        </Box>
        
        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>2024-01-10</Typography>
          <Typography variant="body2" color="text.secondary">02:00 PM</Typography>
        </Box>
      </Box>
      
      {/* Present meetings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Present Meeting Schedule</Typography>
        
        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>2024-01-20</Typography>
          <Typography variant="body2" color="text.secondary">11:30 AM</Typography>
        </Box>
      </Box>
      
      {/* Upcoming meetings */}
      <Box>
        <Typography variant="h6" gutterBottom>Upcoming Meeting Schedule</Typography>
        
        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>2024-01-25</Typography>
          <Typography variant="body2" color="text.secondary">09:00 AM</Typography>
        </Box>
        
        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>2024-01-30</Typography>
          <Typography variant="body2" color="text.secondary">03:30 PM</Typography>
        </Box>
      </Box>
    </Paper>
  );

  // Render meeting minutes section
  const renderMeetingMinutes = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Meeting Minutes</Typography>
      {/* Content for meeting minutes would go here */}
      <Typography variant="body1" sx={{ mt: 2 }}>
        No meeting minutes available.
      </Typography>
    </Paper>
  );

  // Render meeting timer section
  const renderMeetingTimer = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" align="center" gutterBottom>Meeting Timer</Typography>
      
      <Typography variant="body1" align="center" sx={{ my: 2 }}>
        Next Meeting: January 25, 2024 - 09:00 AM
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
            45
          </Typography>
          <Typography variant="body2" sx={{ mt: 0 }}>
            minutes
          </Typography>
        </Box>
        
        <Typography variant="h2" sx={{ mx: 2, fontWeight: 'normal' }}>:</Typography>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
            30
          </Typography>
          <Typography variant="body2" sx={{ mt: 0 }}>
            seconds
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  // Sidebar component to match the screenshot exactly
  const Sidebar = () => (
    <Box 
      sx={{
        width: 240,
        bgcolor: '#1A2137', // Dark navy blue
        color: 'white',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1
      }}
    >
      <Box sx={{ p: 3, pb: 2, bgcolor: '#2A3147' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
          Student Dashboard
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        <ListItem 
          button 
          onClick={() => setActiveSection('profile')}
          sx={{ 
            py: 2, 
            pl: 3,
            bgcolor: activeSection === 'profile' ? '#2A3147' : 'transparent',
            '&:hover': { bgcolor: '#2A3147' }
          }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" sx={{ color: '#FFFFFF' }} />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => setActiveSection('feedback')}
          sx={{ 
            py: 2, 
            pl: 3,
            bgcolor: activeSection === 'feedback' ? '#2A3147' : 'transparent',
            '&:hover': { bgcolor: '#2A3147' }
          }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
            <FeedbackIcon />
          </ListItemIcon>
          <ListItemText primary="Submit Feedback" sx={{ color: '#FFFFFF' }} />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => setActiveSection('meeting-schedule')}
          sx={{ 
            py: 2, 
            pl: 3,
            bgcolor: activeSection === 'meeting-schedule' ? '#2A3147' : 'transparent',
            '&:hover': { bgcolor: '#2A3147' }
          }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
            <CalendarTodayIcon />
          </ListItemIcon>
          <ListItemText primary="View Meeting Schedule" sx={{ color: '#FFFFFF' }} />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => setActiveSection('meeting-minutes')}
          sx={{ 
            py: 2, 
            pl: 3,
            bgcolor: activeSection === 'meeting-minutes' ? '#2A3147' : 'transparent',
            '&:hover': { bgcolor: '#2A3147' }
          }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="View Meeting Minutes" sx={{ color: '#FFFFFF' }} />
        </ListItem>
      </List>
      
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            py: 2, 
            pl: 3,
            '&:hover': { bgcolor: '#2A3147' }
          }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: '#FFFFFF' }} />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Custom sidebar that matches the screenshot */}
      <Sidebar />
      
      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          bgcolor: '#f5f5f7',
          ml: '240px',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ width: '600px', mt: 2 }}>
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'feedback' && renderFeedback()}
          {activeSection === 'meeting-schedule' && renderMeetingSchedule()}
          {activeSection === 'meeting-minutes' && renderMeetingMinutes()}
          
          {/* Meeting Timer shown whenever not in meeting minutes view */}
          {activeSection !== 'meeting-minutes' && (
            <Box sx={{ mt: 3 }}>
              {renderMeetingTimer()}
            </Box>
          )}
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDashboard;