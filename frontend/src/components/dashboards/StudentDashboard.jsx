import { Container, Typography, Grid, Box, AppBar, Toolbar, Snackbar, Alert, Button, Paper, Card, CardContent, IconButton, Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme, Fade, TextField, BottomNavigation, BottomNavigationAction, Divider } from '@mui/material';
import { Logout, Assessment, Feedback, Schedule, Person, ExpandMore, ExpandLess, Menu as MenuIcon, Description, AccessTime, Room, CalendarToday, ChatBubble, Article } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import the extracted components
import StudentProfile from '../student/StudentProfile';
import FeedbackQuestions from '../student/FeedbackQuestions';
import MeetingSchedule from '../student/MeetingSchedule';
import MeetingMinutes from '../student/MeetingMinutes';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [feedbackRatings, setFeedbackRatings] = useState({});
  const [meetings, setMeetings] = useState({ 
    pastMeetings: [
      { id: 1, meetingDate: '2024-01-15', startTime: '10:00 AM', location: '101', title: 'Academic Review' },
      { id: 2, meetingDate: '2024-01-10', startTime: '02:00 PM', location: '203', title: 'Project Discussion' }
    ], 
    currentMeetings: [
      { id: 3, meetingDate: '2024-01-20', startTime: '11:30 AM', location: '305', title: 'Current Project Review' }
    ], 
    futureMeetings: [
      { id: 4, meetingDate: '2024-01-25', startTime: '09:00 AM', location: '402', title: 'Future Planning' },
      { id: 5, meetingDate: '2024-01-30', startTime: '03:30 PM', location: '105', title: 'Semester Review' }
    ] 
  });
  const [meetingMinutes, setMeetingMinutes] = useState([]);
  const [activeView, setActiveView] = useState('profile'); // profile, feedback, schedule, minutes
  const [nextMeeting, setNextMeeting] = useState(null);
  const [countdownTime, setCountdownTime] = useState({ minutes: 45, seconds: 30 });
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle drawer toggle for mobile view
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Effect to handle responsive drawer state
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);
  
  // Effect to set up the next meeting and countdown timer
  useEffect(() => {
    if (meetings && meetings.futureMeetings && meetings.futureMeetings.length > 0) {
      // Sort future meetings by date
      const sortedMeetings = [...meetings.futureMeetings].sort((a, b) => 
        new Date(a.meetingDate + 'T' + a.startTime) - new Date(b.meetingDate + 'T' + b.startTime)
      );
      
      // Get the next upcoming meeting
      const nextUpcomingMeeting = sortedMeetings[0];
      setNextMeeting(nextUpcomingMeeting);
      
      // Set up countdown timer
      if (nextUpcomingMeeting) {
        // This is just for demo purposes - in a real app, you would calculate the actual time difference
        // between now and the meeting time
        const timer = setInterval(() => {
          setCountdownTime(prev => {
            if (prev.seconds > 0) {
              return { ...prev, seconds: prev.seconds - 1 };
            } else if (prev.minutes > 0) {
              return { minutes: prev.minutes - 1, seconds: 59 };
            } else {
              clearInterval(timer);
              return { minutes: 0, seconds: 0 };
            }
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [meetings]);

  // Helper function to get ordinal suffix for numbers
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  };

  // Sidebar navigation component
  const renderSidebar = () => {
    return (
      <Box
        sx={{
          width: 250,
          height: '100%',
          bgcolor: '#1a2a5e',
          color: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Student Dashboard
          </Typography>
        </Box>
        <List sx={{ flexGrow: 1 }}>
          <ListItem 
            button 
            onClick={() => setActiveView('profile')}
            selected={activeView === 'profile'}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            <ListItemIcon>
              <Person sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{ fontWeight: activeView === 'profile' ? 'medium' : 'normal' }}
            />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveView('feedback')}
            selected={activeView === 'feedback'}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            <ListItemIcon>
              <Feedback sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Submit Feedback" 
              primaryTypographyProps={{ fontWeight: activeView === 'feedback' ? 'medium' : 'normal' }}
            />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveView('schedule')}
            selected={activeView === 'schedule'}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            <ListItemIcon>
              <Schedule sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText 
              primary="View Meeting Schedule" 
              primaryTypographyProps={{ fontWeight: activeView === 'schedule' ? 'medium' : 'normal' }}
            />
          </ListItem>
          <ListItem 
            button 
            onClick={() => setActiveView('minutes')}
            selected={activeView === 'minutes'}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            <ListItemIcon>
              <Description sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText 
              primary="View Meeting Minutes" 
              primaryTypographyProps={{ fontWeight: activeView === 'minutes' ? 'medium' : 'normal' }}
            />
          </ListItem>
        </List>
      </Box>
    );
  };

  // Profile view component
  const renderProfileView = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Student Profile</Typography>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Name</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.fullName || 'John Doe'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>SIN Number</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.studentId || 'S12345789'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Department</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.department?.name || 'Computer Science'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Year</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.year ? `${userProfile.year}${getOrdinalSuffix(userProfile.year)} Year` : 'Third Year'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email ID</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.email || 'john.doe@university.edu'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Submit Feedback</Typography>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your feedback here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#1a2a5e', 
              '&:hover': { bgcolor: '#0f1a3e' },
              py: 1.5
            }}
          >
            Submit Feedback
          </Button>
        </Paper>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Schedule</Typography>
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Present Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.currentMeetings && meetings.currentMeetings.length > 0 ? (
              meetings.currentMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.currentMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '305'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No current meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Upcoming Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Upcoming Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.futureMeetings && meetings.futureMeetings.length > 0 ? (
              meetings.futureMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.futureMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '402'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Timer</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Next Meeting: {nextMeeting ? 
                `${nextMeeting.meetingDate} - ${nextMeeting.startTime}` : 
                'January 25, 2024 - 09:00 AM'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 1
            }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {countdownTime.minutes.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                minutes
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              :
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {countdownTime.seconds.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                seconds
              </Typography>
            </Box>
          </Box>
        </Paper>
        </Box>
      </Box>
    );
  };

  // Feedback view component
  const renderFeedbackView = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Submit Feedback</Typography>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your feedback here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#1a2a5e', 
              '&:hover': { bgcolor: '#0f1a3e' },
              py: 1.5
            }}
          >
            Submit Feedback
          </Button>
        </Paper>
      </Box>
    );
  };

  // Schedule view component
  const renderScheduleView = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Meeting Schedule</Typography>
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Present Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.currentMeetings && meetings.currentMeetings.length > 0 ? (
              meetings.currentMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.currentMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '305'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No current meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Upcoming Meetings */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Upcoming Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.futureMeetings && meetings.futureMeetings.length > 0 ? (
              meetings.futureMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.futureMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '402'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Timer</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Next Meeting: {nextMeeting ? 
                `${nextMeeting.meetingDate} - ${nextMeeting.startTime}` : 
                'January 25, 2024 - 09:00 AM'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.minutes.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  minutes
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                :
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.seconds.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  seconds
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  // Schedule view component (already defined above)
  // Removing duplicate declaration
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Present Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.currentMeetings && meetings.currentMeetings.length > 0 ? (
              meetings.currentMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.currentMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '305'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No current meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Upcoming Meetings */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Upcoming Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.futureMeetings && meetings.futureMeetings.length > 0 ? (
              meetings.futureMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.futureMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '402'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Timer</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Next Meeting: {nextMeeting ? 
                `${nextMeeting.meetingDate} - ${nextMeeting.startTime}` : 
                'January 25, 2024 - 09:00 AM'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {countdownTime.minutes.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                minutes
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              :
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {countdownTime.seconds.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                seconds
              </Typography>
            </Box>
          </Box>
        </Paper>
        </Box>
      </Box>
    );
  };

  // Schedule view component
  const renderScheduleView = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Meeting Schedule</Typography>
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Present Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.currentMeetings && meetings.currentMeetings.length > 0 ? (
              meetings.currentMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.currentMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '305'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No current meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Upcoming Meetings */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Upcoming Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.futureMeetings && meetings.futureMeetings.length > 0 ? (
              meetings.futureMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.futureMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '402'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Timer</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Next Meeting: {nextMeeting ? 
                `${nextMeeting.meetingDate} - ${nextMeeting.startTime}` : 
                'January 25, 2024 - 09:00 AM'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.minutes.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  minutes
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                :
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.seconds.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  seconds
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  // Schedule view component
  const renderScheduleView = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Meeting Schedule</Typography>
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Present Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.currentMeetings && meetings.currentMeetings.length > 0 ? (
              meetings.currentMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.currentMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '305'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No current meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Upcoming Meetings */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Upcoming Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.futureMeetings && meetings.futureMeetings.length > 0 ? (
              meetings.futureMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.futureMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '402'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Timer</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Next Meeting: {nextMeeting ? 
                `${nextMeeting.meetingDate} - ${nextMeeting.startTime}` : 
                'January 25, 2024 - 09:00 AM'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.minutes.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  minutes
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                :
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.seconds.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  seconds
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  // Schedule view component
  const renderScheduleView = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Meeting Schedule</Typography>
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Present Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.currentMeetings && meetings.currentMeetings.length > 0 ? (
              meetings.currentMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.currentMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '305'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No current meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Upcoming Meetings */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Upcoming Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.futureMeetings && meetings.futureMeetings.length > 0 ? (
              meetings.futureMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.futureMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '402'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Meeting Timer</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Next Meeting: {nextMeeting ? 
                `${nextMeeting.meetingDate} - ${nextMeeting.startTime}` : 
                'January 25, 2024 - 09:00 AM'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.minutes.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  minutes
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                :
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {countdownTime.seconds.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  seconds
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  // Schedule view component (already defined above)
  // Removing duplicate declaration
        
        {/* Past Meetings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Past Meeting Schedule</Typography>
          <Paper elevation={1} sx={{ borderRadius: 1 }}>
            {meetings.pastMeetings && meetings.pastMeetings.length > 0 ? (
              meetings.pastMeetings.map((meeting, index) => (
                <Box key={meeting.id || index} sx={{ 
                  p: 2, 
                  borderBottom: index < meetings.pastMeetings.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.meetingDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.startTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.title || 'Meeting'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Room {meeting.location || '101'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No past meetings
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Present Meetings */}
        <Box sx={{ mb: 3 }}>