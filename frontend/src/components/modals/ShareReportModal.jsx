import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import axios from 'axios';

const ShareReportModal = ({ open, onClose, reportData }) => {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [staffList] = useState([
    { id: 1, name: 'John Doe', department: 'Computer Science' },
    { id: 2, name: 'Jane Smith', department: 'Information Technology' },
    // TODO: Fetch actual staff list from backend
  ]);

  const handleStaffSelect = (event) => {
    setSelectedStaff(event.target.value);
  };

  const handleShare = async () => {
    if (selectedStaff.length === 0) {
      setError('Please select at least one staff member');
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      await axios.post('http://localhost:8080/api/reports/share', {
        reportData,
        recipients: selectedStaff
      });

      setSuccess(true);
      setError('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedStaff([]);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share report. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'darkblue' }}>Share Report</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Report shared successfully!</Alert>}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Select staff members to share the report with:
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel id="staff-select-label">Staff Members</InputLabel>
          <Select
            labelId="staff-select-label"
            multiple
            value={selectedStaff}
            onChange={handleStaffSelect}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const staff = staffList.find(s => s.id === value);
                  return (
                    <Chip
                      key={value}
                      label={staff.name}
                      sx={{ backgroundColor: 'lightblue' }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {staffList.map((staff) => (
              <MenuItem key={staff.id} value={staff.id}>
                {staff.name} - {staff.department}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleShare}
          variant="contained"
          sx={{
            backgroundColor: 'darkblue',
            '&:hover': { backgroundColor: '#1a237e' }
          }}
        >
          Share Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareReportModal;