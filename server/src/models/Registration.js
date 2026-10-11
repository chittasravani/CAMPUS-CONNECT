import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered',
    },
    attendanceStatus: {
      type: String,
      enum: ['absent', 'present'],
      default: 'absent',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active registrations for the same student & event
registrationSchema.index({ studentId: 1, eventId: 1, status: 1 });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
