const { authJwt } = require('../middleware');
const controller = require('../controllers/meeting.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // Create a new meeting
  app.post(
    '/api/meetings',
    [authJwt.verifyToken],
    controller.createMeeting
  );

  // Get all meetings
  app.get(
    '/api/meetings',
    [authJwt.verifyToken],
    controller.getAllMeetings
  );

  // Get meetings by department and year
  app.get(
    '/api/meetings/department/:departmentId/year/:year',
    [authJwt.verifyToken],
    controller.getMeetingsByDepartmentAndYear
  );

  // Get meeting by ID
  app.get(
    '/api/meetings/:id',
    [authJwt.verifyToken],
    controller.getMeetingById
  );

  // Update meeting
  app.put(
    '/api/meetings/:id',
    [authJwt.verifyToken],
    controller.updateMeeting
  );

  // Delete meeting
  app.delete(
    '/api/meetings/:id',
    [authJwt.verifyToken],
    controller.deleteMeeting
  );
};