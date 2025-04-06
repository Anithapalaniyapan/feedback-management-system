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

  // Check authentication and role on component mount
  useEffect(() => {
        if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
          return;
        }
        
    if (userRole !== 'STAFF' && userRole !== 'ROLE_STAFF') {
      console.log('User role is not STAFF:', userRole);
      dispatch(showSnackbar({
        message: 'You do not have permission to access this dashboard',
        severity: 'error'
      }));
      navigate('/login');
          return;
        }
    
    console.log('Loading staff profile...');
    // Fetch user profile and meetings
    dispatch(fetchUserProfile());
    
    // Make sure the userRole is stored in localStorage for meeting filtering
    localStorage.setItem('userRole', 'staff');
    
    // Fetch meetings with staff role filter
    dispatch(fetchMeetings());
    
    // Debug localStorage for meetings
    const storedMeetings = localStorage.getItem('submittedMeetings');
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
  }, [dispatch, navigate, token, userRole]);

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
    // Debug reload function
    const handleDebugReload = () => {
      try {
        const storedMeetings = localStorage.getItem('submittedMeetings');
        console.log('Debug: Checking localStorage for meetings:', storedMeetings);
        
        if (storedMeetings) {
          const parsedMeetings = JSON.parse(storedMeetings);
          
          if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
            console.log('Debug: Found valid meetings in localStorage:', parsedMeetings);
            
            // Filter meetings for staff role only
            const staffMeetings = parsedMeetings.filter(meeting => {
              // Check if role exists and is 'staff' (case-insensitive)
              const role = (meeting.role || '').toLowerCase();
              const isStaff = role.includes('staff');
              console.log(`Meeting role: "${meeting.role}", isStaff: ${isStaff}`);
              return isStaff;
            });
            
            console.log(`Filtered ${staffMeetings.length} staff meetings from ${parsedMeetings.length} total meetings`);
            
            if (staffMeetings.length > 0) {
              // Update meetings in state
              dispatch(fetchMeetings());
              
              // Also directly set meetings to ensure immediate UI update
              // This will be overwritten if the Redux action succeeds
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
              
              // Show success message
              dispatch(showSnackbar({
                message: 'Reloaded staff meetings from localStorage',
                severity: 'success'
              }));
              
              return;
            } else {
              dispatch(showSnackbar({
                message: 'No staff meetings found in localStorage',
                severity: 'warning'
              }));
              return;
            }
          }
        }
        
        dispatch(showSnackbar({
          message: 'No valid meetings found in localStorage',
          severity: 'warning'
        }));
    } catch (error) {
        console.error('Debug: Error reloading meetings:', error);
        dispatch(showSnackbar({
          message: 'Error reloading meetings from localStorage',
          severity: 'error'
        }));
      }
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
        
        {/* Debug button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined" 
            size="small"
            onClick={handleDebugReload}
            sx={{ mb: 2, fontSize: '0.7rem' }}
          >
            Debug: Reload from localStorage
          </Button>
        </Box>
        
        {meetingsLoading ? (
          <Typography align="center">Loading meetings...</Typography>
        ) : meetingsError ? (
          <Typography align="center" color="error">{meetingsError}</Typography>
        ) : (!filteredMeetings.pastMeetings?.length && !filteredMeetings.currentMeetings?.length && !filteredMeetings.futureMeetings?.length) ? (
          <Typography align="center">No staff meetings found. Please contact the Academic Director to schedule meetings for staff.</Typography>
        ) : (
          <>
            {/* Today's meetings */}
            {filteredMeetings.currentMeetings && filteredMeetings.currentMeetings.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Today's Meetings</Typography>
                
                {filteredMeetings.currentMeetings.map(meeting => (
                  <Box key={meeting.id} sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(meeting.meetingDate).toLocaleDateString()} - {meeting.startTime}
              </Typography>
                    <Button 
                      size="small" 
                      startIcon={<QuestionAnswerIcon />} 
                      onClick={() => handleFetchQuestions(meeting.id)}
                      sx={{ mt: 1, color: '#1A2137' }}
                    >
                      Provide Feedback
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Past meetings */}
            {filteredMeetings.pastMeetings && filteredMeetings.pastMeetings.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Past Meetings</Typography>
                
                {filteredMeetings.pastMeetings.map(meeting => (
                  <Box key={meeting.id} sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(meeting.meetingDate).toLocaleDateString()} - {meeting.startTime}
                  </Typography>
                    <Button
                      size="small" 
                      startIcon={<QuestionAnswerIcon />} 
                      onClick={() => handleFetchQuestions(meeting.id)}
                      sx={{ mt: 1, color: '#1A2137' }}
                    >
                      Provide Feedback
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Upcoming meetings */}
            {filteredMeetings.futureMeetings && filteredMeetings.futureMeetings.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Upcoming Meetings</Typography>
                
                {filteredMeetings.futureMeetings.map(meeting => (
                  <Box key={meeting.id} sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 0, mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(meeting.meetingDate).toLocaleDateString()} - {meeting.startTime}
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
            )}
          </>
              )}
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
              } else {
                console.log('Staff Dashboard: Invalid meeting date in generic data:', timerData.originalDate);
              }
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
          onClick={() => dispatch(setActiveSection('profile'))}
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
          onClick={() => dispatch(setActiveSection('feedback'))}
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
          onClick={() => dispatch(setActiveSection('meeting-schedule'))}
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
          onClick={() => dispatch(setActiveSection('reports'))}
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
        <Box sx={{ width: '1010px', mt: 2, mb: 2 }}>
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'feedback' && renderFeedback()}
          {activeSection === 'meeting-schedule' && renderMeetingSchedule()}
          {activeSection === 'reports' && renderReports()}
          
          {/* Meeting Timer shown whenever not in reports view */}
          {activeSection !== 'reports' && (
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

export default StaffDashboard;
