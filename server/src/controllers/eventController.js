import mongoose from 'mongoose';
import Event from '../models/Event.js';

/**
 * Get all approved events for students
 * GET /api/events
 */
export const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('organizerId', 'name email')
      .sort({ date: 1 });

    return res.status(200).json({
      status: 'success',
      results: events.length,
      data: { events },
    });
  } catch (error) {
    console.error('Get Events Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching events',
    });
  }
};

/**
 * Get all events created by the authenticated organizer
 * GET /api/events/my
 */
export const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id })
      .populate('organizerId', 'name email organizationName department')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: events.length,
      data: { events },
    });
  } catch (error) {
    console.error('Get Organizer Events Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching organizer events',
    });
  }
};

/**
 * Get all events across all organizers for Admin review
 * GET /api/events/all
 */
export const getAllAdminEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizerId', 'name email organizationName department')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: events.length,
      data: { events },
    });
  } catch (error) {
    console.error('Get All Admin Events Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching all admin events',
    });
  }
};

/**
 * Get details of a specific event
 * GET /api/events/:id
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id).populate('organizerId', 'name email organizationName department');

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found',
      });
    }

    // Do not expose pending or rejected events unless requested by owner or admin
    if (event.status !== 'approved') {
      const organizerIdStr = event.organizerId?._id ? event.organizerId._id.toString() : event.organizerId?.toString();
      const isOwner = req.user && organizerIdStr === req.user._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          status: 'fail',
          message: 'Event not found',
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: { event },
    });
  } catch (error) {
    console.error('Get Event By ID Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching event details',
    });
  }
};

/**
 * Create a new event (Organizers & Admins only)
 * POST /api/events
 */
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      posterUrl,
      endDate,
      eligibility,
      contactEmail,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !date || !time || !venue || capacity === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields (title, description, category, date, time, venue, capacity) are required',
      });
    }

    const numCapacity = Number(capacity);
    if (isNaN(numCapacity) || numCapacity < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Capacity must be a positive number of at least 1',
      });
    }

    // Always assign req.user._id as organizerId (never trust client supplied organizerId)
    // Newly created events are pending admin approval by default
    const newEvent = await Event.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      date: new Date(date),
      time: String(time).trim(),
      venue: String(venue).trim(),
      capacity: numCapacity,
      organizerId: req.user._id,
      status: 'pending',
      posterUrl: posterUrl ? String(posterUrl).trim() : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eligibility: eligibility ? String(eligibility).trim() : undefined,
      contactEmail: contactEmail ? String(contactEmail).trim() : undefined,
    });

    const populatedEvent = await Event.findById(newEvent._id).populate(
      'organizerId',
      'name email organizationName department'
    );

    return res.status(201).json({
      status: 'success',
      message: 'Event created successfully and is pending admin approval',
      data: { event: populatedEvent || newEvent },
    });
  } catch (error) {
    console.error('Create Event Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating event',
    });
  }
};

/**
 * Update an existing event (Organizer of the event or Admin only)
 * PUT /api/events/:id
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found',
      });
    }

    // Verify ownership or admin role
    const isOwner = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this event',
      });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      status,
      posterUrl,
      endDate,
      eligibility,
      contactEmail,
    } = req.body;

    if (title !== undefined) event.title = String(title).trim();
    if (description !== undefined) event.description = String(description).trim();
    if (category !== undefined) event.category = String(category).trim();
    if (date !== undefined) event.date = new Date(date);
    if (time !== undefined) event.time = String(time).trim();
    if (venue !== undefined) event.venue = String(venue).trim();
    if (posterUrl !== undefined) event.posterUrl = String(posterUrl).trim();
    if (endDate !== undefined) event.endDate = new Date(endDate);
    if (eligibility !== undefined) event.eligibility = String(eligibility).trim();
    if (contactEmail !== undefined) event.contactEmail = String(contactEmail).trim();
    if (capacity !== undefined) {
      const numCapacity = Number(capacity);
      if (isNaN(numCapacity) || numCapacity < 1) {
        return res.status(400).json({
          status: 'fail',
          message: 'Capacity must be a positive number of at least 1',
        });
      }
      event.capacity = numCapacity;
    }

    // Status management: Admin can update status ('pending', 'approved', 'rejected');
    // Owner can cancel/reject their own event.
    if (status !== undefined) {
      if (isAdmin && ['pending', 'approved', 'rejected'].includes(status)) {
        event.status = status;
      } else if (isOwner && status === 'rejected') {
        event.status = 'rejected';
      }
    }

    const updatedEvent = await event.save();
    const populatedUpdated = await Event.findById(updatedEvent._id).populate(
      'organizerId',
      'name email organizationName department'
    );

    return res.status(200).json({
      status: 'success',
      message: 'Event updated successfully',
      data: { event: populatedUpdated || updatedEvent },
    });
  } catch (error) {
    console.error('Update Event Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while updating event',
    });
  }
};

/**
 * Delete an event (Organizer of the event or Admin only)
 * DELETE /api/events/:id
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found',
      });
    }

    // Verify ownership or admin role
    const isOwner = event.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this event',
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete Event Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting event',
    });
  }
};
