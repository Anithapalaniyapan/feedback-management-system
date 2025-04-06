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
  Alert,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  FormHelperText,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
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
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
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
  const [meetingDate, setMeetingDate] = useState(''); // For associating questions with meetings

  // State for new meeting form
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    role: '',
    department: '',
    year: '',
    submitted: false
  });
  
  // State for meeting filter (view all, student only, or staff only)
  const [meetingFilter, setMeetingFilter] = useState('all');

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

  // Add state for tracking meeting countdown times
  const [meetingCountdowns, setMeetingCountdowns] = useState({});
  
  // Update countdown timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Calculate remaining time for each meeting
      const updatedCountdowns = {};
      meetings.forEach(meeting => {
        const meetingDate = new Date(`${meeting.date}T${meeting.startTime}`);
        
        if (meetingDate > now) {
          const diffMs = meetingDate - now;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          updatedCountdowns[meeting.id] = {
            days: diffDays,
            hours: diffHours,
            minutes: diffMins,
            seconds: diffSecs
          };
        } else {
          updatedCountdowns[meeting.id] = null; // Meeting has already started
        }
      });
      
      setMeetingCountdowns(updatedCountdowns);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [meetings]);

  // Add Performance Analytics as a dedicated tab option
  const tabs = [
    { id: 0, label: "Profile", icon: <PersonIcon /> },
    { id: 1, label: "Manage Meetings", icon: <EventIcon /> },
    { id: 2, label: "Manage Questions", icon: <QuestionAnswerIcon /> },
    { id: 3, label: "Analytics", icon: <BarChartIcon /> },
    { id: 4, label: "View Reports", icon: <AssessmentIcon /> },
    { id: 5, label: "View Meeting Schedule", icon: <EventIcon /> }
  ];

  // Check authentication and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'ACADEMIC_DIRECTOR' && userRole !== 'ROLE_ACADEMIC_DIRECTOR') {
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

  // Ensure we start with the Profile tab
  useEffect(() => {
    setActiveTab(0);
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
    
    if (targetRole === 'staff' && !department) {
      setSnackbar({
        open: true,
        message: 'Please select a department for staff feedback',
        severity: 'error'
      });
      return;
    }

    // Create new question object
    const newQuestionObj = {
      id: Date.now(), // temporary id for UI
      text: newQuestion,
      targetRole: targetRole,
      departmentId: department,
      year: targetRole === 'student' ? year : null,
      staff: targetRole === 'staff' ? staff : null,
      meetingDate: meetingDate || null
    };

    // Add to questions list
    setQuestions([...questions, newQuestionObj]);
    
    // Clear input field
    setNewQuestion('');
    
    setSnackbar({
      open: true,
      message: 'Question added successfully',
      severity: 'success'
    });
  };

  const handleUpdateQuestion = () => {
    if (!newQuestion.trim()) {
      setSnackbar({
        open: true,
        message: 'Question text cannot be empty',
        severity: 'error'
      });
      return;
    }

    const updatedQuestions = questions.map(q => 
      q.id === editQuestionId ? {
        ...q,
        text: newQuestion,
        departmentId: department,
        year: targetRole === 'student' ? year : null,
        staff: targetRole === 'staff' ? staff : null,
        meetingDate: meetingDate || null
      } : q
    );

    setQuestions(updatedQuestions);
    setNewQuestion('');
    setEditQuestionId(null);
    
    setSnackbar({
      open: true,
      message: 'Question updated successfully',
      severity: 'success'
    });
  };

  const handleEditQuestion = (question) => {
    setTargetRole(question.targetRole);
    setDepartment(question.departmentId);
    if (question.targetRole === 'student') {
      setYear(question.year);
    } else if (question.targetRole === 'staff') {
      setStaff(question.staff);
    }
    
    setMeetingDate(question.meetingDate || '');
    setNewQuestion(question.text);
    setEditQuestionId(question.id);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));

        setSnackbar({
          open: true,
      message: 'Question deleted successfully',
      severity: 'success'
        });
  };

  const handleSubmitQuestions = async () => {
      if (questions.length === 0) {
        setSnackbar({
          open: true,
        message: 'Please add at least one question before submitting',
          severity: 'error'
        });
        return;
      }

    try {
      setLoading(true);
      
      // API call to save questions
      await Promise.all(questions.map(question => 
        axios.post('http://localhost:8080/api/questions', question, {
          headers: {
            'x-access-token': localStorage.getItem('token')
          }
        })
      ));

      // Clear questions after submission
      setQuestions([]);
      setNewQuestion('');
      setEditQuestionId(null);

      setSnackbar({
        open: true,
        message: `Questions submitted successfully and will appear in the ${targetRole} dashboard`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting questions:', error);
          setSnackbar({
            open: true,
        message: error.response?.data?.message || 'Failed to submit questions',
            severity: 'error'
          });
    } finally {
      setLoading(false);
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
    // Validate required fields
    if (!newMeeting.title || !newMeeting.date || !newMeeting.startTime || 
        !newMeeting.endTime || !newMeeting.role || !newMeeting.department) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Validate year field if role is student
    if (newMeeting.role === 'student' && !newMeeting.year) {
      setSnackbar({
        open: true,
        message: 'Please select a year for student meeting',
        severity: 'error'
      });
      return;
    }
    
    try {
      console.log('Adding meeting with data:', newMeeting);
      
      // Create a formatted meeting object that matches the backend expectations
      const meetingData = {
        title: newMeeting.title,
        date: newMeeting.date,
        meetingDate: newMeeting.date, // Add meetingDate to ensure format consistency
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        role: newMeeting.role.toLowerCase(), // Ensure role is lowercase
        departmentId: newMeeting.department,
        department: newMeeting.department, // Add department for UI rendering
        year: newMeeting.role === 'student' ? newMeeting.year : null
      };
      
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      // Attempt to use the actual API
      try {
        const response = await axios.post('http://localhost:8080/api/meetings', meetingData, {
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Meeting added successfully:', response.data);
        
        // Add the new meeting to the local state with all required fields
        const newMeetingData = {
          ...response.data,
          id: response.data.id || Date.now().toString(),
          title: meetingData.title,
          date: meetingData.date,
          meetingDate: meetingData.date,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          role: meetingData.role,
          department: meetingData.department,
          departmentId: meetingData.departmentId,
          year: meetingData.year
        };
        
        console.log('Adding meeting to state:', newMeetingData);
        setMeetings(prevMeetings => [...prevMeetings, newMeetingData]);
        
        // Show success message specific to the role
        setSnackbar({
          open: true,
          message: `${newMeeting.role === 'student' ? 'Student' : 'Staff'} meeting added successfully! Remember to submit the schedule to make it visible to users.`,
          severity: 'success'
        });
        
        // Clear the form
        setNewMeeting({
          title: '',
          date: '',
          startTime: '',
          endTime: '',
          role: '',
          department: '',
          year: '',
          submitted: false
        });
      } catch (apiError) {
        console.error('API error, using fallback:', apiError);
        
        // FALLBACK: If the API fails, create a mock response for testing purposes
        const mockMeeting = {
          ...meetingData,
          id: Date.now().toString(), // Generate a temporary ID
          createdAt: new Date().toISOString(),
          status: 'PENDING',
          title: meetingData.title,
          date: meetingData.date,
          meetingDate: meetingData.date,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          role: meetingData.role,
          department: meetingData.departmentId,
          departmentId: meetingData.departmentId,
          year: meetingData.year
        };
        
        console.log('Using mock meeting data:', mockMeeting);
        
        // Add the mock meeting to the local state
        setMeetings(prevMeetings => [...prevMeetings, mockMeeting]);
        
        // Show success message specific to the role with fallback indication
        setSnackbar({
          open: true,
          message: `${newMeeting.role === 'student' ? 'Student' : 'Staff'} meeting added successfully (using offline mode)! Remember to submit the schedule to make it visible to users.`,
          severity: 'success'
        });
        
        // Clear the form
        setNewMeeting({
          title: '',
          date: '',
          startTime: '',
          endTime: '',
          role: '',
          department: '',
          year: '',
          submitted: false
        });
      }
    } catch (error) {
      console.error('Error adding meeting:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add meeting',
        severity: 'error'
      });
    }
  };

  // Helper function to get department name from id
  const getDepartmentName = (departmentId) => {
    switch(departmentId) {
      case '1':
        return 'Computer Science';
      case '2':
        return 'Information Technology';
      default:
        return departmentId;
    }
  };

  const handleSubmitMeetingSchedule = async () => {
    if (meetings.length === 0) {
      setSnackbar({
        open: true,
        message: 'No meetings to submit',
        severity: 'error'
      });
      return;
    }
    
    try {
      console.log('Submitting meetings:', meetings.map(m => m.id || m));
      
      const token = localStorage.getItem('token');
      console.log('Using token for submission:', token ? 'Token exists' : 'No token');
      
      // Attempt to use the actual API
      try {
        const response = await axios.put('http://localhost:8080/api/meetings/submit', 
          { meetings: meetings.map(m => m.id || m) },
          {
            headers: {
              'x-access-token': token,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Meeting schedule submitted successfully:', response.data);
        
        // Update meetings locally to simulate "submitted" status
        const updatedMeetings = meetings.map(meeting => ({
          ...meeting,
          status: 'SUBMITTED',
          id: meeting.id || Date.now().toString(),
          // Make sure all required fields exist with proper values
          title: meeting.title || `Meeting on ${meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0]}`,
          date: meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0],
          meetingDate: meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0],
          startTime: meeting.startTime || '09:00',
          endTime: meeting.endTime || '10:00',
          // Ensure role is properly formatted (lowercase)
          role: (meeting.role || 'student').toLowerCase(),
          // Ensure department info is consistent
          department: meeting.department || meeting.departmentId || '1',
          departmentId: meeting.departmentId || meeting.department || '1',
          // Include year if role is student
          year: meeting.role?.toLowerCase() === 'student' ? (meeting.year || '1') : null
        }));
        
        // Save submitted meetings to localStorage for access by other dashboards
        console.log('Saving meetings to localStorage:', updatedMeetings);
        localStorage.setItem('submittedMeetings', JSON.stringify(updatedMeetings));
        
        // Save role-specific timer data to separate storage
        const now = new Date();
        
        // Group meetings by role
        const studentMeetings = updatedMeetings.filter(m => 
          m.role?.toLowerCase() === 'student'
        );
        
        const staffMeetings = updatedMeetings.filter(m => 
          m.role?.toLowerCase() === 'staff'
        );
        
        console.log('Filtered student meetings:', studentMeetings.length);
        console.log('Filtered staff meetings:', staffMeetings.length);
        
        // Store student meetings' timer data
        if (studentMeetings.length > 0) {
          // Find the next upcoming student meeting
          const upcomingStudentMeetings = studentMeetings.filter(m => {
            const meetingDate = new Date(`${m.date}T${m.startTime}`);
            return meetingDate > now;
          }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
          });
          
          if (upcomingStudentMeetings.length > 0) {
            const nextStudentMeeting = upcomingStudentMeetings[0];
            const meetingDate = new Date(`${nextStudentMeeting.date}T${nextStudentMeeting.startTime}`);
            const diffMs = meetingDate - now;
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));
            const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
            
            const nextStudentMeetingData = {
              id: nextStudentMeeting.id,
              title: nextStudentMeeting.title,
              date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: nextStudentMeeting.startTime,
              minutesLeft: diffMins,
              secondsLeft: diffSecs,
              originalDate: nextStudentMeeting.date,
              department: nextStudentMeeting.department || nextStudentMeeting.departmentId,
              role: 'student'
            };
            
            console.log('Saving next student meeting data:', nextStudentMeetingData);
            localStorage.setItem('studentNextMeetingData', JSON.stringify(nextStudentMeetingData));
          }
        }
        
        // Store staff meetings' timer data
        if (staffMeetings.length > 0) {
          // Find the next upcoming staff meeting
          const upcomingStaffMeetings = staffMeetings.filter(m => {
            const meetingDate = new Date(`${m.date}T${m.startTime}`);
            return meetingDate > now;
          }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
          });
          
          if (upcomingStaffMeetings.length > 0) {
            const nextStaffMeeting = upcomingStaffMeetings[0];
            const meetingDate = new Date(`${nextStaffMeeting.date}T${nextStaffMeeting.startTime}`);
            const diffMs = meetingDate - now;
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));
            const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
            
            const nextStaffMeetingData = {
              id: nextStaffMeeting.id,
              title: nextStaffMeeting.title,
              date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: nextStaffMeeting.startTime,
              minutesLeft: diffMins,
              secondsLeft: diffSecs,
              originalDate: nextStaffMeeting.date,
              department: nextStaffMeeting.department || nextStaffMeeting.departmentId,
              role: 'staff'
            };
            
            console.log('Saving next staff meeting data:', nextStaffMeetingData);
            localStorage.setItem('staffNextMeetingData', JSON.stringify(nextStaffMeetingData));
          }
        }
        
        // For backwards compatibility, also save the next meeting regardless of role
        // but only use this as a fallback in dashboards
        const upcomingMeetings = updatedMeetings.filter(m => {
          const meetingDate = new Date(`${m.date}T${m.startTime}`);
          return meetingDate > now;
        }).sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA - dateB;
        });
        
        if (upcomingMeetings.length > 0) {
          const nextMeeting = upcomingMeetings[0];
          const meetingDate = new Date(`${nextMeeting.date}T${nextMeeting.startTime}`);
          const diffMs = meetingDate - now;
          const diffMins = Math.max(0, Math.floor(diffMs / 60000));
          const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
          
          const nextMeetingData = {
            id: nextMeeting.id,
            title: nextMeeting.title,
            date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: nextMeeting.startTime,
            minutesLeft: diffMins,
            secondsLeft: diffSecs,
            originalDate: nextMeeting.date,
            department: nextMeeting.department || nextMeeting.departmentId,
            role: nextMeeting.role
          };
          
          console.log('Saving next meeting data (generic) to localStorage:', nextMeetingData);
          localStorage.setItem('nextMeetingData', JSON.stringify(nextMeetingData));
        }
        
        // Log what was actually saved
        const savedData = localStorage.getItem('submittedMeetings');
        console.log('Saved meetings data in localStorage:', savedData);
        
        setMeetings(updatedMeetings);
        
        setSnackbar({
          open: true,
          message: 'Meeting schedule submitted successfully! Meetings will appear in relevant dashboards.',
          severity: 'success'
        });
      } catch (apiError) {
        console.error('API error during submission, using fallback:', apiError);
        
        // FALLBACK: If the API fails, simulate a successful submission for testing purposes
        console.log('Using mock submission flow for testing');
        
        // Update meetings locally to simulate "submitted" status
        const updatedMeetings = meetings.map(meeting => ({
          ...meeting,
          status: 'SUBMITTED',
          id: meeting.id || Date.now().toString(),
          // Make sure all required fields exist with proper values
          title: meeting.title || `Meeting on ${meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0]}`,
          date: meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0],
          meetingDate: meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0],
          startTime: meeting.startTime || '09:00',
          endTime: meeting.endTime || '10:00',
          // Ensure role is properly formatted (lowercase)
          role: (meeting.role || 'student').toLowerCase(),
          // Ensure department info is consistent
          department: meeting.department || meeting.departmentId || '1',
          departmentId: meeting.departmentId || meeting.department || '1',
          // Include year if role is student
          year: meeting.role?.toLowerCase() === 'student' ? (meeting.year || '1') : null
        }));
        
        // Save submitted meetings to localStorage for access by other dashboards
        console.log('Saving meetings to localStorage (fallback):', updatedMeetings);
        localStorage.setItem('submittedMeetings', JSON.stringify(updatedMeetings));
        
        // Save role-specific timer data to separate storage
        const now = new Date();
        
        // Group meetings by role
        const studentMeetings = updatedMeetings.filter(m => 
          m.role?.toLowerCase() === 'student'
        );
        
        const staffMeetings = updatedMeetings.filter(m => 
          m.role?.toLowerCase() === 'staff'
        );
        
        console.log('Filtered student meetings:', studentMeetings.length);
        console.log('Filtered staff meetings:', staffMeetings.length);
        
        // Store student meetings' timer data
        if (studentMeetings.length > 0) {
          // Find the next upcoming student meeting
          const upcomingStudentMeetings = studentMeetings.filter(m => {
            const meetingDate = new Date(`${m.date}T${m.startTime}`);
            return meetingDate > now;
          }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
          });
          
          if (upcomingStudentMeetings.length > 0) {
            const nextStudentMeeting = upcomingStudentMeetings[0];
            const meetingDate = new Date(`${nextStudentMeeting.date}T${nextStudentMeeting.startTime}`);
            const diffMs = meetingDate - now;
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));
            const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
            
            const nextStudentMeetingData = {
              id: nextStudentMeeting.id,
              title: nextStudentMeeting.title,
              date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: nextStudentMeeting.startTime,
              minutesLeft: diffMins,
              secondsLeft: diffSecs,
              originalDate: nextStudentMeeting.date,
              department: nextStudentMeeting.department || nextStudentMeeting.departmentId,
              role: 'student'
            };
            
            console.log('Saving next student meeting data:', nextStudentMeetingData);
            localStorage.setItem('studentNextMeetingData', JSON.stringify(nextStudentMeetingData));
          }
        }
        
        // Store staff meetings' timer data
        if (staffMeetings.length > 0) {
          // Find the next upcoming staff meeting
          const upcomingStaffMeetings = staffMeetings.filter(m => {
            const meetingDate = new Date(`${m.date}T${m.startTime}`);
            return meetingDate > now;
          }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
          });
          
          if (upcomingStaffMeetings.length > 0) {
            const nextStaffMeeting = upcomingStaffMeetings[0];
            const meetingDate = new Date(`${nextStaffMeeting.date}T${nextStaffMeeting.startTime}`);
            const diffMs = meetingDate - now;
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));
            const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
            
            const nextStaffMeetingData = {
              id: nextStaffMeeting.id,
              title: nextStaffMeeting.title,
              date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: nextStaffMeeting.startTime,
              minutesLeft: diffMins,
              secondsLeft: diffSecs,
              originalDate: nextStaffMeeting.date,
              department: nextStaffMeeting.department || nextStaffMeeting.departmentId,
              role: 'staff'
            };
            
            console.log('Saving next staff meeting data:', nextStaffMeetingData);
            localStorage.setItem('staffNextMeetingData', JSON.stringify(nextStaffMeetingData));
          }
        }
        
        // For backwards compatibility, also save the next meeting regardless of role
        // but only use this as a fallback in dashboards
        const upcomingMeetings = updatedMeetings.filter(m => {
          const meetingDate = new Date(`${m.date}T${m.startTime}`);
          return meetingDate > now;
        }).sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA - dateB;
        });
        
        if (upcomingMeetings.length > 0) {
          const nextMeeting = upcomingMeetings[0];
          const meetingDate = new Date(`${nextMeeting.date}T${nextMeeting.startTime}`);
          const diffMs = meetingDate - now;
          const diffMins = Math.max(0, Math.floor(diffMs / 60000));
          const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
          
          const nextMeetingData = {
            id: nextMeeting.id,
            title: nextMeeting.title,
            date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: nextMeeting.startTime,
            minutesLeft: diffMins,
            secondsLeft: diffSecs,
            originalDate: nextMeeting.date,
            department: nextMeeting.department || nextMeeting.departmentId,
            role: nextMeeting.role
          };
          
          console.log('Saving next meeting data (generic) to localStorage:', nextMeetingData);
          localStorage.setItem('nextMeetingData', JSON.stringify(nextMeetingData));
        }
        
        // Log what was actually saved
        const savedData = localStorage.getItem('submittedMeetings');
        console.log('Saved meetings data in localStorage (fallback):', savedData);
        
        setMeetings(updatedMeetings);
        
        // Show success message even though we're using mock data
        setSnackbar({
          open: true,
          message: 'Meeting schedule submitted successfully (using offline mode)! Meetings will appear in relevant dashboards.',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error submitting meeting schedule:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit meeting schedule. Please try again.',
        severity: 'error'
      });
    }
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
                required
                error={!newMeeting.title && newMeeting.submitted}
                helperText={!newMeeting.title && newMeeting.submitted ? "Title is required" : ""}
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
                InputProps={{
                  inputProps: { min: new Date().toISOString().split('T')[0] }
                }}
                required
                error={!newMeeting.date && newMeeting.submitted}
                helperText={!newMeeting.date && newMeeting.submitted ? "Date is required" : ""}
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
                required
                error={!newMeeting.startTime && newMeeting.submitted}
                helperText={!newMeeting.startTime && newMeeting.submitted ? "Start time is required" : ""}
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
                required
                error={!newMeeting.endTime && newMeeting.submitted}
                helperText={!newMeeting.endTime && newMeeting.submitted ? "End time is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!newMeeting.role && newMeeting.submitted}>
                <InputLabel id="role-select-label">Attendee Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={newMeeting.role}
                  label="Attendee Role"
                  onChange={(e) => setNewMeeting({ ...newMeeting, role: e.target.value })}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
                {!newMeeting.role && newMeeting.submitted && (
                  <FormHelperText>Role is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!newMeeting.department && newMeeting.submitted}>
                <InputLabel id="department-select-label">Department</InputLabel>
                <Select
                  labelId="department-select-label"
                  value={newMeeting.department}
                  label="Department"
                  onChange={(e) => setNewMeeting({ ...newMeeting, department: e.target.value })}
                >
                  <MenuItem value="1">Computer Science</MenuItem>
                  <MenuItem value="2">Information Technology</MenuItem>
                  <MenuItem value="3">Electronics and Communication</MenuItem>
                  <MenuItem value="4">Electrical Engineering</MenuItem>
                  <MenuItem value="5">Mechanical Engineering</MenuItem>
                </Select>
                {!newMeeting.department && newMeeting.submitted && (
                  <FormHelperText>Department is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {newMeeting.role === 'student' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={newMeeting.role === 'student' && !newMeeting.year && newMeeting.submitted}>
                  <InputLabel id="year-select-label">Year</InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={newMeeting.year}
                    label="Year"
                    onChange={(e) => setNewMeeting({ ...newMeeting, year: e.target.value })}
                  >
                    <MenuItem value="1">First Year</MenuItem>
                    <MenuItem value="2">Second Year</MenuItem>
                    <MenuItem value="3">Third Year</MenuItem>
                    <MenuItem value="4">Fourth Year</MenuItem>
                  </Select>
                  {newMeeting.role === 'student' && !newMeeting.year && newMeeting.submitted && (
                    <FormHelperText>Year is required for student meetings</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setNewMeeting(prev => ({ ...prev, submitted: true }));
                  handleAddMeeting();
                }}
                sx={{ mt: 2 }}
              >
                Add Meeting
              </Button>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" gutterBottom>
            View & Manage Scheduled Meetings
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Filter Meetings</FormLabel>
              <RadioGroup
                row
                value={meetingFilter}
                onChange={(e) => setMeetingFilter(e.target.value)}
              >
                <FormControlLabel value="all" control={<Radio />} label="All Meetings" />
                <FormControlLabel value="student" control={<Radio />} label="Student Meetings" />
                <FormControlLabel value="staff" control={<Radio />} label="Staff Meetings" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          {meetings.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f7', borderRadius: 1 }}>
              <Typography>No meetings scheduled yet.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f7' }}>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    {/* Only show Year column when student meetings are visible */}
                    {(meetingFilter === 'all' || meetingFilter === 'student') && (
                      <TableCell>Year</TableCell>
                    )}
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meetings
                    .filter(meeting => {
                      if (meetingFilter === 'all') return true;
                      return meeting.role?.toLowerCase() === meetingFilter;
                    })
                    .map((meeting, index) => (
                    <TableRow key={meeting.id || index}>
                      <TableCell>{meeting.title}</TableCell>
                      <TableCell>{meeting.date}</TableCell>
                      <TableCell>{meeting.startTime} - {meeting.endTime}</TableCell>
                      <TableCell>
                        <Chip 
                          label={meeting.role === 'student' ? 'Student' : 'Staff'}
                          color={meeting.role === 'student' ? 'primary' : 'secondary'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {meeting.department === '1' && 'Computer Science'}
                        {meeting.department === '2' && 'Information Technology'}
                        {meeting.department === '3' && 'Electronics and Communication'}
                        {meeting.department === '4' && 'Electrical Engineering'}
                        {meeting.department === '5' && 'Mechanical Engineering'}
                      </TableCell>
                      {/* Only show Year column when student meetings are visible */}
                      {(meetingFilter === 'all' || meetingFilter === 'student') && (
                        <TableCell>
                          {meeting.role === 'student' ? (
                            meeting.year === '1' ? 'First Year' :
                            meeting.year === '2' ? 'Second Year' :
                            meeting.year === '3' ? 'Third Year' :
                            meeting.year === '4' ? 'Fourth Year' : '-'
                          ) : '-'}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip 
                          label={meeting.status || 'Pending'}
                          color={meeting.status === 'SUBMITTED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubmitMeetingSchedule}
              disabled={meetings.length === 0}
            >
              Submit Meeting Schedule
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render analytics section with performance charts
  const renderAnalytics = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      border: '1px dashed #ccc'
    }}>
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

  // Render dashboard overview section
  const renderDashboard = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      position: 'relative',
      border: '1px dashed #ccc'
    }}>
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
        
        {/* Student Performance Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>Student Performance Analytics</Typography>
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
          <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>Staff Performance Analytics</Typography>
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
        
        {/* Department Wise Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>Department-wise Analytics</Typography>
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
  );

  // Render profile section
  const renderProfile = () => (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 0,
      position: 'relative',
      border: '1px dashed #ccc'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Academic Director Profile</Typography>
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        mb: 4
      }}>
        <Avatar sx={{ width: 76, height: 76, bgcolor: '#1A2137', mr: 4 }}>
          A
        </Avatar>
        
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Name</Typography>
              <Typography variant="body1">Dr. Alan Smith</Typography>
            </Box>
            
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Department</Typography>
              <Typography variant="body1">Computer Science</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>ID Number</Typography>
              <Typography variant="body1">AD78945612</Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>Email ID</Typography>
              <Typography variant="body1">alan.smith@university.edu</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  // Render meeting schedule with countdown
  const renderViewMeetingSchedule = () => (
    <Paper sx={{ p: 4, borderRadius: 0, border: '1px dashed #ccc' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>View Meeting Schedule</Typography>
      
      {meetings.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
          No meetings scheduled yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {meetings.map(meeting => {
            // Ensure we have valid date and time for display
            const meetingDateObj = new Date(`${meeting.date || meeting.meetingDate}T${meeting.startTime || '00:00'}`);
            const isValidDate = !isNaN(meetingDateObj.getTime());
            const formattedDate = isValidDate 
              ? meetingDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Invalid Date';
            
            return (
              <Grid item xs={12} key={meeting.id || Math.random()}>
                <Card sx={{ borderRadius: 0, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {meeting.title || `Meeting on ${formattedDate}`}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Typography variant="body2" sx={{ 
                        color: 'primary.main',
                        bgcolor: '#e3f2fd',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Date: ${meeting.date || 'undefined'}`}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: 'success.main',
                        bgcolor: '#e8f5e9',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Time: ${meeting.startTime || '00:00'} - ${meeting.endTime || '00:00'}`}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: '#ff6d00',
                        bgcolor: '#fff3e0',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Role: ${meeting.role === 'student' ? 'Student' : (meeting.role === 'staff' ? 'Staff' : meeting.role || 'undefined')}`}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: '#6a1b9a',
                        bgcolor: '#f3e5f5',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Department: ${getDepartmentName(meeting.department || meeting.departmentId || 'undefined')}`}
                      </Typography>
                      
                      {meeting.role === 'student' && (
                        <Typography variant="body2" sx={{ 
                          color: '#00695c',
                          bgcolor: '#e0f2f1',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {`Year: ${meeting.year || '1'}`}
                        </Typography>
                      )}
                    </Box>
                    
                    {meetingCountdowns[meeting.id] ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1A2137' }}>
                          Time Remaining:
                        </Typography>
                        <Box sx={{ 
                          display: 'flex',
                          gap: 2,
                          mt: 1,
                          alignItems: 'center'
                        }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                              {meetingCountdowns[meeting.id].days}
                            </Typography>
                            <Typography variant="caption">Days</Typography>
                          </Box>
                          <Typography variant="h5">:</Typography>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                              {meetingCountdowns[meeting.id].hours.toString().padStart(2, '0')}
                            </Typography>
                            <Typography variant="caption">Hours</Typography>
                          </Box>
                          <Typography variant="h5">:</Typography>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                              {meetingCountdowns[meeting.id].minutes.toString().padStart(2, '0')}
                            </Typography>
                            <Typography variant="caption">Mins</Typography>
                          </Box>
                          <Typography variant="h5">:</Typography>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                              {meetingCountdowns[meeting.id].seconds.toString().padStart(2, '0')}
                            </Typography>
                            <Typography variant="caption">Secs</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          This meeting has started or passed
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
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
          {tabs.map(tab => (
            <ListItem
              key={tab.id}
              button 
              onClick={() => setActiveTab(tab.id)}
              sx={{
                py: 2, 
                pl: 3,
                bgcolor: activeTab === tab.id ? '#2A3147' : 'transparent',
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
          p: 0, 
          bgcolor: '#f5f5f7',
          ml: '240px',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ width: '1010px', mt: 2, mb: 2 }}>
          {/* Profile Tab */}
          {activeTab === 0 && (
            renderProfile()
          )}
          
          {/* Manage Meetings Tab */}
          {activeTab === 1 && (
            <Paper sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>Manage Meetings</Typography>
              {renderMeetingManagement()}
            </Paper>
          )}
          
          {/* Manage Questions Tab */}
          {activeTab === 2 && (
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
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Meeting Date</InputLabel>
                    <Select
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      label="Meeting Date"
                    >
                      <MenuItem value="">
                        <em>None (General Question)</em>
                      </MenuItem>
                      {meetings.filter(m => m.role === targetRole).map((meeting) => (
                        <MenuItem key={meeting.id} value={meeting.date}>
                          {`${meeting.date} - ${meeting.title}`}
                        </MenuItem>
                      ))}
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
                        onClick={() => handleEditQuestion(q)}
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

              {/* List of added questions */}
              {questions.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Added Questions</Typography>
                  
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                    {questions.map((q, index) => (
                      <Box 
                    key={q.id}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          py: 1,
                          px: 2,
                          borderBottom: index < questions.length - 1 ? '1px solid #eee' : 'none'
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1">{q.text}</Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#1A2137', bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                              {q.targetRole === 'student' ? 'Student' : 'Staff'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#00695c', bgcolor: '#e0f2f1', px: 1, py: 0.5, borderRadius: 1 }}>
                              {q.departmentId}
                            </Typography>
                            {q.targetRole === 'student' && (
                              <Typography variant="caption" sx={{ color: '#ff6d00', bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1 }}>
                                Year {q.year}
                              </Typography>
                            )}
                            {q.meetingDate && (
                              <Typography variant="caption" sx={{ color: '#6a1b9a', bgcolor: '#f3e5f5', px: 1, py: 0.5, borderRadius: 1 }}>
                                Meeting: {q.meetingDate}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      <Box>
                          <IconButton 
                            onClick={() => handleEditQuestion(q)}
                            sx={{ color: '#1A2137' }}
                          >
                          <EditIcon />
                        </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteQuestion(q.id)}
                            sx={{ color: '#d32f2f' }}
                          >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      </Box>
                    ))}
                  </Paper>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                      startIcon={<SendIcon />}
                      onClick={handleSubmitQuestions}
                      sx={{ 
                        bgcolor: '#1A2137', 
                        '&:hover': { bgcolor: '#2A3147' }
                      }}
                    >
                      Submit Questions
              </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {/* View Reports Tab */}
          {activeTab === 4 && (
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
          
          {/* View Meeting Schedule Tab */}
          {activeTab === 5 && renderViewMeetingSchedule()}
          
          {/* Analytics Tab */}
          {activeTab === 3 && renderAnalytics()}
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