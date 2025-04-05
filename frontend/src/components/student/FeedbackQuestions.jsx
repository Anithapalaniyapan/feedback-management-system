import React from 'react';
import { Typography, List, ListItem, ListItemText, ListItemIcon, Box, Paper, Divider, Rating, Stack } from '@mui/material';
import { Feedback } from '@mui/icons-material';

const FeedbackQuestions = ({ feedbackQuestions, feedbackRatings, handleRatingChange }) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mb: 3 }}>
        Feedback Questions
      </Typography>
      
      {feedbackQuestions.length > 0 ? (
        <List>
          {feedbackQuestions.map((question) => (
            <ListItem key={question.id} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                <ListItemIcon>
                  <Feedback sx={{ color: '#1a237e' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{question.text}</Typography>}
                  secondary={`Created at: ${new Date(question.createdAt).toLocaleDateString()}`}
                />
              </Box>
              <Box sx={{ pl: 7, width: '100%' }}>
                <Typography component="legend" variant="body2" sx={{ mb: 0.5 }}>
                  Rate this question (1-5 stars)
                </Typography>
                <Rating
                  name={`rating-${question.id}`}
                  value={feedbackRatings[question.id] || 0}
                  onChange={(event, newValue) => {
                    handleRatingChange(question.id, newValue);
                  }}
                  precision={1}
                  size="large"
                  sx={{ color: '#1a237e' }}
                />
              </Box>
              <Divider variant="inset" component="li" sx={{ width: '100%', mt: 2 }} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No feedback questions available for your department and year.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FeedbackQuestions;