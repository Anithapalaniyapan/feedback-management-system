import { Container, Typography, Grid, Paper, List, ListItem, ListItemText, ListItemIcon, Button, Box, AppBar, Toolbar } from '@mui/material';
import { Schedule, Feedback, Assessment, Event, Description, PeopleAlt, Analytics, School, TrendingUp, Policy, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ExecutiveDirectorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'auto' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Executive Director Dashboard
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
        <Typography variant="h4" component="h1" gutterBottom>
          Executive Director Dashboard - Institutional Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Executive Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<TrendingUp />}
                    fullWidth
                  >
                    Institution-wide Analytics
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Policy />}
                    fullWidth
                  >
                    Policy Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Analytics />}
                    fullWidth
                  >
                    Strategic Planning
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<School />}
                    fullWidth
                  >
                    Academic Excellence Review
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Executive Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Institutional Performance" 
                    secondary="Annual Review Report Available"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleAlt />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Department Status" 
                    secondary="All Departments Performance Overview"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Feedback />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Feedback Analysis" 
                    secondary="Institution-wide Feedback Trends"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ExecutiveDirectorDashboard;