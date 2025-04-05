const db = require('../models');
const Meeting = db.meeting;
const User = db.user;
const Department = db.department;

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    // Validate request
    if (!req.body.title || !req.body.meetingDate || !req.body.startTime) {
      return res.status(400).send({ message: 'Required fields missing' });
    }

    // Create meeting
    const meeting = await Meeting.create({
      title: req.body.title,
      description: req.body.description,
      meetingDate: req.body.meetingDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      location: req.body.location,
      status: req.body.status || 'scheduled',
      departmentId: req.body.departmentId,
      year: req.body.year,
      createdBy: req.userId // From JWT middleware
    });

    res.status(201).send({
      message: 'Meeting created successfully',
      meeting: meeting
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get all meetings
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      order: [['meetingDate', 'DESC'], ['startTime', 'DESC']]
    });

    res.status(200).send(meetings);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get meetings by department and year
exports.getMeetingsByDepartmentAndYear = async (req, res) => {
  try {
    const { departmentId, year } = req.params;
    
    const whereClause = {};
    if (departmentId) whereClause.departmentId = departmentId;
    if (year) whereClause.year = year;

    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      order: [['meetingDate', 'DESC'], ['startTime', 'DESC']]
    });

    // Categorize meetings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const pastMeetings = [];
    const currentMeetings = [];
    const futureMeetings = [];
    
    meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.meetingDate);
      
      // Compare dates only (not time)
      const meetingDateOnly = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
      
      if (meetingDateOnly < today) {
        pastMeetings.push(meeting);
      } else if (meetingDateOnly.getTime() === today.getTime()) {
        currentMeetings.push(meeting);
      } else {
        futureMeetings.push(meeting);
      }
    });

    res.status(200).send({
      pastMeetings,
      currentMeetings,
      futureMeetings
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!meeting) {
      return res.status(404).send({ message: 'Meeting not found' });
    }

    res.status(200).send(meeting);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update meeting
exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).send({ message: 'Meeting not found' });
    }

    await meeting.update(req.body);

    res.status(200).send({
      message: 'Meeting updated successfully',
      meeting: meeting
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).send({ message: 'Meeting not found' });
    }

    await meeting.destroy();

    res.status(200).send({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};