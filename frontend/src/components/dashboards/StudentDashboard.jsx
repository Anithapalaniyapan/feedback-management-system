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
    fetchMeetings(); // Fetch meetings data after authorization is confirmed
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

  // Fetch meetings - defined outside useEffect to avoid recreating it on each render
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      // First try fetching from API
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('http://localhost:8080/api/meetings', {
        headers: {
          'x-access-token': token
        }
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Sort meetings by date
        const sortedMeetings = response.data.sort((a, b) => {
          const dateA = new Date(a.date || a.meetingDate || '');
          const dateB = new Date(b.date || b.meetingDate || '');
          return dateA - dateB;
        });
        
        console.log('API returned meeting data:', sortedMeetings);
        setMeetings(sortedMeetings);
        
        // Find next upcoming meeting for timer
        const now = new Date();
        const upcomingMeeting = sortedMeetings.find(m => {
          const meetingDate = new Date(m.date || m.meetingDate || '');
          return !isNaN(meetingDate.getTime()) && meetingDate > now;
        });
        
        if (upcomingMeeting) {
          setTimerFromMeeting(upcomingMeeting);
        }
      } else {
        console.log('API returned no meetings or invalid data, trying localStorage');
        // API returned no meetings, try localStorage
        if (!checkLocalStorageForMeetings()) {
          console.log('No valid meetings in localStorage either, using hardcoded data');
          useHardcodedMeetings();
        }
      }
    } catch (error) {
      console.error('Error in fetchMeetings:', error);
      console.log('API request failed, trying localStorage');
      
      // Try localStorage
      if (!checkLocalStorageForMeetings()) {
        console.log('No valid meetings in localStorage either, using hardcoded data');
        useHardcodedMeetings();
      }
    } finally {
      setLoading(false);
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
  const renderMeetingSchedule = () => {
    // Debug log to show what meetings are available
    console.log('Rendering meetings with data:', meetings);
    
    // Create date categorizations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Sort meetings into categories
    const pastMeetings = [];
    const todayMeetings = [];
    const upcomingMeetings = [];
    
    // Safely check if meetings exists and is an array
    if (Array.isArray(meetings) && meetings.length > 0) {
      meetings.forEach(meeting => {
        try {
          console.log('Processing meeting:', meeting);
          
          if (!meeting) {
            console.warn('Found null/undefined meeting in array');
            return; // Skip this meeting
          }
          
          // Log details of each meeting for debugging
          console.log(`Meeting details: 
            title: ${meeting.title || 'undefined'}, 
            role: ${meeting.role || 'undefined'}, 
            date: ${meeting.date || 'undefined'}, 
            meetingDate: ${meeting.meetingDate || 'undefined'}, 
            department: ${meeting.department || 'undefined'}`);
          
          // Handle both date formats
          const dateStr = meeting.date || meeting.meetingDate || '';
          if (!dateStr) {
            console.warn('Meeting has no date information:', meeting);
            return; // Skip this meeting
          }
          
          const meetingDate = new Date(dateStr);
          if (isNaN(meetingDate.getTime())) {
            console.warn('Invalid meeting date:', dateStr);
            return; // Skip this meeting
          }
          
          meetingDate.setHours(0, 0, 0, 0);
          
          if (meetingDate < today) {
            pastMeetings.push(meeting);
          } else if (meetingDate.getTime() === today.getTime()) {
            todayMeetings.push(meeting);
          } else {
            upcomingMeetings.push(meeting);
          }
        } catch (error) {
          console.error('Error processing meeting:', error, meeting);
        }
      });
    } else {
      console.warn('Meetings is not an array or is empty:', meetings);
    }
    
    // Helper function to format date for display
    const formatDate = (dateStr) => {
      if (!dateStr) return 'No date';
      
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return 'Invalid date';
        }
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } catch (e) {
        console.error('Error formatting date:', e, dateStr);
        return 'Error formatting date';
      }
    };
    
    // Directly check localStorage for meetings (debugging)
    const checkLocalStorage = () => {
      try {
        const storedMeetings = localStorage.getItem('submittedMeetings');
        console.log('Checking localStorage directly:', storedMeetings);
        
        if (storedMeetings) {
          try {
            const parsedMeetings = JSON.parse(storedMeetings);
            console.log('Successfully parsed meetings from localStorage:', parsedMeetings);
            
            // Log the first meeting details if available
            if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
              const firstMeeting = parsedMeetings[0];
              console.log('First meeting from localStorage:', {
                title: firstMeeting.title,
                role: firstMeeting.role,
                date: firstMeeting.date,
                meetingDate: firstMeeting.meetingDate,
                startTime: firstMeeting.startTime,
                endTime: firstMeeting.endTime,
                department: firstMeeting.department,
                departmentId: firstMeeting.departmentId,
                year: firstMeeting.year
              });
            }
            
            if (Array.isArray(parsedMeetings)) {
              setMeetings(parsedMeetings);
              setSnackbar({
                open: true,
                message: 'Meetings loaded from localStorage',
                severity: 'success'
              });
              return true;
            } else {
              console.error('Parsed meetings is not an array:', parsedMeetings);
              setSnackbar({
                open: true,
                message: 'Error: Stored meetings data is invalid',
                severity: 'error'
              });
            }
          } catch (error) {
            console.error('Error parsing localStorage meetings:', error);
            setSnackbar({
              open: true,
              message: 'Error parsing stored meetings',
              severity: 'error'
            });
          }
        } else {
          setSnackbar({
            open: true,
            message: 'No meetings found in localStorage',
            severity: 'info'
          });
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        setSnackbar({
          open: true,
          message: 'Error accessing localStorage',
          severity: 'error'
        });
      }
      return false;
    };
    
    // Render a single meeting item with error handling
    const renderMeetingItem = (meeting, index) => {
      try {
        if (!meeting) return null;
        
        return (
          <Box key={meeting.id || index} sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mt: index > 0 ? 1 : 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {formatDate(meeting.date || meeting.meetingDate)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {meeting.startTime || 'Time not specified'}
            </Typography>
            {meeting.title && (
              <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                {meeting.title}
              </Typography>
            )}
          </Box>
        );
      } catch (error) {
        console.error('Error rendering meeting item:', error, meeting);
        return (
          <Box key={`error-${index}`} sx={{ bgcolor: '#fff0f0', p: 2, borderRadius: 0, mt: index > 0 ? 1 : 0 }}>
            <Typography variant="body2" color="error">Error displaying meeting</Typography>
          </Box>
        );
      }
    };
    
    return (
      <Paper sx={{ p: 4, borderRadius: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Meeting Schedule</Typography>
        
        {/* Debug button */}
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={checkLocalStorage}
            sx={{ mb: 2, fontSize: '0.7rem' }}
          >
            Debug: Reload from localStorage
          </Button>
        </Box>
        
        {/* Past meetings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Past Meeting Schedule</Typography>
          
          {pastMeetings.length > 0 ? (
            pastMeetings.map((meeting, index) => renderMeetingItem(meeting, index))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', p: 2 }}>No past meetings available</Typography>
          )}
        </Box>
        
        {/* Today's meetings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Present Meeting Schedule</Typography>
          
          {todayMeetings.length > 0 ? (
            todayMeetings.map((meeting, index) => renderMeetingItem(meeting, index))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', p: 2 }}>No meetings scheduled for today</Typography>
          )}
        </Box>
        
        {/* Upcoming meetings */}
        <Box>
          <Typography variant="h6" gutterBottom>Upcoming Meeting Schedule</Typography>
          
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting, index) => renderMeetingItem(meeting, index))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', p: 2 }}>No upcoming meetings scheduled</Typography>
          )}
        </Box>
      </Paper>
    );
  };

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
  const renderMeetingTimer = () => {
    // Add a countdown timer effect
    const [countdown, setCountdown] = useState({
      minutes: nextMeeting?.minutesLeft || 0,
      seconds: nextMeeting?.secondsLeft || 0
    });
    
    // Initialize countdown from localStorage when component mounts
    useEffect(() => {
      try {
        // First try to get student-specific timer data
        const storedStudentTimer = localStorage.getItem('studentNextMeetingData');
        if (storedStudentTimer) {
          const timerData = JSON.parse(storedStudentTimer);
          console.log('Student Dashboard: Retrieved student-specific timer data:', timerData);
          
          if (timerData.minutesLeft !== undefined && timerData.secondsLeft !== undefined) {
            // Recalculate time remaining if we have original date
            if (timerData.originalDate) {
              const now = new Date();
              const meetingDate = new Date(timerData.originalDate + 'T' + (timerData.time || '00:00'));
              
              if (!isNaN(meetingDate.getTime())) {
                const diffMs = Math.max(0, meetingDate - now);
                const diffMins = Math.floor(diffMs / 60000);
                const diffSecs = Math.floor((diffMs % 60000) / 1000);
                
                setCountdown({
                  minutes: diffMins,
                  seconds: diffSecs
                });
                
                // Update localStorage with fresh values
                const updatedTimer = {
                  ...timerData,
                  minutesLeft: diffMins,
                  secondsLeft: diffSecs
                };
                localStorage.setItem('studentNextMeetingData', JSON.stringify(updatedTimer));
                
                console.log('Student Dashboard: Updated countdown timer: ', diffMins, 'minutes,', diffSecs, 'seconds');
                return;
              }
            }
            
            // Fallback to stored values if we can't recalculate
            setCountdown({
              minutes: timerData.minutesLeft,
              seconds: timerData.secondsLeft
            });
            return;
          }
        }
        
        // Fallback to generic timer data if it has student role or no role specified
        const storedTimer = localStorage.getItem('nextMeetingData');
        if (storedTimer) {
          const timerData = JSON.parse(storedTimer);
          
          // Use this data if it's for student role or has no role specified
          if (!timerData.role || timerData.role?.toLowerCase() === 'student') {
            console.log('Student Dashboard: Using generic timer data for student role');
            
            if (timerData.minutesLeft !== undefined && timerData.secondsLeft !== undefined) {
              // Recalculate time remaining if we have original date
              if (timerData.originalDate) {
                const now = new Date();
                const meetingDate = new Date(timerData.originalDate + 'T' + (timerData.time || '00:00'));
                
                if (!isNaN(meetingDate.getTime())) {
                  const diffMs = Math.max(0, meetingDate - now);
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffSecs = Math.floor((diffMs % 60000) / 1000);
                  
                  setCountdown({
                    minutes: diffMins,
                    seconds: diffSecs
                  });
                  
                  // Create student-specific timer data
                  const updatedTimer = {
                    ...timerData,
                    minutesLeft: diffMins,
                    secondsLeft: diffSecs,
                    role: 'student'
                  };
                  localStorage.setItem('studentNextMeetingData', JSON.stringify(updatedTimer));
                  
                  console.log('Student Dashboard: Created student timer from generic data');
                  return;
                }
              }
              
              // Fallback to stored values if we can't recalculate
              setCountdown({
                minutes: timerData.minutesLeft,
                seconds: timerData.secondsLeft
              });
            }
          } else {
            console.log('Student Dashboard: Generic timer is not for student role:', timerData.role);
          }
        }
      } catch (error) {
        console.error('Student Dashboard: Error initializing countdown from localStorage:', error);
      }
    }, []);
    
    // Keep the timer running
    useEffect(() => {
      if (!countdown || (countdown.minutes === 0 && countdown.seconds === 0)) {
        return; // Don't start timer if no valid countdown
      }
      
      console.log('Student Dashboard: Starting countdown timer with values:', countdown);
      
      // Set up the interval to update every second
      const timer = setInterval(() => {
        setCountdown(prev => {
          // Calculate new values
          let newSeconds = prev.seconds - 1;
          let newMinutes = prev.minutes;
          
          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes = newMinutes - 1;
          }
          
          // Don't go below zero
          if (newMinutes < 0) {
            newMinutes = 0;
            newSeconds = 0;
            clearInterval(timer);
          }
          
          // Update localStorage with current values
          try {
            // Update student-specific timer first
            const storedStudentTimer = localStorage.getItem('studentNextMeetingData');
            if (storedStudentTimer) {
              const timerData = JSON.parse(storedStudentTimer);
              const updatedTimer = {
                ...timerData,
                minutesLeft: newMinutes,
                secondsLeft: newSeconds
              };
              localStorage.setItem('studentNextMeetingData', JSON.stringify(updatedTimer));
            }
            
            // For backwards compatibility, also update generic timer if it's for student
            const storedTimer = localStorage.getItem('nextMeetingData');
            if (storedTimer) {
              const timerData = JSON.parse(storedTimer);
              if (!timerData.role || timerData.role?.toLowerCase() === 'student') {
                const updatedTimer = {
                  ...timerData,
                  minutesLeft: newMinutes,
                  secondsLeft: newSeconds
                };
                localStorage.setItem('nextMeetingData', JSON.stringify(updatedTimer));
              }
            }
          } catch (error) {
            console.error('Student Dashboard: Error updating timer in localStorage:', error);
          }
          
          return { minutes: newMinutes, seconds: newSeconds };
        });
      }, 1000);
      
      // Clean up when component unmounts
      return () => {
        clearInterval(timer);
      };
    }, [countdown]);
    
    // Get meeting details from localStorage if not available from Redux
    const meetingDetails = React.useMemo(() => {
      if (nextMeeting?.date && nextMeeting?.time) {
        return nextMeeting;
      }
      
      try {
        // First try student-specific timer data
        const storedStudentTimer = localStorage.getItem('studentNextMeetingData');
        if (storedStudentTimer) {
          const timerData = JSON.parse(storedStudentTimer);
          console.log('Student Dashboard: Using student-specific meeting details');
          if (timerData.date && timerData.time) {
            return timerData;
          }
        }
        
        // Fallback to generic timer data if appropriate
        const storedTimer = localStorage.getItem('nextMeetingData');
        if (storedTimer) {
          const timerData = JSON.parse(storedTimer);
          if ((!timerData.role || timerData.role?.toLowerCase() === 'student') && timerData.date && timerData.time) {
            console.log('Student Dashboard: Using generic meeting data for student role');
            return timerData;
          }
        }
      } catch (e) {
        console.error('Student Dashboard: Error getting meeting details from localStorage:', e);
      }
      
      return null;
    }, [nextMeeting]);
    
    return (
      <Paper sx={{ p: 4, borderRadius: 0 }}>
        <Typography variant="h5" align="center" gutterBottom>Meeting Timer</Typography>
        
        {meetingDetails ? (
          <>
            <Typography variant="body1" align="center" sx={{ my: 2 }}>
              Next Meeting: {meetingDetails.date} - {meetingDetails.time}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 2
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                  {String(countdown.minutes).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0 }}>
                  minutes
                </Typography>
              </Box>
              
              <Typography variant="h2" sx={{ mx: 2, fontWeight: 'normal' }}>:</Typography>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                  {String(countdown.seconds).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0 }}>
                  seconds
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Typography variant="body1" align="center" sx={{ my: 4 }}>
            No upcoming meetings scheduled
          </Typography>
        )}
        
        {/* Debug button to force reload from localStorage */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              try {
                // Try student-specific timer data first
                const storedStudentTimer = localStorage.getItem('studentNextMeetingData');
                if (storedStudentTimer) {
                  const timerData = JSON.parse(storedStudentTimer);
                  console.log('Student Dashboard: Debug - Reloaded student timer data:', timerData);
                  
                  if (timerData.originalDate) {
                    const now = new Date();
                    const meetingDate = new Date(timerData.originalDate + 'T' + (timerData.time || '00:00'));
                    const diffMs = Math.max(0, meetingDate - now);
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffSecs = Math.floor((diffMs % 60000) / 1000);
                    
                    setCountdown({
                      minutes: diffMins,
                      seconds: diffSecs
                    });
                    
                    // Update student-specific timer data
                    const updatedTimer = {
                      ...timerData,
                      minutesLeft: diffMins,
                      secondsLeft: diffSecs
                    };
                    localStorage.setItem('studentNextMeetingData', JSON.stringify(updatedTimer));
                    
                    setSnackbar({
                      open: true,
                      message: 'Student timer recalculated from meeting date',
                      severity: 'success'
                    });
                    return;
                  }
                }
                
                // Fallback to generic timer data
                const storedTimer = localStorage.getItem('nextMeetingData');
                if (storedTimer) {
                  const timerData = JSON.parse(storedTimer);
                  console.log('Student Dashboard: Debug - Checking generic timer data:', timerData);
                  
                  if (!timerData.role || timerData.role?.toLowerCase() === 'student') {
                    if (timerData.originalDate) {
                      const now = new Date();
                      const meetingDate = new Date(timerData.originalDate + 'T' + (timerData.time || '00:00'));
                      const diffMs = Math.max(0, meetingDate - now);
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffSecs = Math.floor((diffMs % 60000) / 1000);
                      
                      setCountdown({
                        minutes: diffMins,
                        seconds: diffSecs
                      });
                      
                      // Create student-specific timer data from generic
                      const updatedTimer = {
                        ...timerData,
                        minutesLeft: diffMins,
                        secondsLeft: diffSecs,
                        role: 'student'
                      };
                      localStorage.setItem('studentNextMeetingData', JSON.stringify(updatedTimer));
                      
                      setSnackbar({
                        open: true,
                        message: 'Timer recalculated from generic student meeting data',
                        severity: 'success'
                      });
                      return;
                    }
                  } else {
                    setSnackbar({
                      open: true,
                      message: 'No student meeting timer found - generic timer is for a different role',
                      severity: 'warning'
                    });
                    return;
                  }
                }
                
                setSnackbar({
                  open: true,
                  message: 'No student meeting timer data found',
                  severity: 'warning'
                });
              } catch (error) {
                console.error('Student Dashboard: Error reloading timer:', error);
                setSnackbar({
                  open: true,
                  message: 'Error reloading timer data',
                  severity: 'error'
                });
              }
            }}
            sx={{ fontSize: '0.7rem' }}
          >
            Debug: Reload Student Timer
          </Button>
        </Box>
      </Paper>
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
        <Box sx={{ width: '1010px', mt: 2, mb: 2 }}>
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