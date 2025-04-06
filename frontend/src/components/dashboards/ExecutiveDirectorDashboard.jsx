import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Snackbar,
  Alert,
  Divider,
  LinearProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
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
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';

const ExecutiveDirectorDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    name: 'Dr. Sarah Johnson',
    position: 'Executive Director',
    email: 'sarah.johnson@university.edu',
    department: 'University Administration'
  });
  const [meetings, setMeetings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Mock student question performance data
  const [studentQuestionPerformance, setStudentQuestionPerformance] = useState([
    { id: 1, question: 'Question 1', score: 92, color: '#1a73e8' },
    { id: 2, question: 'Question 2', score: 72, color: '#00c853' },
    { id: 3, question: 'Question 3', score: 54, color: '#ffca28' },
    { id: 4, question: 'Question 4', score: 63, color: '#f44336' },
  ]);

  // Mock staff question performance data
  const [staffQuestionPerformance, setStaffQuestionPerformance] = useState([
    { id: 1, question: 'Question 1', score: 85, color: '#1a73e8' },
    { id: 2, question: 'Question 2', score: 65, color: '#00c853' },
    { id: 3, question: 'Question 3', score: 70, color: '#ffca28' },
    { id: 4, question: 'Question 4', score: 50, color: '#f44336' },
  ]);

  // Add performance summary stats
  const [performanceSummary, setPerformanceSummary] = useState({
    studentOverall: 78,
    staffOverall: 65
  });

  // Define sidebar tabs
  const tabs = [
    { id: 'profile', label: "Profile", icon: <PersonIcon /> },
    { id: 'meetings', label: "Meetings", icon: <EventIcon /> },
    { id: 'analytics', label: "Analytics", icon: <BarChartIcon /> },
    { id: 'reports', label: "Reports", icon: <AssessmentIcon /> }
  ];

  // Check authentication and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'EXECUTIVE_DIRECTOR' && userRole !== 'ROLE_EXECUTIVE_DIRECTOR') {
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

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/reports/download', {
        headers: {
          'x-access-token': localStorage.getItem('token')
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedback-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to download report. Please try again.',
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

  // Render student performance chart
  const renderStudentPerformanceChart = () => (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Student Performance %</Typography>
      
      <Box sx={{ height: '400px', bgcolor: '#f5f5f7', p: 3, borderRadius: 1 }}>
        <Grid container spacing={2}>
          {/* Y-axis labels */}
          <Grid item xs={1}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography>100</Typography>
              <Typography>80</Typography>
              <Typography>60</Typography>
              <Typography>40</Typography>
              <Typography>20</Typography>
              <Typography>0</Typography>
            </Box>
          </Grid>
          
          {/* Chart bars */}
          <Grid item xs={11}>
            <Box sx={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
              {studentQuestionPerformance.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                  <Box 
                    sx={{ 
                      width: '80%', 
                      height: `${item.score * 3}px`, 
                      bgcolor: item.color,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }} 
                  />
                  <Typography sx={{ mt: 1 }}>{item.question}</Typography>
                </Box>
              ))}
            </Box>
            
            {/* X-axis line */}
            <Box sx={{ 
              height: '1px', 
              bgcolor: '#ddd', 
              width: '100%', 
              mt: 1 
            }} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  // Render staff performance chart
  const renderStaffPerformanceChart = () => (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Staff Performance %</Typography>
      
      <Box sx={{ height: '400px', bgcolor: '#f5f5f7', p: 3, borderRadius: 1 }}>
        <Grid container spacing={2}>
          {/* Y-axis labels */}
          <Grid item xs={1}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography>100</Typography>
              <Typography>80</Typography>
              <Typography>60</Typography>
              <Typography>40</Typography>
              <Typography>20</Typography>
              <Typography>0</Typography>
            </Box>
          </Grid>
          
          {/* Chart bars */}
          <Grid item xs={11}>
            <Box sx={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
              {staffQuestionPerformance.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                  <Box 
                    sx={{ 
                      width: '80%', 
                      height: `${item.score * 3}px`, 
                      bgcolor: item.color,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }} 
                  />
                  <Typography sx={{ mt: 1 }}>{item.question}</Typography>
                </Box>
              ))}
            </Box>
            
            {/* X-axis line */}
            <Box sx={{ 
              height: '1px', 
              bgcolor: '#ddd', 
              width: '100%', 
              mt: 1 
            }} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  // Render profile section
  const renderProfile = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      position: 'relative'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Executive Director Profile</Typography>
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        mb: 0
      }}>
        <Avatar sx={{ width: 76, height: 76, bgcolor: '#1A2137', mr: 4 }}>
          {userProfile.name ? userProfile.name.charAt(0) : 'S'}
        </Avatar>
        
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Name</Typography>
              <Typography variant="body1">{userProfile.name}</Typography>
            </Box>
            
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Position</Typography>
              <Typography variant="body1">{userProfile.position}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Email</Typography>
              <Typography variant="body1">{userProfile.email}</Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Department</Typography>
              <Typography variant="body1">{userProfile.department}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  // Render dashboard overview
  const renderDashboard = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Meetings</Typography>
              <Typography variant="h4" sx={{ color: '#1A2137' }}>{meetings.length}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Departments</Typography>
              <Typography variant="h4" sx={{ color: '#1A2137' }}>{departments.length}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Active in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
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
  );

  // Render meetings section
  const renderMeetings = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      border: '1px dashed #ccc'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Meeting Schedule</Typography>
      
      {meetings.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
          No meetings scheduled yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {meetings.map(meeting => (
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
                      {`Date: ${meeting.date}`}
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
                      color: '#ff6d00',
                      bgcolor: '#fff3e0',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1
                    }}>
                      {`Role: ${meeting.role === 'student' ? 'Student' : 'Staff'}`}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#6a1b9a',
                      bgcolor: '#f3e5f5',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1
                    }}>
                      {`Department: ${meeting.department === '1' ? 'Computer Science' : 
                                     meeting.department === '2' ? 'Information Technology' : 
                                     meeting.department}`}
                    </Typography>
                    
                    {meeting.role === 'student' && (
                      <Typography variant="body2" sx={{ 
                        color: '#00695c',
                        bgcolor: '#e0f2f1',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Year: ${meeting.year}`}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
                </Grid>
      )}
    </Paper>
  );

  // Render reports section
  const renderReports = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Reports</Typography>
      
      <Grid container spacing={3}>
                <Grid item xs={12}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Comprehensive Feedback Report</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download a complete report with feedback data from all departments and meetings
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
        
                <Grid item xs={12}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Department-wise Report</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download feedback reports filtered by department
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Department</InputLabel>
                <Select
                  label="Select Department"
                  defaultValue=""
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
                  <Button
                    variant="contained"
                startIcon={<DownloadIcon />}
                sx={{ 
                  bgcolor: '#1A2137', 
                  '&:hover': { bgcolor: '#2A3147' }
                }}
              >
                Download Department Report
                  </Button>
            </CardContent>
          </Card>
                </Grid>
              </Grid>
            </Paper>
  );

  // Render analytics section with performance charts
  const renderAnalytics = () => (
    <Paper sx={{ p: 4, borderRadius: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Performance Analytics</Typography>
      
      <Grid container spacing={3}>
        {/* Student Performance Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>Student Performance</Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Student Overall Performance
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, color: '#1A2137' }}>
                {performanceSummary.studentOverall}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          {renderStudentPerformanceChart()}
        </Grid>
        
        {/* Staff Performance Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>Staff Performance</Typography>
          </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Staff Overall Performance
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, color: '#1A2137' }}>
                {performanceSummary.staffOverall}%
              </Typography>
            </CardContent>
          </Card>
          </Grid>
        
        <Grid item xs={12}>
          {renderStaffPerformanceChart()}
        </Grid>
      </Grid>
    </Paper>
  );

  // Sidebar component
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
          Executive Director
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {tabs.map(tab => (
          <ListItem
            key={tab.id}
            button 
            onClick={() => setActiveSection(tab.id)}
            sx={{
              py: 2, 
              pl: 3,
              bgcolor: activeSection === tab.id ? '#2A3147' : 'transparent',
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
          {activeSection === 'meetings' && renderMeetings()}
          {activeSection === 'reports' && renderReports()}
          {activeSection === 'analytics' && renderAnalytics()}
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

export default ExecutiveDirectorDashboard;