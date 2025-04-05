module.exports = (sequelize, Sequelize) => {
  const Meeting = sequelize.define('meeting', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    meetingDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    startTime: {
      type: Sequelize.TIME,
      allowNull: false
    },
    endTime: {
      type: Sequelize.TIME,
      allowNull: true
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return Meeting;
};