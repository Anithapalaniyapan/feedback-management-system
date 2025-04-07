import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../api/axiosConfig'; // Import the global API instance
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import { blue } from '@mui/material/colors';

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
  const [departments, setDepartments] = useState([]); // Add the departments state variable

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
  
  // Add state for profile data
  const [profileData, setProfileData] = useState({
    name: 'Academic Director',
    role: 'Academic Director',
    department: 'Engineering',
    id: localStorage.getItem('userId') || '12345',
    email: localStorage.getItem('userEmail') || 'academic.director@example.com'
  });
  
  // Load meetings from localStorage if there are any
  const loadMeetingsFromStorage = () => {
    try {
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        const parsedMeetings = JSON.parse(storedMeetings);
        if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
          console.log('Loaded meetings from localStorage:', parsedMeetings);
          setMeetings(parsedMeetings);
          return true;
        }
      }
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
    setMeetings(sortedMeetings);

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

      // First try to load from localStorage
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        try {
          const parsedMeetings = JSON.parse(storedMeetings);
          if (Array.isArray(parsedMeetings) && parsedMeetings.length > 0) {
            sortAndSetMeetings(parsedMeetings);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored meetings:', error);
        }
      }

      // If no valid meetings in localStorage, fetch from API
      const response = await API.get('/meetings');
      if (response.data && Array.isArray(response.data)) {
        sortAndSetMeetings(response.data);
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
            department: 'Engineering',
            year: '2024'
          },
          {
            id: '2',
            title: 'Sample Staff Meeting',
            date: new Date().toISOString().split('T')[0],
            startTime: '11:00',
            endTime: '12:00',
            role: 'staff',
            department: 'Engineering'
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
            sortAndSetMeetings(parsedMeetings);
          }
        } catch (error) {
          console.error('Error parsing stored meetings:', error);
        }
      }
    }
  };
  
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
    
    // Check for authentication
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Normalize and check role - be flexible with role format
    const normalizedRole = userRole ? userRole.toLowerCase() : '';
    const isAcademicDirector = 
      normalizedRole === 'academic_director' || 
      normalizedRole === 'academic-director' || 
      normalizedRole === 'academicdirector' ||
      normalizedRole.includes('academic');
    
    if (!isAcademicDirector) {
      console.log(`Invalid role for academic director dashboard: ${userRole}`);
      setSnackbar({
        open: true,
        message: 'You do not have permission to access this dashboard',
        severity: 'error'
      });
      navigate('/login');
      return;
    }
    
    console.log('Authentication successful for Academic Director dashboard');
    
    // Load meetings from localStorage first
    loadMeetingsFromStorage();
    
    // Then try to fetch from API
    fetchMeetings();
  }, [navigate]);

  // Add a function to fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token for profile fetch:', token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // First try to get from localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          console.log('Using profile data from localStorage:', userData);
          
          // Update profile with stored data but maintain Academic Director role
          setProfileData({
            name: 'Academic Director',
            role: 'Academic Director',
            department: 'Engineering',
            id: userData.id || localStorage.getItem('userId') || '12345',
            email: userData.email || localStorage.getItem('userEmail') || 'academic.director@example.com'
          });
          return;
        }
        
        // If not in localStorage, fetch from API
        const response = await API.get('/users/profile');
        const userData = response.data;
        console.log('Profile data from API:', userData);
        
        // Save to localStorage for future use
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update state with Academic Director info
        setProfileData({
          name: 'Academic Director',
          role: 'Academic Director',
          department: 'Engineering',
          id: userData.id || '12345',
          email: userData.email || 'academic.director@example.com'
        });
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        
        // Set default profile data if failed
        setProfileData({
          name: 'Academic Director',
          role: 'Academic Director',
          department: 'Engineering',
          id: localStorage.getItem('userId') || '12345',
          email: localStorage.getItem('userEmail') || 'academic.director@example.com'
        });
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch departments with better error handling
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Use the global API instance with interceptors
        const response = await API.get('/departments');
        
        if (response.data) {
          setDepartments(response.data);
          console.log('Departments loaded successfully:', response.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Load default departments if API fails
        setDepartments([
          { id: '1', name: 'Computer Science' },
          { id: '2', name: 'Information Technology' },
          { id: '3', name: 'Electronics and Communication' },
          { id: '4', name: 'Electrical Engineering' },
          { id: '5', name: 'Mechanical Engineering' }
        ]);
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
    // Check if there are any questions to submit
    if (!questions || questions.length === 0) {
      setSnackbar({
        open: true,
        message: 'No questions to submit.',
        severity: 'error'
      });
      return;
    }

    // Format questions for submission, ensuring all required fields are present
    const formattedQuestions = questions.map(q => ({
      id: q.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      text: q.text,
      department: q.department || department, // Use the department state variable
      year: q.year || '1', // Default to first year if not specified
      status: 'SUBMITTED'
    }));

    try {
      // Try to submit to the API
      try {
        const response = await API.post('/questions/submit', formattedQuestions);
        console.log('Questions submitted successfully to API:', response.data);
      } catch (apiError) {
        console.error('Error submitting questions to API:', apiError);
        // Continue anyway since we'll update localStorage
      }

      // Update questions in state
      setQuestions(formattedQuestions);
      
      // Save to localStorage with MULTIPLE KEYS for consistent access
      localStorage.setItem('questions', JSON.stringify(formattedQuestions));
      localStorage.setItem('submittedQuestions', JSON.stringify(formattedQuestions));
      
      console.log('Saved', formattedQuestions.length, 'questions to localStorage');

      // Reset the new question form
      setNewQuestion({
        text: '',
        department: department,
        year: '',
        status: 'DRAFT'
      });

      // Show success message
      setSnackbar({
        open: true,
        message: 'Questions submitted successfully! They will now be available for feedback.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting questions:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting questions. Please try again.',
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

  // Implement handleDeleteMeeting function
  const handleDeleteMeeting = (meetingId) => {
    // First try to delete via API
    try {
      // Optimistic UI update - remove from state first
      setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
      
      // Then try to delete from API
      API.delete(`/meetings/${meetingId}`)
        .then(response => {
          console.log('Meeting deleted successfully:', response.data);
          setSnackbar({
            open: true,
            message: 'Meeting deleted successfully',
            severity: 'success'
          });
          
          // Update localStorage to keep it in sync
          try {
            const storedMeetings = localStorage.getItem('meetings');
            if (storedMeetings) {
              const parsedMeetings = JSON.parse(storedMeetings);
              const updatedMeetings = parsedMeetings.filter(meeting => meeting.id !== meetingId);
              localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
              localStorage.setItem('submittedMeetings', JSON.stringify(updatedMeetings));
              console.log('Meeting removed from localStorage');
            }
          } catch (storageError) {
            console.error('Error updating localStorage after deletion:', storageError);
          }
        })
        .catch(error => {
          console.error('Error deleting meeting from API:', error);
          // Still remove from localStorage even if API failed
          try {
            const storedMeetings = localStorage.getItem('meetings');
            if (storedMeetings) {
              const parsedMeetings = JSON.parse(storedMeetings);
              const updatedMeetings = parsedMeetings.filter(meeting => meeting.id !== meetingId);
              localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
              localStorage.setItem('submittedMeetings', JSON.stringify(updatedMeetings));
              console.log('Meeting removed from localStorage');
            }
          } catch (storageError) {
            console.error('Error updating localStorage after deletion:', storageError);
          }
        });
    } catch (error) {
      console.error('Error in handleDeleteMeeting:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete meeting',
        severity: 'error'
      });
    }
  };

  // Implement handleEditMeeting function
  const handleEditMeeting = (meeting) => {
    // Set the meeting data to the form for editing
    setNewMeeting({
      title: meeting.title || '',
      date: meeting.date || meeting.meetingDate || '',
      startTime: meeting.startTime || '',
      endTime: meeting.endTime || '',
      role: meeting.role || '',
      department: meeting.department || meeting.departmentId || '',
      year: meeting.year || '',
      submitted: false,
      editId: meeting.id // Add editId to track which meeting is being edited
    });
    
    // Scroll to the edit form
    const formElement = document.getElementById('meeting-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    setSnackbar({
      open: true,
      message: 'Editing meeting: ' + meeting.title,
      severity: 'info'
    });
  };

  // Update handleAddMeeting to handle both adding and editing
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
    if (newMeeting.role.toLowerCase() === 'student' && !newMeeting.year) {
      setSnackbar({
        open: true,
        message: 'Please select a year for student meeting',
        severity: 'error'
      });
      return;
    }
    
    try {
      const isEditing = !!newMeeting.editId;
      console.log(isEditing ? 'Updating meeting:' : 'Adding meeting with data:', newMeeting);
      
      // Check for token before proceeding
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication token not found. Please log in again.',
          severity: 'error'
        });
        navigate('/login');
        return;
      }

      // Verify token expiration
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const tokenData = JSON.parse(jsonPayload);
        const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
          localStorage.clear();
          setSnackbar({
            open: true,
            message: 'Session has expired. Please log in again.',
            severity: 'error'
          });
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
      
      // Create a formatted meeting object that matches the backend expectations
      const meetingData = {
        title: newMeeting.title,
        date: newMeeting.date,
        meetingDate: newMeeting.date,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        role: newMeeting.role.toLowerCase(),
        departmentId: newMeeting.department,
        department: newMeeting.department,
        year: newMeeting.role.toLowerCase() === 'student' ? newMeeting.year : null,
        visibility: {
          role: newMeeting.role.toLowerCase(),
          department: newMeeting.department,
          year: newMeeting.role.toLowerCase() === 'student' ? newMeeting.year : null
        }
      };
      
      if (isEditing) {
        meetingData.id = newMeeting.editId;
      }
      
      // Attempt to use the actual API
      try {
        let response;
        if (isEditing) {
          // Update existing meeting
          response = await API.put(`/meetings/${newMeeting.editId}`, meetingData);
          console.log('Meeting updated successfully:', response.data);
        } else {
          // Add new meeting
          response = await API.post('/meetings', meetingData);
          console.log('Meeting added successfully:', response.data);
        }
        
        // After API call succeeds, update the local state and storage
        await fetchMeetings();
        
        // Show success message
        setSnackbar({
          open: true,
          message: isEditing
            ? `Meeting updated successfully!`
            : `${newMeeting.role.toLowerCase() === 'student' ? 'Student' : 'Staff'} meeting added successfully!`,
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
          submitted: false,
          editId: null
        });
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Check if the error is due to authentication
        if (apiError.response?.status === 401) {
          // Verify if token is actually expired before showing session expired message
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              
              const tokenData = JSON.parse(jsonPayload);
              const expirationTime = tokenData.exp * 1000;
              const currentTime = Date.now();

              if (currentTime >= expirationTime) {
                localStorage.clear();
                setSnackbar({
                  open: true,
                  message: 'Session has expired. Please log in again.',
                  severity: 'error'
                });
                navigate('/login');
                return;
              } else {
                // Token is still valid but got 401, might be a different issue
                setSnackbar({
                  open: true,
                  message: 'Authentication error. Please try again.',
                  severity: 'error'
                });
              }
            } catch (error) {
              console.error('Error checking token expiration:', error);
            }
          }
          return;
        }
        
        // For other errors, try to save to localStorage as fallback
        const mockMeeting = {
          ...meetingData,
          id: isEditing ? newMeeting.editId : Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'PENDING'
        };
        
        // Update state with the new meeting
        setMeetings(prevMeetings => {
          if (isEditing) {
            return prevMeetings.map(meeting => 
              meeting.id === newMeeting.editId ? mockMeeting : meeting
            );
          } else {
            return [...prevMeetings, mockMeeting];
          }
        });
        
        // Save to localStorage
        try {
          const storedMeetings = localStorage.getItem('meetings');
          const existingMeetings = storedMeetings ? JSON.parse(storedMeetings) : [];
          const updatedMeetings = isEditing
            ? existingMeetings.map(meeting => 
                meeting.id === newMeeting.editId ? mockMeeting : meeting
              )
            : [...existingMeetings, mockMeeting];
          
          localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
          localStorage.setItem('submittedMeetings', JSON.stringify(updatedMeetings));
          
          setSnackbar({
            open: true,
            message: `Meeting ${isEditing ? 'updated' : 'added'} successfully (using offline mode)!`,
            severity: 'success'
          });
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
          setSnackbar({
            open: true,
            message: 'Error saving meeting. Please try again.',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error in handleAddMeeting:', error);
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error'
      });
    }
  };

  // Helper function to get department name from id
  const getDepartmentName = (departmentId) => {
    // If departmentId is an object, try to extract the name or id
    if (departmentId && typeof departmentId === 'object') {
      return departmentId.name || departmentId.id || 'Unknown Department';
    }
    
    // Handle string department IDs
    switch(String(departmentId)) {
      case '1':
        return 'Computer Science';
      case '2':
        return 'Information Technology';
      case '3':
        return 'Electronics and Communication';
      case '4':
        return 'Electrical Engineering';
      case '5':
        return 'Mechanical Engineering';
      default:
        return departmentId || 'Unknown Department';
    }
  };

  const handleSubmitMeetingSchedule = async () => {
    // Check if there are any meetings to submit
    if (!meetings || meetings.length === 0) {
      setSnackbar({
        open: true,
        message: 'No meetings to submit.',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Submitting meetings:', meetings);
      console.log('Using token:', localStorage.getItem('token'));

      // Format meetings for submission, ensuring all fields have valid values
      const formattedMeetings = meetings.map(meeting => {
        // Create a fallback date if needed
        const meetingDate = meeting.date || meeting.meetingDate || new Date().toISOString().split('T')[0];
        
        return {
          id: meeting.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
          title: meeting.title || `Meeting on ${meetingDate}`,
          date: meetingDate,
          meetingDate: meetingDate, // For consistency
          startTime: meeting.startTime || '09:00',
          endTime: meeting.endTime || '10:00',
          role: (meeting.role || 'student').toLowerCase(), // Ensure role is lowercase
          department: meeting.department || meeting.departmentId || '1',
          departmentId: meeting.departmentId || meeting.department || '1',
          year: meeting.role?.toLowerCase() === 'student' ? (meeting.year || '1') : null,
          status: 'SUBMITTED'
        };
      });

      // Try to submit to the API first
      try {
        const response = await axios.post('http://localhost:8080/api/meetings/submit', formattedMeetings, {
          headers: {
            'x-access-token': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Meetings submitted successfully to API:', response.data);
      } catch (apiError) {
        console.error('Error submitting meetings to API:', apiError);
        // Continue anyway since we'll update localStorage
      }

      // Update meetings in state with the status
      setMeetings(formattedMeetings);
      
      // Save to localStorage for access by other dashboards - USE CONSISTENT KEYS
      localStorage.setItem('meetings', JSON.stringify(formattedMeetings));
      localStorage.setItem('submittedMeetings', JSON.stringify(formattedMeetings));
      
      console.log('Saved', formattedMeetings.length, 'meetings to localStorage');

      // Create timer data for upcoming meetings by role
      const now = new Date();
      
      // Filter and sort meetings by role
      const studentMeetings = formattedMeetings
        .filter(m => m.role?.toLowerCase() === 'student')
        .filter(m => {
          const meetingDate = new Date(m.date || m.meetingDate);
          return !isNaN(meetingDate.getTime()) && meetingDate > now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date || a.meetingDate);
          const dateB = new Date(b.date || b.meetingDate);
          return dateA - dateB;
        });
      
      const staffMeetings = formattedMeetings
        .filter(m => m.role?.toLowerCase() === 'staff')
        .filter(m => {
          const meetingDate = new Date(m.date || m.meetingDate);
          return !isNaN(meetingDate.getTime()) && meetingDate > now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date || a.meetingDate);
          const dateB = new Date(b.date || b.meetingDate);
          return dateA - dateB;
        });
      
      console.log('Found student meetings:', studentMeetings.length);
      console.log('Found staff meetings:', staffMeetings.length);
      
      // Create timer data for student meetings
      if (studentMeetings.length > 0) {
        const nextStudentMeeting = studentMeetings[0];
        const meetingDate = new Date(`${nextStudentMeeting.date || nextStudentMeeting.meetingDate}T${nextStudentMeeting.startTime || '00:00'}`);
        
        if (!isNaN(meetingDate.getTime())) {
          const diffMs = Math.max(0, meetingDate - now);
          const diffMins = Math.floor(diffMs / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          
          const studentTimerData = {
            id: nextStudentMeeting.id,
            title: nextStudentMeeting.title,
            date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: nextStudentMeeting.startTime,
            minutesLeft: diffMins,
            secondsLeft: diffSecs,
            originalDate: nextStudentMeeting.date || nextStudentMeeting.meetingDate,
            department: nextStudentMeeting.department || nextStudentMeeting.departmentId,
            role: 'student',
            year: nextStudentMeeting.year
          };
          
          // Save student timer data to both specific and generic keys
          localStorage.setItem('studentNextMeetingData', JSON.stringify(studentTimerData));
          localStorage.setItem('nextMeetingData', JSON.stringify({
            ...studentTimerData,
            role: 'student'
          }));
          
          console.log('Saved student timer data:', studentTimerData);
        }
      }
      
      // Create timer data for staff meetings
      if (staffMeetings.length > 0) {
        const nextStaffMeeting = staffMeetings[0];
        const meetingDate = new Date(`${nextStaffMeeting.date || nextStaffMeeting.meetingDate}T${nextStaffMeeting.startTime || '00:00'}`);
        
        if (!isNaN(meetingDate.getTime())) {
          const diffMs = Math.max(0, meetingDate - now);
          const diffMins = Math.floor(diffMs / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          
          const staffTimerData = {
            id: nextStaffMeeting.id,
            title: nextStaffMeeting.title,
            date: meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: nextStaffMeeting.startTime,
            minutesLeft: diffMins,
            secondsLeft: diffSecs,
            originalDate: nextStaffMeeting.date || nextStaffMeeting.meetingDate,
            department: nextStaffMeeting.department || nextStaffMeeting.departmentId,
            role: 'staff'
          };
          
          // Save staff timer data
          localStorage.setItem('staffNextMeetingData', JSON.stringify(staffTimerData));
          
          console.log('Saved staff timer data:', staffTimerData);
        }
      }
      
      // Update UI to show success
      setSnackbar({
        open: true,
        message: 'Meeting schedule submitted successfully! Dashboards will now show the meeting times.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting meeting schedule:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting meeting schedule. Please try again.',
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
        <Grid item xs={12} id="meeting-form">
          <Typography variant="subtitle1" gutterBottom>
            {newMeeting.editId ? 'Edit Meeting' : 'Add New Meeting'}
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    setNewMeeting(prev => ({ ...prev, submitted: true }));
                    handleAddMeeting();
                  }}
                  sx={{ mt: 2 }}
                >
                  {newMeeting.editId ? 'Update Meeting' : 'Add Meeting'}
                </Button>
                
                {newMeeting.editId && (
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setNewMeeting({
                        title: '',
                        date: '',
                        startTime: '',
                        endTime: '',
                        role: '',
                        department: '',
                        year: '',
                        submitted: false,
                        editId: null
                      });
                    }}
                    sx={{ mt: 2 }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Box>
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
                    <TableCell>Year</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meetings
                    .filter(meeting => {
                      if (meetingFilter === 'all') return true;
                      const meetingRole = (meeting.role || '').toLowerCase().trim();
                      const filterRole = meetingFilter.toLowerCase().trim();
                      return meetingRole === filterRole;
                    })
                    .map((meeting, index) => (
                    <TableRow key={meeting.id || index}>
                      <TableCell>{meeting.title}</TableCell>
                      <TableCell>{meeting.date}</TableCell>
                      <TableCell>{meeting.startTime} - {meeting.endTime}</TableCell>
                      <TableCell>
                        <Chip 
                          label={meeting.role?.toLowerCase() === 'student' ? 'Student' : 'Staff'}
                          color={meeting.role?.toLowerCase() === 'student' ? 'primary' : 'secondary'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {getDepartmentName(meeting.department || meeting.departmentId)}
                      </TableCell>
                      <TableCell>
                        {meeting.role?.toLowerCase() === 'student' ? (
                          meeting.year ? (
                            meeting.year === '1' ? 'First Year' :
                            meeting.year === '2' ? 'Second Year' :
                            meeting.year === '3' ? 'Third Year' :
                            meeting.year === '4' ? 'Fourth Year' : 
                            meeting.year
                          ) : '-'
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={meeting.status || 'scheduled'}
                          color={meeting.status === 'SUBMITTED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => handleEditMeeting(meeting)}
                          title="Edit meeting"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          title="Delete meeting"
                        >
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
  const renderProfile = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ width: 100, height: 100, mr: 3, bgcolor: blue[700] }}
            >
              {profileData.name ? profileData.name.charAt(0) : 'A'}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {profileData.name || 'Academic Director'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {profileData.role || 'Academic Director'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Department:</strong> Engineering
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" gutterBottom>
                <strong>ID Number:</strong> {profileData.id || 'AD1001'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {profileData.email || 'academic.director@university.edu'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  // Countdown Box component for displaying timer values
  const CountdownBox = ({ label, value }) => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {typeof value === 'number' ? value.toString().padStart(2, '0') : '00'}
      </Typography>
      <Typography variant="caption">{label}</Typography>
    </Box>
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
            // Extract date from either date or meetingDate property
            const dateValue = meeting.date || meeting.meetingDate;
            
            // Ensure we have valid date and time for display
            const meetingDateObj = dateValue ? new Date(`${dateValue}T${meeting.startTime || '00:00'}`) : null;
            const isValidDate = meetingDateObj && !isNaN(meetingDateObj.getTime());
            const formattedDate = isValidDate 
              ? meetingDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Pending';
            
            // Format time
            const timeDisplay = meeting.startTime && meeting.endTime 
              ? `${meeting.startTime} - ${meeting.endTime}` 
              : meeting.startTime 
                ? `${meeting.startTime}` 
                : 'Time not specified';
            
            // Get role display - default to Student if not specified or if creation was for Student
            const roleOriginal = meeting.role ? meeting.role.toLowerCase() : '';
            const roleDisplay = roleOriginal === 'student' ? 'Student' : 
                               roleOriginal === 'staff' ? 'Staff' : 
                               'Student'; // Default to Student if not specified
            
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
                        {`Date: ${isValidDate ? formattedDate : 'Pending'}`}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: 'success.main',
                        bgcolor: '#e8f5e9',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Time: ${timeDisplay}`}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: '#ff6d00',
                        bgcolor: '#fff3e0',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Role: ${roleDisplay}`}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: '#6a1b9a',
                        bgcolor: '#f3e5f5',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {`Department: ${getDepartmentName(meeting.department || meeting.departmentId)}`}
                      </Typography>
                      
                      {(roleDisplay === 'Student' || meeting.role?.toLowerCase() === 'student') && (
                        <Typography variant="body2" sx={{ 
                          color: '#00695c',
                          bgcolor: '#e0f2f1',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {`Year: ${meeting.year || 'Not specified'}`}
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
                          {/* Time countdown display */}
                          <CountdownBox label="Days" value={meetingCountdowns[meeting.id]?.days || 0} />
                          <CountdownBox label="Hours" value={meetingCountdowns[meeting.id]?.hours || 0} />
                          <CountdownBox label="Minutes" value={meetingCountdowns[meeting.id]?.minutes || 0} />
                          <CountdownBox label="Seconds" value={meetingCountdowns[meeting.id]?.seconds || 0} />
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                        This meeting has already started or has no valid date.
                      </Typography>
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