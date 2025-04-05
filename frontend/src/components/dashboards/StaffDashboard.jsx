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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    name: 'John Smith',
    department: 'Computer Science',
    staffId: 'STAFF123456',
    position: 'Associate Professor',
    email: 'john.smith@university.edu'
  });
  const [meetings, setMeetings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
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
    
    if (userRole !== 'STAFF') {
      console.log('User role is not STAFF:', userRole);
      setSnackbar({
        open: true,
        message: 'You do not have permission to access this dashboard',
        severity: 'error'
      });
      navigate('/login');
      return;
    }

    console.log('Loading staff profile...');
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
            name: parsedUserData.fullName || 'John Smith',
            department: parsedUserData.department?.name || 'Computer Science',
            staffId: parsedUserData.staffId || parsedUserData.username || 'STAFF123456',
            position: parsedUserData.position || 'Associate Professor',
            email: parsedUserData.email || 'john.smith@university.edu'
          });
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      
      // Still try the API call to ensure data is fresh
      console.log('Making API request to users/profile endpoint');
      
      const response = await axios.get('http://localhost:8080/api/users/profile', {
        headers: {
          'x-access-token': token
        }
      });
      
      console.log('Profile API response received:', response.data);
      
      if (response.data && Object.keys(response.data).length > 0) {
        // Set user profile with data from backend
        setUserProfile({
          name: response.data.fullName || 'John Smith',
          department: response.data.department?.name || 'Computer Science',
          staffId: response.data.staffId || response.data.username || 'STAFF123456',
          position: response.data.position || 'Associate Professor',
          email: response.data.email || 'john.smith@university.edu'
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

  // Fetch questions for a specific meeting
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

  // Render staff profile section
  const renderProfile = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Staff Profile</Typography>
      
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
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Staff ID</Typography>
              <Typography variant="body1">{userProfile.staffId}</Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Position</Typography>
              <Typography variant="body1">{userProfile.position}</Typography>
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
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Meeting Schedule</Typography>
      
      {/* Past meetings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Past Meetings</Typography>
        
        {meetings
          .filter(meeting => new Date(meeting.date) < new Date())
          .map(meeting => (
            <Box key={meeting.id} sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(meeting.date).toLocaleDateString()} - {meeting.startTime}
              </Typography>
              <Button 
                size="small" 
                startIcon={<QuestionAnswerIcon />} 
                onClick={() => fetchQuestions(meeting.id)}
                sx={{ mt: 1, color: '#1A2137' }}
              >
                Provide Feedback
              </Button>
            </Box>
          ))}
      </Box>
      
      {/* Upcoming meetings */}
      <Box>
        <Typography variant="h6" gutterBottom>Upcoming Meetings</Typography>
        
        {meetings
          .filter(meeting => new Date(meeting.date) >= new Date())
          .map(meeting => (
            <Box key={meeting.id} sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(meeting.date).toLocaleDateString()} - {meeting.startTime}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  sx={{ color: '#1A2137' }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DescriptionIcon />}
                  sx={{ color: '#1A2137' }}
                >
                  Minutes
                </Button>
              </Box>
            </Box>
          ))}
      </Box>
    </Paper>
  );

  // Render reports section
  const renderReports = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Reports</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Feedback Summary Report</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download comprehensive feedback report for all meetings
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                sx={{ 
                  bgcolor: '#1A2137', 
                  '&:hover': { bgcolor: '#2A3147' }
                }}
              >
                Download Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Meeting Minutes Report</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Access all meeting minutes in one document
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                sx={{ 
                  bgcolor: '#1A2137', 
                  '&:hover': { bgcolor: '#2A3147' }
                }}
              >
                Download Minutes
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  // Sidebar component to match the student dashboard
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
          Staff Dashboard
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
          <ListItemText primary="Meeting Schedule" sx={{ color: '#FFFFFF' }} />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => setActiveSection('reports')}
          sx={{ 
            py: 2, 
            pl: 3,
            bgcolor: activeSection === 'reports' ? '#2A3147' : 'transparent',
            '&:hover': { bgcolor: '#2A3147' }
          }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" sx={{ color: '#FFFFFF' }} />
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
      {/* Custom sidebar that matches the student dashboard */}
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
          {activeSection === 'reports' && renderReports()}
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

export default StaffDashboard;
