import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  CardContent,
  Container
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
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import API from '../../api/axiosConfig';

// Import Redux actions
import { fetchUserProfile } from '../../redux/slices/userSlice';
import { fetchMeetings, resetCountdown } from '../../redux/slices/meetingSlice';
import { fetchAllQuestions, fetchQuestionsByDeptAndYear } from '../../redux/slices/questionSlice';
import { setRating, submitFeedback, clearRatings } from '../../redux/slices/feedbackSlice';
import { logout } from '../../redux/slices/authSlice';
import { 
  setActiveSection, 
  showSnackbar, 
  hideSnackbar 
} from '../../redux/slices/uiSlice';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { token, userRole } = useSelector(state => state.auth);
  const { profile } = useSelector(state => state.user);
  const { meetings } = useSelector(state => state.meetings);
  const { questions } = useSelector(state => state.questions);
  const { ratings, loading: feedbackLoading, submitSuccess, error: feedbackError } = useSelector(state => state.feedback);
  const { activeSection, snackbar } = useSelector(state => state.ui);
  const { loading: meetingsLoading, error: meetingsError, nextMeeting } = useSelector(state => state.meetings);

  // Set initial active section
  useEffect(() => {
    dispatch(setActiveSection('profile'));
  }, [dispatch]);

  // Check authentication and role on component mount
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      // Normalize and check role - be flexible with role format
      const normalizedRole = userRole ? userRole.toLowerCase() : '';
      const isStaffRole = 
        normalizedRole === 'staff' || 
        normalizedRole === 'faculty' || 
        normalizedRole === 'teacher' ||
        normalizedRole.includes('staff');
      
      if (!isStaffRole) {
        console.log(`Invalid role for staff dashboard: ${userRole}`);
        dispatch(showSnackbar({
          message: 'You do not have permission to access this dashboard',
          severity: 'error'
        }));
        navigate('/login');
        return;
      }
      
      console.log('Authentication successful for Staff Dashboard');
      
      try {
        // Fetch user profile
        await dispatch(fetchUserProfile()).unwrap();
        
        // Make sure the userRole is stored in localStorage for meeting filtering
        localStorage.setItem('userRole', 'staff');
        
        // Load meetings
        await loadMeetingsFromStorage();
        await dispatch(fetchMeetings());
        
        // Debug localStorage for meetings
        const storedMeetings = localStorage.getItem('meetings');
        if (storedMeetings) {
          try {
            const parsedMeetings = JSON.parse(storedMeetings);
            console.log('Staff Dashboard: Found meetings in localStorage:', parsedMeetings.length);
            
            // Check for staff meetings
            const staffMeetings = parsedMeetings.filter(meeting => 
              (meeting.role || '').toLowerCase() === 'staff'
            );
            console.log(`Staff Dashboard: Found ${staffMeetings.length} staff meetings out of ${parsedMeetings.length} total`);
          } catch (error) {
            console.error('Staff Dashboard: Error parsing localStorage meetings:', error);
          }
        } else {
          console.log('Staff Dashboard: No meetings found in localStorage');
        }
      } catch (error) {
        console.error('Error initializing staff dashboard:', error);
        // If Redux fails, try direct API call
        await fetchUserProfileDirectly();
      }
    };

    checkAuthAndLoadData();
  }, [dispatch, navigate, token, userRole]);

  // Direct API call as fallback for profile loading
  const fetchUserProfileDirectly = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
        console.error('No token found for direct profile fetch');
          return;
        }
        
      console.log('Attempting direct API call to fetch staff profile');
      
      // First try to get user data from login response stored in localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          console.log('Found stored user data:', parsedUserData);
          
          // Update the Redux store with this data
          dispatch({
            type: 'user/setUserProfile',
            payload: parsedUserData
          });
          
          return; // If we successfully loaded from localStorage, don't make API call
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      
      // Call the API directly using the global API instance
      const response = await API.get('/users/profile');
      
      console.log('Profile API response received:', response.data);
      
      if (response.data && Object.keys(response.data).length > 0) {
        // Update Redux store with the profile data
        dispatch({
          type: 'user/setUserProfile',
          payload: response.data
        });
        
        // Store the data in localStorage for future use
        localStorage.setItem('userData', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error in direct profile fetch:', error);
      console.error('Error response:', error.response?.data);
      
      // Set a default profile in case of error
      dispatch({
        type: 'user/setUserProfile',
        payload: {
          name: 'Staff Member',
          staffId: 'SF123456',
          department: { name: 'Engineering' },
          position: 'Lecturer',
          email: 'staff@university.edu'
        }
      });
    }
  };

  // Effect to show success/error messages for feedback submission
  useEffect(() => {
    if (submitSuccess) {
      dispatch(showSnackbar({
        message: 'Feedback submitted successfully',
        severity: 'success'
      }));
    } else if (feedbackError) {
      dispatch(showSnackbar({
        message: feedbackError,
        severity: 'error'
      }));
    }
  }, [dispatch, submitSuccess, feedbackError]);

  // Fetch questions for a specific meeting
  const handleFetchQuestions = (meetingId) => {
    // Since we don't have a direct fetchQuestionsByMeeting function anymore,
    // we'll use the meeting data to get department and year, then fetch questions
    const meeting = meetings.pastMeetings.find(m => m.id === meetingId) || 
                    meetings.currentMeetings.find(m => m.id === meetingId) || 
                    meetings.futureMeetings.find(m => m.id === meetingId);
    
    if (meeting && meeting.departmentId) {
      dispatch(fetchQuestionsByDeptAndYear({ 
        departmentId: meeting.departmentId, 
        year: meeting.year || new Date().getFullYear()
      }));
    } else {
      // Fallback to fetching all questions if we can't determine department/year
      dispatch(fetchAllQuestions());
    }
    
    dispatch(setActiveSection('feedback'));
  };

  const handleRatingChange = (questionId, value) => {
    dispatch(setRating({ questionId, rating: value }));
  };

  const handleSubmitFeedback = () => {
    // Check if all questions have ratings
    const hasEmptyRatings = Object.keys(ratings).length < questions.length || 
      Object.values(ratings).some(rating => rating === 0);
    
    if (hasEmptyRatings) {
      dispatch(showSnackbar({
        message: 'Please rate all questions before submitting',
        severity: 'warning'
      }));
      return;
    }

    dispatch(submitFeedback());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleCloseSnackbar = () => {
    dispatch(hideSnackbar());
  };

  // Add dedicated function to load meetings from localStorage
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
      
      // Filter staff meetings
      const staffMeetings = parsedMeetings.filter(meeting => {
        // Check if role exists and is 'staff' (case-insensitive)
        const role = (meeting.role || '').toLowerCase();
        return role === 'staff' || role.includes('staff');
      });
      
      console.log('Filtered', staffMeetings.length, 'staff meetings from', parsedMeetings.length, 'total meetings');
      
      if (staffMeetings.length > 0) {
        // Sort and categorize meetings
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const currentMeetings = [];
        const pastMeetings = [];
        const futureMeetings = [];
        
        staffMeetings.forEach(meeting => {
          const meetingDate = new Date(meeting.date || meeting.meetingDate);
          meetingDate.setHours(0, 0, 0, 0);
          
          if (meetingDate.getTime() === today.getTime()) {
            currentMeetings.push(meeting);
          } else if (meetingDate < today) {
            pastMeetings.push(meeting);
          } else {
            futureMeetings.push(meeting);
          }
        });
        
        // Update Redux store
        dispatch({
          type: 'meetings/setMeetings',
          payload: {
            pastMeetings,
            currentMeetings,
            futureMeetings
          }
        });
        
        // Also update timer if we have an upcoming meeting
        if (futureMeetings.length > 0) {
          // Sort future meetings by date
          const sortedMeetings = [...futureMeetings].sort((a, b) => {
            const dateA = new Date(a.date || a.meetingDate || '');
            const dateB = new Date(b.date || b.meetingDate || '');
            return dateA - dateB;
          });
          
          const nextMeeting = sortedMeetings[0];
          const meetingDate = new Date(`${nextMeeting.date || nextMeeting.meetingDate}T${nextMeeting.startTime || '00:00'}`);
          
          if (!isNaN(meetingDate.getTime())) {
            const diffMs = Math.max(0, meetingDate - now);
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            
            const timerData = {
              id: nextMeeting.id,
              title: nextMeeting.title,
              date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: nextMeeting.startTime,
              minutesLeft: diffMins,
              secondsLeft: diffSecs,
              originalDate: nextMeeting.date || nextMeeting.meetingDate,
              role: 'staff'
            };
            
            // Update staff timer data
            localStorage.setItem('staffNextMeetingData', JSON.stringify(timerData));
          }
        }
        
        dispatch(showSnackbar({
          message: `Loaded ${staffMeetings.length} staff meetings`,
          severity: 'success'
        }));
        
        return true;
      }
      
      console.log('No staff meetings found in localStorage');
      return false;
    } catch (error) {
      console.error('Error loading meetings from localStorage:', error);
      return false;
    }
  };

  // Add sortAndSetMeetings function
  const sortAndSetMeetings = (meetings) => {
    if (!Array.isArray(meetings)) {
      console.error('Invalid meetings data received:', meetings);
      return;
    }

    // Sort meetings by date
    const sortedMeetings = meetings.sort((a, b) => {
      const dateA = new Date(a.date || a.meetingDate || '');
      const dateB = new Date(b.date || b.meetingDate || '');
      return dateA - dateB;
    });

    // Update state with sorted meetings
    dispatch({
      type: 'meetings/setMeetings',
      payload: {
        pastMeetings: sortedMeetings.filter(m => {
          const meetingDate = new Date(m.date || m.meetingDate || '');
          return meetingDate < new Date();
        }),
        currentMeetings: sortedMeetings.filter(m => {
          const meetingDate = new Date(m.date || m.meetingDate || '');
          const today = new Date();
          return meetingDate.toDateString() === today.toDateString();
        }),
        futureMeetings: sortedMeetings.filter(m => {
          const meetingDate = new Date(m.date || m.meetingDate || '');
          return meetingDate > new Date();
        })
      }
    });

    // Store in localStorage
    try {
      localStorage.setItem('meetings', JSON.stringify(sortedMeetings));
      localStorage.setItem('submittedMeetings', JSON.stringify(sortedMeetings));
    } catch (error) {
      console.error('Error storing meetings in localStorage:', error);
    }
  };

  // Update fetchMeetings function
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Get staff's department from profile
      const userProfile = JSON.parse(localStorage.getItem('userData'));
      const staffDepartment = userProfile?.department;

      // First try to load from localStorage
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        try {
          const parsedMeetings = JSON.parse(storedMeetings);
          if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
            // Filter meetings based on staff's department
            const filteredMeetings = parsedMeetings.filter(meeting => 
              meeting.role?.toLowerCase() === 'staff' &&
              meeting.department === staffDepartment
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
        // Filter meetings based on staff's department
        const filteredMeetings = response.data.filter(meeting => 
          meeting.role?.toLowerCase() === 'staff' &&
          meeting.department === staffDepartment
        );
        sortAndSetMeetings(filteredMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings from API:', error);
      dispatch(showSnackbar({
        message: 'Error loading meetings. Please try again.',
        severity: 'error'
      }));
    }
  };

  // Render staff profile section
  const renderProfile = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      position: 'relative'  
    }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Staff Profile</Typography>
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        mb: 0
      }}>
        <Avatar sx={{ width: 76, height: 76, bgcolor: '#1A2137', mr: 4 }}>
          {profile?.name ? profile.name.charAt(0) : 'J'}
        </Avatar>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Name</Typography>
                <Typography variant="body1">{profile?.name || 'Loading...'}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Staff ID</Typography>
                <Typography variant="body1">{profile?.staffId || profile?.username || 'Loading...'}</Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Department</Typography>
                <Typography variant="body1">{profile?.department?.name || 'Loading...'}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Position</Typography>
                <Typography variant="body1">{profile?.position || 'Loading...'}</Typography>
              </Box>
            </Box>
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>Email ID</Typography>
              <Typography variant="body1">{profile?.email || 'Loading...'}</Typography>
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
      
      {questions.length === 0 ? (
        <Typography align="center">No questions available. Please select a meeting from the schedule.</Typography>
      ) : (
        <>
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
              disabled={feedbackLoading}
                    sx={{
                mt: 2, 
                bgcolor: '#1A2137', 
                '&:hover': { bgcolor: '#2A3147' },
                fontWeight: 'medium',
                px: 4,
                py: 1
              }}
            >
              {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );

  // Render meeting schedule section
  const renderMeetingSchedule = () => {
    // Existing debug reload function
    const handleDebugReload = () => {
      loadMeetingsFromStorage();
    };
    
    // Filter displayed meetings by role to show only staff meetings
    const filteredMeetings = {
      pastMeetings: meetings.pastMeetings ? meetings.pastMeetings.filter(meeting => 
        (meeting.role || '').toLowerCase().includes('staff')
      ) : [],
      currentMeetings: meetings.currentMeetings ? meetings.currentMeetings.filter(meeting => 
        (meeting.role || '').toLowerCase().includes('staff')
      ) : [],
      futureMeetings: meetings.futureMeetings ? meetings.futureMeetings.filter(meeting => 
        (meeting.role || '').toLowerCase().includes('staff')
      ) : []
    };

    return (
      <Paper sx={{ p: 4, borderRadius: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Meeting Schedule</Typography>
        
        {/* Past Meetings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Past Meetings</Typography>
          {filteredMeetings.pastMeetings.length > 0 ? (
            filteredMeetings.pastMeetings.map((meeting) => (
              <Box key={meeting.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{meeting.title}</Typography>
                <Typography variant="body2">Date: {meeting.date}</Typography>
                <Typography variant="body2">Time: {meeting.startTime} - {meeting.endTime}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">No past meetings</Typography>
          )}
        </Box>
        
        {/* Current Meetings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Today's Meetings</Typography>
          {filteredMeetings.currentMeetings.length > 0 ? (
            filteredMeetings.currentMeetings.map((meeting) => (
              <Box key={meeting.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{meeting.title}</Typography>
                <Typography variant="body2">Time: {meeting.startTime} - {meeting.endTime}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">No meetings scheduled for today</Typography>
          )}
        </Box>
        
        {/* Future Meetings */}
        <Box>
          <Typography variant="h6" gutterBottom>Upcoming Meetings</Typography>
          {filteredMeetings.futureMeetings.length > 0 ? (
            filteredMeetings.futureMeetings.map((meeting) => (
              <Box key={meeting.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{meeting.title}</Typography>
                <Typography variant="body2">Date: {meeting.date}</Typography>
                <Typography variant="body2">Time: {meeting.startTime} - {meeting.endTime}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">No upcoming meetings scheduled</Typography>
          )}
        </Box>
        
        {/* Debug reload button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleDebugReload}
            sx={{ fontSize: '0.7rem' }}
          >
            Reload Meetings
          </Button>
        </Box>
      </Paper>
    );
  };

  // Update the tabs array
  const tabs = [
    { id: 0, label: "Profile", icon: <PersonIcon /> },
    { id: 1, label: "View Meetings", icon: <EventIcon /> },
    { id: 2, label: "View Questions", icon: <QuestionAnswerIcon /> }
  ];

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
        // First try to get staff-specific timer data
        const storedStaffTimer = localStorage.getItem('staffNextMeetingData');
        console.log('Staff Dashboard: Looking for staff-specific timer data');
        
        if (storedStaffTimer) {
          const timerData = JSON.parse(storedStaffTimer);
          console.log('Staff Dashboard: Retrieved staff-specific timer data:', timerData);
          
          // Always recalculate time from original date if available
          if (timerData.originalDate) {
            const now = new Date();
            const meetingDate = new Date(timerData.originalDate + 'T' + (timerData.time || '00:00'));
            
            if (!isNaN(meetingDate.getTime())) {
              const diffMs = Math.max(0, meetingDate - now);
              const diffMins = Math.floor(diffMs / 60000);
              const diffSecs = Math.floor((diffMs % 60000) / 1000);
              
              console.log('Staff Dashboard: Recalculating timer from original date:', timerData.originalDate);
              console.log(`Staff Dashboard: Calculated ${diffMins}m ${diffSecs}s until meeting`);
              
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
              localStorage.setItem('staffNextMeetingData', JSON.stringify(updatedTimer));
              
              console.log('Staff Dashboard: Updated staff timer: ', diffMins, 'minutes,', diffSecs, 'seconds');
              return;
            } else {
              console.log('Staff Dashboard: Invalid meeting date:', timerData.originalDate);
            }
          } else if (timerData.minutesLeft !== undefined && timerData.secondsLeft !== undefined) {
            // Fallback to stored values if we can't recalculate
            console.log('Staff Dashboard: No original date found, using stored countdown values');
            setCountdown({
              minutes: timerData.minutesLeft,
              seconds: timerData.secondsLeft
            });
            return;
          }
        } else {
          console.log('Staff Dashboard: No staff-specific timer data found');
        }
        
        // No valid staff timer found, try to rebuild it from meetings
        if (rebuildStaffTimerFromMeetings()) {
          console.log('Staff Dashboard: Successfully rebuilt timer from meetings data');
          return;
        }
        
        // Fallback to generic timer data only if necessary
        const storedTimer = localStorage.getItem('nextMeetingData');
        if (storedTimer) {
          const timerData = JSON.parse(storedTimer);
          console.log('Staff Dashboard: Checking generic timer data:', timerData);
          
          // Only use this data if it's for staff role
          if (timerData.role?.toLowerCase() === 'staff') {
            console.log('Staff Dashboard: Using generic timer data with staff role');
            
            // Always recalculate time from original date if available
            if (timerData.originalDate) {
              const now = new Date();
              const meetingDate = new Date(timerData.originalDate + 'T' + (timerData.time || '00:00'));
              
              if (!isNaN(meetingDate.getTime())) {
                const diffMs = Math.max(0, meetingDate - now);
                const diffMins = Math.floor(diffMs / 60000);
                const diffSecs = Math.floor((diffMs % 60000) / 1000);
                
                console.log('Staff Dashboard: Recalculating timer from generic data original date');
                console.log(`Staff Dashboard: Calculated ${diffMins}m ${diffSecs}s until meeting`);
                
                setCountdown({
                  minutes: diffMins,
                  seconds: diffSecs
                });
                
                // Create staff-specific timer data
                const updatedTimer = {
                  ...timerData,
                  minutesLeft: diffMins,
                  secondsLeft: diffSecs
                };
                localStorage.setItem('staffNextMeetingData', JSON.stringify(updatedTimer));
                
                console.log('Staff Dashboard: Created staff timer from generic data');
                return;
              } else if (timerData.minutesLeft !== undefined && timerData.secondsLeft !== undefined) {
                // Fallback to stored values if we can't recalculate
                console.log('Staff Dashboard: No original date in generic data, using stored values');
                setCountdown({
                  minutes: timerData.minutesLeft,
                  seconds: timerData.secondsLeft
                });
              }
            } else {
              console.log('Staff Dashboard: Generic timer is not for staff role:', timerData.role);
            }
          } else {
            console.log('Staff Dashboard: Generic timer is not for staff role:', timerData.role);
          }
        }
      } catch (error) {
        console.error('Staff Dashboard: Error initializing countdown from localStorage:', error);
      }
    }, []);
    
    // Keep the timer running
    useEffect(() => {
      if (!countdown || (countdown.minutes === 0 && countdown.seconds === 0)) {
        return; // Don't start timer if no valid countdown
      }
      
      console.log('Staff Dashboard: Starting countdown timer with values:', countdown);
      
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
            // Update both generic and staff-specific timer data
            const storedStaffTimer = localStorage.getItem('staffNextMeetingData');
            if (storedStaffTimer) {
              const timerData = JSON.parse(storedStaffTimer);
              const updatedTimer = {
                ...timerData,
                minutesLeft: newMinutes,
                secondsLeft: newSeconds
              };
              localStorage.setItem('staffNextMeetingData', JSON.stringify(updatedTimer));
            }
            
            // Also update the generic timer for backwards compatibility
            const storedGenericTimer = localStorage.getItem('nextMeetingData');
            if (storedGenericTimer) {
              const timerData = JSON.parse(storedGenericTimer);
              // Only update if it's a staff timer
              if (timerData.role?.toLowerCase() === 'staff') {
                const updatedTimer = {
                  ...timerData,
                  minutesLeft: newMinutes,
                  secondsLeft: newSeconds
                };
                localStorage.setItem('nextMeetingData', JSON.stringify(updatedTimer));
              }
            }
          } catch (error) {
            console.error('Staff Dashboard: Error updating timer in localStorage:', error);
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
        // First try staff-specific timer data
        const storedStaffTimer = localStorage.getItem('staffNextMeetingData');
        if (storedStaffTimer) {
          const timerData = JSON.parse(storedStaffTimer);
          console.log('Staff Dashboard: Using staff-specific meeting details:', timerData);
          if (timerData.date && timerData.time) {
            return timerData;
          }
        }
        
        // Fallback to generic timer data only if it's for staff
        const storedTimer = localStorage.getItem('nextMeetingData');
        if (storedTimer) {
          const timerData = JSON.parse(storedTimer);
          if (timerData.role?.toLowerCase() === 'staff' && timerData.date && timerData.time) {
            console.log('Staff Dashboard: Using generic meeting data with staff role');
            return timerData;
          }
        }
      } catch (e) {
        console.error('Staff Dashboard: Error getting meeting details from localStorage:', e);
      }
      
      return null;
    }, [nextMeeting]);
    
    // Debug function to rebuild timer from localStorage
    const rebuildStaffTimerFromMeetings = () => {
      try {
        // Check for staff meetings in localStorage and create a timer if found
        const storedMeetings = localStorage.getItem('submittedMeetings');
        if (storedMeetings) {
          const parsedMeetings = JSON.parse(storedMeetings);
          console.log('Staff Dashboard: Checking submittedMeetings for staff meetings:', parsedMeetings.length);
          
          // Filter for staff meetings only
          const staffMeetings = parsedMeetings.filter(m => 
            (m.role || '').toLowerCase() === 'staff'
          );
          
          console.log(`Staff Dashboard: Found ${staffMeetings.length} staff meetings out of ${parsedMeetings.length} total`);
          
          if (staffMeetings.length > 0) {
            // Find next upcoming staff meeting
            const now = new Date();
            const upcomingStaffMeetings = staffMeetings
              .filter(m => {
                // Handle both date formats
                const meetingDate = new Date(m.date || m.meetingDate || '');
                return !isNaN(meetingDate.getTime()) && meetingDate > now;
              })
              .sort((a, b) => {
                const dateA = new Date(a.date || a.meetingDate || '');
                const dateB = new Date(b.date || b.meetingDate || '');
                return dateA - dateB;
              });
            
            if (upcomingStaffMeetings.length > 0) {
              const nextStaffMeeting = upcomingStaffMeetings[0];
              const meetingDate = new Date(nextStaffMeeting.date || nextStaffMeeting.meetingDate || '');
              const meetingTime = nextStaffMeeting.startTime || '00:00';
              
              // Add time component to date
              const [hours, minutes] = meetingTime.split(':').map(Number);
              meetingDate.setHours(hours || 0, minutes || 0, 0, 0);
              
              // Calculate countdown
              const diffMs = Math.max(0, meetingDate - now);
              const diffMins = Math.floor(diffMs / 60000);
              const diffSecs = Math.floor((diffMs % 60000) / 1000);
              
              // Create new timer data
              const nextStaffMeetingData = {
                id: nextStaffMeeting.id,
                title: nextStaffMeeting.title,
                date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                time: meetingTime,
                minutesLeft: diffMins,
                secondsLeft: diffSecs,
                originalDate: nextStaffMeeting.date || nextStaffMeeting.meetingDate,
                department: nextStaffMeeting.department || nextStaffMeeting.departmentId,
                role: 'staff'
              };
              
              // Set countdown and store timer data
              setCountdown({
                minutes: diffMins,
                seconds: diffSecs
              });
              
              localStorage.setItem('staffNextMeetingData', JSON.stringify(nextStaffMeetingData));
              
              dispatch(showSnackbar({
                message: `Timer created for next staff meeting: ${nextStaffMeeting.title}`,
                severity: 'success'
              }));
              return true;
            }
          }
          
          dispatch(showSnackbar({
            message: 'No upcoming staff meetings found',
            severity: 'info'
          }));
          return false;
        }
        return false;
      } catch (error) {
        console.error('Staff Dashboard: Error rebuilding timer from meetings:', error);
        return false;
      }
    };
    
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
                // Try staff-specific timer data first
                const storedStaffTimer = localStorage.getItem('staffNextMeetingData');
                if (storedStaffTimer) {
                  const timerData = JSON.parse(storedStaffTimer);
                  console.log('Staff Dashboard: Debug - Reloaded staff-specific timer data:', timerData);
                  
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
                    
                    // Update staff-specific timer data
                    const updatedTimer = {
                      ...timerData,
                      minutesLeft: diffMins,
                      secondsLeft: diffSecs
                    };
                    localStorage.setItem('staffNextMeetingData', JSON.stringify(updatedTimer));
                    
                    dispatch(showSnackbar({
                      message: 'Staff timer recalculated from meeting date',
                      severity: 'success'
                    }));
                    return;
                  }
                }
                
                // If no valid staff timer found, try to rebuild it from meetings
                if (rebuildStaffTimerFromMeetings()) {
                  // If rebuild was successful, don't continue
                  return;
                }
                
                // Fallback to generic timer data if all else fails
                const storedGenericTimer = localStorage.getItem('nextMeetingData');
                if (storedGenericTimer) {
                  const timerData = JSON.parse(storedGenericTimer);
                  console.log('Staff Dashboard: Debug - Checking generic timer data:', timerData);
                  
                  if (timerData.role?.toLowerCase() === 'staff') {
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
                      
                      // Create staff-specific timer data from generic data
                      const updatedTimer = {
                        ...timerData,
                        minutesLeft: diffMins,
                        secondsLeft: diffSecs
                      };
                      localStorage.setItem('staffNextMeetingData', JSON.stringify(updatedTimer));
                      
                      dispatch(showSnackbar({
                        message: 'Timer recalculated from generic staff meeting data',
                        severity: 'success'
                      }));
                      return;
                    }
                  } else {
                    dispatch(showSnackbar({
                      message: 'No staff meetings found. Ask the Academic Director to schedule staff meetings.',
                      severity: 'warning'
                    }));
                    return;
                  }
                }
                
                dispatch(showSnackbar({
                  message: 'No staff meeting timer data found. Please ask the Academic Director to schedule meetings for staff.',
                  severity: 'warning'
                }));
              } catch (error) {
                console.error('Staff Dashboard: Error reloading timer:', error);
                dispatch(showSnackbar({
                  message: 'Error reloading timer data',
                  severity: 'error'
                }));
              }
            }}
            sx={{ fontSize: '0.7rem' }}
          >
            Debug: Reload Staff Timer
          </Button>
        </Box>
      </Paper>
    );
  };

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

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Box 
        sx={{
          width: 240,
          bgcolor: '#1A2137',
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
          {tabs.map((tab) => (
            <ListItem 
              key={tab.id}
              button 
              onClick={() => dispatch(setActiveSection(tab.label.toLowerCase().replace(' ', '-')))}
              sx={{ 
                py: 2, 
                pl: 3,
                bgcolor: activeSection === tab.label.toLowerCase().replace(' ', '-') ? '#2A3147' : 'transparent',
                '&:hover': { bgcolor: '#2A3147' }
              }}
            >
              <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
                {tab.icon}
              </ListItemIcon>
              <ListItemText primary={tab.label} sx={{ color: '#FFFFFF' }} />
            </ListItem>
          ))}
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

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          bgcolor: '#f5f5f7',
          ml: '240px',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Box>
              {renderProfile()}
              <Box sx={{ mt: 3 }}>
                {renderMeetingTimer()}
              </Box>
            </Box>
          )}

          {/* View Meetings Section */}
          {activeSection === 'view-meetings' && (
            <Box>
              {renderMeetingSchedule()}
              <Box sx={{ mt: 3 }}>
                {renderMeetingTimer()}
              </Box>
            </Box>
          )}

          {/* View Questions Section */}
          {activeSection === 'view-questions' && (
            <Box>
              {renderFeedback()}
              <Box sx={{ mt: 3 }}>
                {renderMeetingTimer()}
              </Box>
            </Box>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <Box>
              {renderReports()}
            </Box>
          )}
        </Container>
      </Box>

      {/* Snackbar for notifications */}
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
