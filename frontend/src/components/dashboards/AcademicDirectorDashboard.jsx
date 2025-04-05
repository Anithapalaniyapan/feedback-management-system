import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import SendIcon from '@mui/icons-material/Send';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import MeetingManagement from '../student/dashboard/MeetingManagement';

const AcademicDirectorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [targetRole, setTargetRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [staff, setStaff] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [viewRole, setViewRole] = useState('student');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    department: '',
    year: ''
  });

  const [currentFeedbacks, setCurrentFeedbacks] = useState([
    { question: 'How satisfied are you with the course content?', department: 'Computer Science', role: 'student', year: '3' },
    { question: 'Rate the teaching effectiveness', department: 'Information Technology', role: 'staff', staff: 'Staff 1' }
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const [feedbackStats, setFeedbackStats] = useState({
    totalSubmissions: 10,
    overallScore: 85,
    departmentWiseScores: [
      { department: 'Computer Science', year: '3', score: 88 },
      { department: 'Information Technology', year: '2', score: 82 }
    ]
  });

  // Check authentication and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'ACADEMIC_DIRECTOR') {
      setSnackbar({
        open: true,
        message: 'You do not have permission to access this dashboard',
        severity: 'error'
      });
      navigate('/login');
    }
  }, [navigate]);

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
        setMeetings(response.data);
      } catch (error) {
        console.error('Error in fetchMeetings:', error);
        setError(error.message);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to load meetings. Please try again later.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/departments', {
          headers: {
            'x-access-token': localStorage.getItem('token')
          }
        });
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to load departments',
          severity: 'error'
        });
      }
    };

    fetchDepartments();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setQuestions([]);
    setNewQuestion('');
    setEditQuestionId(null);
    setDepartment('');
    setYear('');
    setStaff('');
  };

  const handleAddQuestion = () => {
    // Check basic required fields
    if (!targetRole || !department || !newQuestion.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Role-specific validation
    if (targetRole === 'student' && !year) {
      setSnackbar({
        open: true,
        message: 'Please select a year for student feedback',
        severity: 'error'
      });
      return;
    }
    
    if (targetRole === 'staff' && !staff) {
      setSnackbar({
        open: true,
        message: 'Please select a staff member for staff feedback',
        severity: 'error'
      });
      return;
    }

    if (newQuestion.trim()) {
      setQuestions([...questions, { id: questions.length + 1, question: newQuestion }]);
      setNewQuestion('');
      setSnackbar({
        open: true,
        message: 'Question added successfully',
        severity: 'success'
      });
    }
  };

  const handleEditQuestion = (id) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      setNewQuestion(question.question);
      setEditQuestionId(id);
    }
  };

  const handleUpdateQuestion = () => {
    if (newQuestion.trim() && editQuestionId) {
      setQuestions(questions.map(q =>
        q.id === editQuestionId ? { ...q, question: newQuestion } : q
      ));
      setNewQuestion('');
      setEditQuestionId(null);
    }
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSendFeedback = async () => {
    try {
      // Check if there are any questions to send
      if (questions.length === 0) {
        setSnackbar({ open: true, message: 'Please add at least one question', severity: 'error' });
        return;
      }

      // Validate required fields based on target role
      if (!department) {
        setSnackbar({ open: true, message: 'Please select a department', severity: 'error' });
        return;
      }
      
      if (targetRole === 'student' && !year) {
        setSnackbar({ open: true, message: 'Please select a year for student feedback', severity: 'error' });
        return;
      }
      
      if (targetRole === 'staff' && !staff) {
        setSnackbar({ open: true, message: 'Please select a staff member', severity: 'error' });
        return;
      }

      // Create questions
      for (const question of questions) {
        await axios.post('http://localhost:8080/api/questions', {
          text: question.question,
          departmentId: parseInt(department),
          role: targetRole,
          year: targetRole === 'student' ? parseInt(year) : null,
          staffId: targetRole === 'staff' ? parseInt(staff) : null
        }, {
          headers: {
            'x-access-token': localStorage.getItem('token')
          }
        });
      }

      setSnackbar({
        open: true,
        message: 'Questions sent successfully',
        severity: 'success'
      });

      // Clear the form
      setQuestions([]);
      setNewQuestion('');
      setDepartment('');
      setYear('');
      setStaff('');
    } catch (error) {
      console.error('Error sending questions:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to send questions. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Please log in to continue',
          severity: 'error'
        });
        return;
      }

      // Get user role from localStorage
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'ACADEMIC_DIRECTOR') {
        setSnackbar({
          open: true,
          message: 'Only academic directors can download reports',
          severity: 'error'
        });
        return;
      }

      // Set up the request with proper authorization
      const response = await fetch('http://localhost:8080/api/reports/download', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      });

      if (!response.ok) {
        // Handle error responses
        if (response.status === 401) {
          localStorage.clear();
          setSnackbar({
            open: true,
            message: 'Your session has expired. Please log in again later.',
            severity: 'error'
          });
          return;
        } else if (response.status === 403) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to download reports. Please check your role permissions.',
            severity: 'error'
          });
          return;
        }
        
        throw new Error('Failed to download report');
      }

      // Handle successful response - typically a file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feedback-report.pdf'; // Or get filename from Content-Disposition header
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to download report. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleAddMeeting = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/meetings', newMeeting, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      });
      setMeetings([...meetings, response.data]);
      setNewMeeting({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        department: '',
        year: ''
      });
      setSnackbar({
        open: true,
        message: 'Meeting added successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add meeting',
        severity: 'error'
      });
    }
  };

  const renderMeetingManagement = () => (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
        Manage Meetings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Meeting
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meeting Title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newMeeting.startTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newMeeting.endTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newMeeting.department}
                  onChange={(e) => setNewMeeting({ ...newMeeting, department: e.target.value })}
                >
                  <MenuItem value="1">Computer Science</MenuItem>
                  <MenuItem value="2">Information Technology</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={newMeeting.year}
                  onChange={(e) => setNewMeeting({ ...newMeeting, year: e.target.value })}
                >
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            onClick={handleAddMeeting}
            sx={{ mt: 2 }}
          >
            Add Meeting
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Upcoming Meetings
          </Typography>
          <List>
            {meetings.map((meeting) => (
              <ListItem key={meeting.id}>
                <ListItemText
                  primary={meeting.title}
                  secondary={`${meeting.date} | ${meeting.startTime} - ${meeting.endTime} | ${meeting.location}`}
                />
              </ListItem>
            ))}
          </List>
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
            Academic Director
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          <ListItem 
            button 
            onClick={() => setActiveTab(0)}
            sx={{ 
              py: 2, 
              pl: 3,
              bgcolor: activeTab === 0 ? '#2A3147' : 'transparent',
              '&:hover': { bgcolor: '#2A3147' }
            }}
          >
            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" sx={{ color: '#FFFFFF' }} />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => setActiveTab(1)}
            sx={{ 
              py: 2, 
              pl: 3,
              bgcolor: activeTab === 1 ? '#2A3147' : 'transparent',
              '&:hover': { bgcolor: '#2A3147' }
            }}
          >
            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
              <QuestionAnswerIcon />
            </ListItemIcon>
            <ListItemText primary="Manage Questions" sx={{ color: '#FFFFFF' }} />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => setActiveTab(2)}
            sx={{ 
              py: 2, 
              pl: 3,
              bgcolor: activeTab === 2 ? '#2A3147' : 'transparent',
              '&:hover': { bgcolor: '#2A3147' }
            }}
          >
            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Manage Meetings" sx={{ color: '#FFFFFF' }} />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => setActiveTab(3)}
            sx={{ 
              py: 2, 
              pl: 3,
              bgcolor: activeTab === 3 ? '#2A3147' : 'transparent',
              '&:hover': { bgcolor: '#2A3147' }
            }}
          >
            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 30 }}>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="View Reports" sx={{ color: '#FFFFFF' }} />
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
        <Box sx={{ width: '600px', mt: 2, mb: 2 }}>
          {/* Dashboard Tab */}
          {activeTab === 0 && (
            <Paper sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Dashboard Overview</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Feedback Statistics</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>
                          Total Submissions
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#1A2137' }}>
                          {feedbackStats.totalSubmissions}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>
                          Overall Score
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#1A2137' }}>
                          {feedbackStats.overallScore}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {feedbackStats.departmentWiseScores.map((dept, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {dept.department}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Year {dept.year}
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 1, color: '#1A2137' }}>
                          {dept.score}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadReport}
                      sx={{ 
                        bgcolor: '#1A2137', 
                        '&:hover': { bgcolor: '#2A3147' },
                        fontWeight: 'medium',
                        px: 3,
                        py: 1
                      }}
                    >
                      Download Complete Report
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {/* Manage Questions Tab */}
          {activeTab === 1 && (
            <Paper sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Manage Feedback Questions</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Target Role</InputLabel>
                    <Select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      label="Target Role"
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="Computer Science">Computer Science</MenuItem>
                      <MenuItem value="Information Technology">Information Technology</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {targetRole === 'student' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        label="Year"
                      >
                        <MenuItem value="1">Year 1</MenuItem>
                        <MenuItem value="2">Year 2</MenuItem>
                        <MenuItem value="3">Year 3</MenuItem>
                        <MenuItem value="4">Year 4</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {targetRole === 'staff' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Staff Member</InputLabel>
                      <Select
                        value={staff}
                        onChange={(e) => setStaff(e.target.value)}
                        label="Staff Member"
                      >
                        <MenuItem value="Staff 1">Staff 1</MenuItem>
                        <MenuItem value="Staff 2">Staff 2</MenuItem>
                        <MenuItem value="Staff 3">Staff 3</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Add Question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {editQuestionId ? (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleUpdateQuestion}
                        sx={{ 
                          bgcolor: '#1A2137', 
                          '&:hover': { bgcolor: '#2A3147' }
                        }}
                      >
                        Update Question
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleAddQuestion}
                        sx={{ 
                          bgcolor: '#1A2137', 
                          '&:hover': { bgcolor: '#2A3147' }
                        }}
                      >
                        Add Question
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>Current Questions</Typography>
              
              {questions.length > 0 ? (
                <List>
                  {questions.map((q) => (
                    <ListItem key={q.id} sx={{ bgcolor: '#f8f9fa', mb: 1, borderRadius: 0 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{q.question}</Typography>
                      </Box>
                      <IconButton 
                        onClick={() => handleEditQuestion(q.id)}
                        sx={{ color: '#1A2137' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteQuestion(q.id)}
                        sx={{ color: '#1A2137' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                  No questions added yet.
                </Typography>
              )}
              
              {questions.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendFeedback}
                    sx={{ 
                      bgcolor: '#1A2137', 
                      '&:hover': { bgcolor: '#2A3147' }
                    }}
                  >
                    Send Feedback Questions
                  </Button>
                </Box>
              )}
            </Paper>
          )}
          
          {/* Manage Meetings Tab */}
          {activeTab === 2 && (
            <Paper sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Manage Meetings</Typography>
              {renderMeetingManagement()}
            </Paper>
          )}
          
          {/* View Reports Tab */}
          {activeTab === 3 && (
            <Paper sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>View Reports</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Typography variant="h6">Feedback Reports</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Download complete feedback reports
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadReport}
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
              </Grid>
            </Paper>
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

export default AcademicDirectorDashboard;