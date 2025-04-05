import React from 'react';
import { Typography, Grid, Paper, Stack, Avatar, Card, CardContent, Box } from '@mui/material';
import { Person, Email, School } from '@mui/icons-material';

const StudentProfile = ({ userProfile }) => {
  if (!userProfile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" align="center" sx={{ py: 2 }}>
          Loading profile information...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <Avatar
            sx={{ 
              width: { xs: 80, sm: 100 }, 
              height: { xs: 80, sm: 100 }, 
              bgcolor: '#1a237e',
              fontSize: { xs: '2rem', sm: '2.5rem' },
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'S'}
          </Avatar>
        </Grid>
        
        <Grid item xs={12} sm={8} md={9}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              {userProfile.fullName || 'Student Name'}
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ fontSize: '1rem', color: '#5c6bc0', mr: 1 }} />
                <Typography variant="body2">
                  {userProfile.email || 'email@example.com'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ fontSize: '1rem', color: '#5c6bc0', mr: 1 }} />
                <Typography variant="body2">
                  {userProfile.department?.name || 'Department'} - Year {userProfile.year || '1'}
                </Typography>
              </Box>
            </Stack>
            
            {userProfile.studentId && (
              <Typography variant="body2" color="text.secondary">
                Student ID: {userProfile.studentId}
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;