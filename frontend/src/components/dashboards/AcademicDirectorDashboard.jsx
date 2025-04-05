import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';

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
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Please log in to continue',
          severity: 'error'
        });
        // Removed navigation to login page
        return;
      }

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

      // Get user role from localStorage instead of verifying with API
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'ACADEMIC_DIRECTOR') {
        setSnackbar({
          open: true,
          message: 'Only academic directors can send questions',
          severity: 'error'
        });
        return;
      }

      // Create an array of promises for each question
      const questionPromises = questions.map(question => {
        // Ensure token is properly formatted
        if (!token.trim()) {
          throw new Error('Invalid authentication token');
        }

        // Prepare request payload
        const payload = {
          text: question.question,
          departmentId: parseInt(department),
          role: targetRole,
          year: targetRole === 'student' ? parseInt(year) : 1 // Always include year, default to 1 if not student
        };
        
        // Only include staffId if role is staff and staff value exists
        if (targetRole === 'staff' && staff) {
          payload.staffId = parseInt(staff);
        }

        // Use axios instead of fetch for consistency
        return axios.post('http://localhost:8080/api/questions', payload, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token.trim()
          }
        });
      });

      // Send all questions
      await Promise.all(questionPromises);

      // Clear the questions after successful sending
      setQuestions([]);
      setNewQuestion('');

      // Show success message
      setSnackbar({
        open: true,
        message: 'Questions sent successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setTargetRole('student');
      setDepartment('');
      setYear('');
      setStaff('');
    } catch (error) {
      console.error('Error sending feedback:', error);
      
      // Handle axios error responses
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          // Authentication error - don't redirect to login
          localStorage.clear();
          delete axios.defaults.headers.common['Authorization'];
          
          setSnackbar({
            open: true,
            message: 'Your session has expired. Please log in again later.',
            severity: 'error'
          });
          
          // Don't navigate to login page
        } else if (error.response.status === 403) {
          // Permission error
          setSnackbar({
            open: true,
            message: 'You do not have permission to perform this action. Please check your role permissions.',
            severity: 'error'
          });
        } else {
          // Other server errors
          setSnackbar({
            open: true,
            message: error.response.data?.message || 'Failed to send questions. Please try again.',
            severity: 'error'
          });
        }
      } else if (error.request) {
        // The request was made but no response was received
        setSnackbar({
          open: true,
          message: 'No response from server. Please check your connection and try again.',
          severity: 'error'
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        setSnackbar({
          open: true,
          message: error.message || 'Failed to send questions. Please try again.',
          severity: 'error'
        });
      }
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
        // Removed navigation to login page
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
          // Removed navigation to login page
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', bgcolor: '#f0f2f5', overflow: 'auto' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a237e', boxShadow: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Academic Director Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ fontWeight: 'medium' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar */}
        <Box sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          display: { xs: 'none', md: 'block' }
        }}>
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'transparent',
              borderRadius: 2
            }}>
              <Avatar sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: theme.palette.primary.main,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.08)' }
              }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Academic Director
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Engineering
              </Typography>
            </Paper>
          </Box>
          <Divider sx={{ mx: 2, mb: 2 }} />
          <List sx={{ px: 2 }}>
            {[
              { icon: <QuestionAnswerIcon />, text: 'Send Feedback', tab: 0 },
              { icon: <VisibilityIcon />, text: 'View Feedback', tab: 1 },
              { icon: <AssessmentIcon />, text: 'Analysis', tab: 2 },
              { icon: <DescriptionIcon />, text: 'Reports', tab: 3 }
            ].map((item, index) => (
              <ListItem
                component="div"
                key={index}
                selected={activeTab === item.tab}
                onClick={() => setActiveTab(item.tab)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.common.white,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    '& .MuiListItemIcon-root': { color: theme.palette.common.white }
                  },
                  '&:hover': { bgcolor: theme.palette.action.hover, transform: 'translateX(4px)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.tab ? 'inherit' : theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Mobile navigation */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%', mb: 2, mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                py: 1,
                borderRadius: 2,
                mx: 0.5,
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
              }
            }}
          >
            <Tab icon={<QuestionAnswerIcon />} label="Send" />
            <Tab icon={<VisibilityIcon />} label="View" />
            <Tab icon={<AssessmentIcon />} label="Analysis" />
            <Tab icon={<DescriptionIcon />} label="Reports" />
          </Tabs>
        </Box>
        
        {/* Main content */}
        <Box sx={{ flexGrow: 1, p: 3, width: { xs: '100%', md: 'calc(100% - 240px)' } }}>
          {activeTab === 0 && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                Send Feedback Questions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Target Role</InputLabel>
                    <Select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                      <MenuItem value="1">Computer Science</MenuItem>
                      <MenuItem value="2">Information Technology</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {targetRole === 'student' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select value={year} onChange={(e) => setYear(e.target.value)}>
                        <MenuItem value="1">1st Year</MenuItem>
                        <MenuItem value="2">2nd Year</MenuItem>
                        <MenuItem value="3">3rd Year</MenuItem>
                        <MenuItem value="4">4th Year</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {targetRole === 'staff' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Staff</InputLabel>
                      <Select value={staff} onChange={(e) => setStaff(e.target.value)}>
                        <MenuItem value="1">Staff 1</MenuItem>
                        <MenuItem value="2">Staff 2</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="New Question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={editQuestionId ? handleUpdateQuestion : handleAddQuestion}
                  startIcon={editQuestionId ? <EditIcon /> : <SendIcon />}
                  sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                >
                  {editQuestionId ? 'Update Question' : 'Add Question'}
                </Button>
              </Box>

              <List sx={{ mt: 3 }}>
                {questions.map((q) => (
                  <ListItem
                    key={q.id}
                    secondaryAction={
                      <Box>
                        <IconButton onClick={() => handleEditQuestion(q.id)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteQuestion(q.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                    sx={{ bgcolor: '#f9f9f9', borderRadius: 1, mb: 1 }}
                  >
                    <ListItemText primary={q.question} />
                  </ListItem>
                ))}
              </List>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSendFeedback}
                disabled={!department || questions.length === 0}
                sx={{ mt: 3, px: 4, py: 1.2, fontWeight: 500 }}
              >
                Send Feedback
              </Button>
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                Current Feedback Questions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Role</InputLabel>
                    <Select value={viewRole} onChange={(e) => setViewRole(e.target.value)}>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <List sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 2 }}>
                    {currentFeedbacks.map((feedback, index) => (
                      <ListItem key={index} sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                        <ListItemText
                          primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{feedback.question}</Typography>}
                          secondary={`${feedback.department} - ${feedback.role === 'student' ? `Year ${feedback.year}` : feedback.staff}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                Feedback Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Total Submissions</Typography>
                      <Typography variant="h3" color="primary">{feedbackStats.totalSubmissions}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Overall Score</Typography>
                      <Typography variant="h3" color="primary">{feedbackStats.overallScore}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Department-wise Scores</Typography>
                      <List>
                        {feedbackStats.departmentWiseScores.map((item, index) => (
                          <ListItem key={index} sx={{ borderBottom: '1px solid #eee' }}>
                            <ListItemText 
                              primary={`${item.department} - Year ${item.year}`} 
                              secondary={`Score: ${item.score}%`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 3 && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                Download Reports
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadReport}
                    sx={{ px: 4, py: 1.5, fontWeight: 500, bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                  >
                    Download Feedback Report
                  </Button>
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