import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../api/axiosConfig'; // Import the global API instance
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
  Container,
  Card,
  CardContent
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';

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
    
    // Normalize the user role for case-insensitive comparison
    const normalizedUserRole = (userRole || '').replace('ROLE_', '').toUpperCase();
    
    if (normalizedUserRole !== 'STUDENT') {
      console.log('User role is not STUDENT:', userRole, 'Normalized:', normalizedUserRole);
      setSnackbar({
        open: true,
        message: 'You do not have permission to access this dashboard',
        severity: 'error'
      });
      navigate('/login');
      return;
    }
    
    console.log('Student authorized, loading student dashboard...');
    
    // Store student role in localStorage for meeting filtering (lowercase for consistency with filtering logic)
    localStorage.setItem('userRole', 'student');
    
    setLoading(true); // Set loading state while data is being fetched
    fetchUserProfile();
    loadMeetingsFromStorage(); // First try to load from localStorage
    fetchMeetings(); // Then try to fetch from API as backup
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
      
      // Use the global API instance with interceptors
      const response = await API.get('/users/profile');
      
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

  // Fetch meetings - defined outside useEffect to avoid recreating it on each render
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Get student's department and year from profile
      const userProfile = JSON.parse(localStorage.getItem('userData'));
      const studentDepartment = userProfile?.department;
      const studentYear = userProfile?.year;

      // First try to load from localStorage
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        try {
          const parsedMeetings = JSON.parse(storedMeetings);
          if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
            // Filter meetings based on student's department and year
            const filteredMeetings = parsedMeetings.filter(meeting => 
              meeting.role === 'student' &&
              meeting.department === studentDepartment &&
              meeting.year === studentYear
            );
            sortAndSetMeetings(filteredMeetings);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored meetings:', error);
        }
      }

      // If no valid meetings in localStorage, fetch from API
      const response = await API.get('/meetings');
      if (response.data && Array.isArray(response.data)) {
        // Filter meetings based on student's department and year
        const filteredMeetings = response.data.filter(meeting => 
          meeting.role === 'student' &&
          meeting.department === studentDepartment &&
          meeting.year === studentYear
        );
        sortAndSetMeetings(filteredMeetings);
      } else {
        console.error('Invalid response format from API:', response.data);
        // Create sample meetings as fallback
        const sampleMeetings = [
          {
            id: '1',
            title: 'Sample Student Meeting',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            role: 'student',
            department: studentDepartment,
            year: studentYear
          }
        ];
        sortAndSetMeetings(sampleMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings from API:', error);
      // Try to load from localStorage as fallback
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        try {
          const parsedMeetings = JSON.parse(storedMeetings);
          if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
            // Filter meetings based on student's department and year
            const userProfile = JSON.parse(localStorage.getItem('userData'));
            const studentDepartment = userProfile?.department;
            const studentYear = userProfile?.year;
            
            const filteredMeetings = parsedMeetings.filter(meeting => 
              meeting.role === 'student' &&
              meeting.department === studentDepartment &&
              meeting.year === studentYear
            );
            sortAndSetMeetings(filteredMeetings);
          }
        } catch (error) {
          console.error('Error parsing stored meetings:', error);
        }
      }
    }
  };

  // Fetch meetings when component mounts
  useEffect(() => {
    // First, try to restore timer data from localStorage
    try {
      const storedTimerData = localStorage.getItem('nextMeetingData');
      if (storedTimerData) {
        const parsedTimerData = JSON.parse(storedTimerData);
        console.log('Restored timer data from localStorage:', parsedTimerData);
        
        // Check if the timer data is still valid (not in the past)
        if (parsedTimerData.minutesLeft > 0 || parsedTimerData.secondsLeft > 0) {
          setNextMeeting(parsedTimerData);
        } else {
          console.log('Stored timer data is expired (countdown is zero)');
        }
      }
    } catch (error) {
      console.error('Error restoring timer data from localStorage:', error);
    }
  }, []);

  // Fetch questions for feedback
  const fetchQuestions = async (meetingId) => {
    try {
      setLoading(true);
      
      // First try to fetch from API
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log(`Fetching questions for meeting ID: ${meetingId}`);
      
      // Use the global API instance with interceptors
      const response = await API.get(`/questions/meeting/${meetingId}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('API returned questions:', response.data);
        setQuestions(response.data);
        
        // Reset the ratings since we have new questions
        setRatings({});
        
        // Show the feedback section
        setActiveSection('feedback');
        
        return;
      }
      
      console.log('API returned no questions or invalid data. Trying localStorage...');
      
      // API failed, try to load from localStorage
      const storedQuestions = localStorage.getItem('submittedQuestions') || localStorage.getItem('questions');
      
      if (storedQuestions) {
        try {
          const parsedQuestions = JSON.parse(storedQuestions);
          
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            console.log('Found questions in localStorage:', parsedQuestions);
            
            // Use a standard set of questions for the demo
            const standardQuestions = [
              { id: 1, text: 'How would you rate the course content?' },
              { id: 2, text: 'How would you rate the instructor\'s teaching?' },
              { id: 3, text: 'How would you rate the learning environment?' },
              { id: 4, text: 'How would you rate the overall experience?' }
            ];
            
            setQuestions(parsedQuestions.length > 0 ? parsedQuestions : standardQuestions);
            
            // Reset the ratings since we have new questions
            setRatings({});
            
            // Show the feedback section
            setActiveSection('feedback');
            
            setSnackbar({
              open: true,
              message: 'Loaded questions from local storage',
              severity: 'info'
            });
            
            return;
          }
        } catch (parseError) {
          console.error('Error parsing questions from localStorage:', parseError);
        }
      }
      
      // If we get here, we couldn't load from API or localStorage, use default questions
      console.log('Using default questions');
      
      // Use a standard set of questions for the demo
      setQuestions([
        { id: 1, text: 'How would you rate the course content?' },
        { id: 2, text: 'How would you rate the instructor\'s teaching?' },
        { id: 3, text: 'How would you rate the learning environment?' },
        { id: 4, text: 'How would you rate the overall experience?' }
      ]);
      
      // Reset the ratings
      setRatings({});
      
      // Show the feedback section
      setActiveSection('feedback');
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
      
      // Use default questions as fallback
      setQuestions([
        { id: 1, text: 'How would you rate the course content?' },
        { id: 2, text: 'How would you rate the instructor\'s teaching?' },
        { id: 3, text: 'How would you rate the learning environment?' },
        { id: 4, text: 'How would you rate the overall experience?' }
      ]);
      
      // Reset the ratings
      setRatings({});
      
      // Still show the feedback section despite the error
      setActiveSection('feedback');
    } finally {
      setLoading(false);
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

      // Use the global API instance with interceptors
      await API.post('/feedback', feedbackData);

      // Mark feedback as submitted
      await API.post('/feedback/mark-submitted', {
        meetingId: meetings[0].id  // Assuming we're submitting for the first meeting
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

  // Add a dedicated function to load meetings from localStorage
  const loadMeetingsFromStorage = () => {
    try {
      // Try both possible localStorage keys for meetings
      const storedMeetings = localStorage.getItem('submittedMeetings') || localStorage.getItem('meetings');
      
      if (!storedMeetings) {
        console.log('No meetings found in localStorage');
        return false;
      }
      
      const parsedMeetings = JSON.parse(storedMeetings);
      
      if (!Array.isArray(parsedMeetings) || parsedMeetings.length === 0) {
        console.log('No valid meetings found in localStorage');
        return false;
      }
      
      console.log('Found', parsedMeetings.length, 'meetings in localStorage');
      
      // Filter student meetings
      const studentMeetings = parsedMeetings.filter(meeting => {
        // Check if role exists and is 'student' (case-insensitive)
        const role = (meeting.role || '').toLowerCase();
        return role === 'student' || role.includes('student');
      });
      
      console.log('Filtered', studentMeetings.length, 'student meetings from', parsedMeetings.length, 'total meetings');
      
      if (studentMeetings.length > 0) {
        setMeetings(studentMeetings);
        
        // Find next upcoming meeting for timer
        const now = new Date();
        const upcomingMeeting = studentMeetings
          .filter(m => {
            const meetingDate = new Date(m.date || m.meetingDate || '');
            return !isNaN(meetingDate.getTime()) && meetingDate > now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date || a.meetingDate || '');
            const dateB = new Date(b.date || b.meetingDate || '');
            return dateA - dateB;
          })[0];
        
        if (upcomingMeeting) {
          setTimerFromMeeting(upcomingMeeting);
        }
        
        setSnackbar({
          open: true,
          message: `Loaded ${studentMeetings.length} student meetings`,
          severity: 'success'
        });
        
        return true;
      }
      
      console.log('No student meetings found in localStorage');
      return false;
    } catch (error) {
      console.error('Error loading meetings from localStorage:', error);
      return false;
    }
  };

  // Helper function to set timer from meeting
  const setTimerFromMeeting = (meeting) => {
    try {
      const now = new Date();
      const meetingDate = new Date(`${meeting.date || meeting.meetingDate}T${meeting.startTime || '00:00'}`);
      
      if (!isNaN(meetingDate.getTime())) {
        const diffMs = Math.max(0, meetingDate - now);
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        
        const timerData = {
          id: meeting.id,
          title: meeting.title,
          date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          time: meeting.startTime,
          minutesLeft: diffMins,
          secondsLeft: diffSecs,
          originalDate: meeting.date || meeting.meetingDate,
          role: 'student',
          year: meeting.year
        };
        
        setNextMeeting(timerData);
        
        // Save to localStorage for timer persistence
        localStorage.setItem('studentNextMeetingData', JSON.stringify(timerData));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error setting timer from meeting:', error);
      return false;
    }
  };

  // Render student profile section
  const renderProfile = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      position: 'relative'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Student Profile</Typography>
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        mb: 0
      }}>
        <Avatar sx={{ width: 76, height: 76, bgcolor: '#1A2137', mr: 4 }}>
          {userProfile.name ? userProfile.name.charAt(0) : 'J'}
        </Avatar>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 3 }}>
        <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Name</Typography>
                <Typography variant="body1">{userProfile.name}</Typography>
                    </Box>
        </Box>

        <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>SIN Number</Typography>
                <Typography variant="body1">{userProfile.sin}</Typography>
              </Box>
              </Box>
            </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Department</Typography>
                <Typography variant="body1">{userProfile.department}</Typography>
                    </Box>
        </Box>
        
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Year</Typography>
                <Typography variant="body1">{userProfile.year}</Typography>
                    </Box>
                    </Box>
        </Box>
        
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Email ID</Typography>
              <Typography variant="body1">{userProfile.email}</Typography>
                    </Box>
                    </Box>
                  </Box>
                    </Box>
          </Paper>
  );

  // Render feedback section
  const renderFeedback = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Submit Feedback</Typography>
      
      {questions.map((question) => (
        <Box key={question.id} sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            {question.text}
            </Typography>
          <Rating
            name={`rating-${question.id}`}
            value={ratings[question.id] || 0}
            onChange={(event, newValue) => handleRatingChange(question.id, newValue)}
            size="medium"
            sx={{ color: '#FFD700', mt: 1 }}
          />
            </Box>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleSubmitFeedback} 
          disabled={loading}
          sx={{ 
            bgcolor: '#1A2137', 
            '&:hover': { bgcolor: '#2A3147' },
            fontWeight: 'medium',
            px: 4,
            py: 1
          }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
          </Box>
        </Paper>
  );

  // Render meeting schedule section
  const renderViewMeetingSchedule = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter meetings to show only present and upcoming ones
    const filteredMeetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date || meeting.meetingDate);
      return meetingDate >= today;
    }).sort((a, b) => new Date(a.date || a.meetingDate) - new Date(b.date || b.meetingDate));

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          View Meeting Schedule
        </Typography>
        
        {filteredMeetings.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            No meetings scheduled.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredMeetings.map((meeting) => {
              const meetingDate = new Date(meeting.date || meeting.meetingDate);
              const isToday = meetingDate.toDateString() === today.toDateString();
              
              return (
                <Grid item xs={12} key={meeting.id}>
                  <Card sx={{ borderRadius: 0, mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {meeting.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ 
                          color: 'primary.main',
                          bgcolor: '#e3f2fd',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {`Date: ${meetingDate.toLocaleDateString()}`}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: 'success.main',
                          bgcolor: '#e8f5e9',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {`Time: ${meeting.startTime} - ${meeting.endTime}`}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: '#6a1b9a',
                          bgcolor: '#f3e5f5',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {`Department: ${meeting.department || 'Not specified'}`}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        color: isToday ? 'success.main' : 'info.main',
                        fontWeight: 'bold',
                        mt: 2
                      }}>
                        {isToday ? 'Today\'s Meeting' : 'Upcoming Meeting'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  };

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
        <Box sx={{ width: '1010px', mt: 2, mb: 2 }}>
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'feedback' && renderFeedback()}
          {activeSection === 'meeting-schedule' && renderViewMeetingSchedule()}
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