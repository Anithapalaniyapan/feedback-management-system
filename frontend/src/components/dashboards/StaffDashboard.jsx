import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Rating,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import FeedbackIcon from '@mui/icons-material/Feedback';

const StaffDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchFeedbackQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          navigate('/login', { replace: true });
          return;
        }
        
        const response = await fetch('http://localhost:8080/api/questions/department/1/staff', {
          method: 'GET',
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 403) {
          console.error('Permission denied');
          navigate('/login', { replace: true });
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setFeedbackQuestions(data);
      } catch (error) {
        console.error('Error fetching feedback questions:', error);
      }
    };

    fetchFeedbackQuestions();
  }, [navigate]);

  const handleSubmitFeedback = async () => {
    if (!selectedQuestion) {
      alert('Please select a question');
      return;
    }
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          rating,
          notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSelectedQuestion(null);
      setRating(0);
      setNotes('');
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDownloadReport = async (reportId) => {
    try {
      setIsLoading(true);
      const blob = new Blob(['Sample Report Content'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'auto' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Staff Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback Questions from Academic Director
              </Typography>
              <List>
                {feedbackQuestions.map((question) => (
                  <ListItem 
                    key={question.id} 
                    onClick={() => setSelectedQuestion(question)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedQuestion?.id === question.id ? 'action.selected' : 'transparent'
                    }}
                  >
                    <ListItemIcon>
                      <FeedbackIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={question.text}
                      secondary={`Created at: ${new Date(question.createdAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
              {selectedQuestion && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Submit Feedback
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      value={rating}
                      onChange={(event, newValue) => setRating(newValue)}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmitFeedback}
                    disabled={submitLoading}
                  >
                    {submitLoading ? <CircularProgress size={24} /> : 'Submit Feedback'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  onClick={() => handleDownloadReport(1)}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Download Report'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StaffDashboard;
