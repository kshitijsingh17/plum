const Appointment = require('../models/appointment.model');

exports.create = async ({ department, date, time, tz }) => {
  try {
    // Input guardrails
    if (!department || !date || !time || !tz) {
      return {
        status: 'needs_clarification',
        message: 'Missing or invalid appointment fields (department, date, time, tz)'
      };
    }

    // Optionally, you can normalize department name capitalization
    const formattedDept = department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();

    const appt = new Appointment({
      department: formattedDept,
      date,
      time,
      tz
    });

    await appt.save();

    return {
      appointment: {
        department: formattedDept,
        date,
        time,
        tz
      },
      status: 'ok'
    };

  } catch (err) {
    return {
      status: 'needs_clarification',
      message: `Failed to create appointment: ${err.message}`
    };
  }
};
