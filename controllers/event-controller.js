const Event = require("./../models/Event.js");

/* 
 * EventCreate   - POST("/event")       → Create a new event
 * EventList     - GET("/event")        → List all events
 * GetEvent      - GET("/event/:id")    → Get single event by ID
 * EventUpdate   - PUT("/event/:id")    → Update event by ID
 * EventDelete   - DELETE("/event/:id") → Delete event by ID
 * EventRegister - POST("/event/:id/register") → Add user to event participants
*/

// CREATE: Add a new event
const EventCreate = async (req, res) => {
  try {
    const { name, description, date, time, participants } = req.body;

    const newEvent = await Event.create({
      name,
      description,
      date, // format: "YYYY-MM-DD"
      time, // format: "HH:mm"
      participants
    });

    if (!newEvent) {
      return res.status(400).json({ message: "Failed to create the event." });
    }

    return res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

// DELETE: Remove event by ID
const EventDelete = async (req, res) => {
  const eventId = req.params.id;
  try {
    const removed = await Event.findByIdAndDelete(eventId);
    if (!removed) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE: Modify event by ID
const EventUpdate = async (req, res) => {
  const eventId = req.params.id;
  const { name, description, date, time, participants } = req.body;

  try {
    const updated = await Event.findByIdAndUpdate(
      eventId,
      { name, description, date, time, participants },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ message: "Event updated successfully", event: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// LIST: Get all events
const EventList = async (req, res) => {
  try {
    const events = await Event.find();
    return res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// REGISTER: Add a participant to an event
const EventRegister = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "User already registered for this event" });
    }

    event.participants.push(userId);
    await event.save();

    res.json({ message: "User registered successfully", event });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Failed to register for event" });
  }
};

// GET SINGLE: Get event by ID
const GetEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    return res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { GetEvent, EventList, EventRegister, EventDelete, EventUpdate, EventCreate };
