import mongoose from 'mongoose';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

/**
 * Register authenticated student for an approved event
 * POST /api/registrations
 */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Event ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid event ID format',
      });
    }

    // 1. Find event to verify existence and approval status
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found',
      });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot register for unapproved or pending events',
      });
    }

    // 2. Always use authenticated user's ID from JWT token
    const studentId = req.user._id;

    // 3. Check for duplicate active registration
    const existingRegistration = await Registration.findOne({
      studentId,
      eventId,
      status: 'registered',
    });

    if (existingRegistration) {
      return res.status(409).json({
        status: 'fail',
        message: 'You are already registered for this event',
      });
    }

    // 4. Atomic capacity check & increment to prevent race conditions during concurrent requests
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'approved',
        $expr: { $lt: [{ $ifNull: ['$registeredCount', 0] }, '$capacity'] },
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        status: 'fail',
        message: 'Event registration is full',
      });
    }

    // 5. Create registration document
    let registration;
    try {
      registration = await Registration.create({
        studentId,
        eventId,
        status: 'registered',
        attendanceStatus: 'absent',
      });
    } catch (createErr) {
      // Rollback atomic counter if registration creation fails
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      throw createErr;
    }

    const populatedRegistration = await Registration.findById(registration._id)
      .populate('eventId', 'title date time venue category capacity registeredCount')
      .populate('studentId', 'name email');

    return res.status(201).json({
      status: 'success',
      message: 'Successfully registered for event',
      data: { registration: populatedRegistration },
    });
  } catch (error) {
    console.error('Register Event Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during event registration',
    });
  }
};

/**
 * Get logged-in student's registrations
 * GET /api/registrations/my
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user._id;

    const registrations = await Registration.find({
      studentId,
      status: 'registered',
    })
      .populate({
        path: 'eventId',
        select: 'title description category date time venue capacity registeredCount status',
        populate: {
          path: 'organizerId',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: registrations.length,
      data: { registrations },
    });
  } catch (error) {
    console.error('Get My Registrations Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching registrations',
    });
  }
};

/**
 * Cancel a student's own registration
 * DELETE /api/registrations/:id
 */
export const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid registration ID format',
      });
    }

    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        status: 'fail',
        message: 'Registration not found',
      });
    }

    // Verify ownership: student can only cancel their own registration
    if (registration.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only cancel your own registrations',
      });
    }

    if (registration.status === 'registered') {
      registration.status = 'cancelled';
      await registration.save();

      // Decrement event registeredCount atomically
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { registeredCount: -1 },
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Registration cancelled successfully',
      data: { registration },
    });
  } catch (error) {
    console.error('Cancel Registration Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while cancelling registration',
    });
  }
};
