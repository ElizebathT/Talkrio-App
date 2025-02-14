const Psychiatrist = require("../models/psychiatristModel");
const Consultation = require("../models/ConsultationModel");
const asyncHandler = require("express-async-handler");

const psychiatristController={
    addPsychiatrist : asyncHandler(async (req, res) => {
        const { name, specialization, availability, contact } = req.body;
        const existingPsychiatrist = await Psychiatrist.findOne({ name, specialization });
        if (existingPsychiatrist) {
            throw new Error("Psychiatrist already exists");
        }
        const psychiatrist = new Psychiatrist({
            name,
            specialization,
            availability, // Example: ["Monday 9AM-12PM", "Wednesday 2PM-5PM"]
            contact,
        });
        await psychiatrist.save();
        res.send({
            message: "Psychiatrist added successfully",
            psychiatrist,
        });
    }),

    editPsychiatrist : asyncHandler(async (req, res) => {
        const { name, specialization, availability, contact } = req.body;    
        const psychiatrist = await Psychiatrist.findOne({name});
        if (!psychiatrist) {
            throw new Error("Psychiatrist not found");
        }
        if (name && specialization) {
            const existingPsychiatrist = await Psychiatrist.findOne({
                name,
                specialization,
                _id: { $ne: id }, // Exclude the current psychiatrist from the check
            });    
            if (existingPsychiatrist) {
                return res.status(400).json({ message: "A psychiatrist with this name and specialization already exists." });
            }
        }
        if (name) psychiatrist.name = name;
        if (specialization) psychiatrist.specialization = specialization;
        if (availability) psychiatrist.availability = availability;
        if (contact) psychiatrist.contact = contact;
    
        // Save the updated psychiatrist
        await psychiatrist.save();
    
        res.status(200).json({
            message: "Psychiatrist updated successfully",
            psychiatrist,
        });
    }),

    deletePsychiatrist : asyncHandler(async (req, res) => {
        const { name } = req.body;
    
        // Find the psychiatrist
        const psychiatrist = await Psychiatrist.findOne({name});
        if (!psychiatrist) {
            throw new Error("Psychiatrist not found");
        }
    
        // Check if the psychiatrist has any scheduled consultations
        const hasScheduledConsultations = await Consultation.exists({
            psychiatristId: psychiatrist._id,
            status: "Scheduled"
        });
    
        if (hasScheduledConsultations) {
            throw new Error("Cannot delete psychiatrist with scheduled consultations");
        }
    
        // Delete the psychiatrist
        await psychiatrist.deleteOne();
    
        res.send("Psychiatrist deleted successfully");
    }),

    getPsychiatrists : asyncHandler(async (req, res) => {
    const psychiatrists = await Psychiatrist.find();
    if(!psychiatrists){
        res.send("No Psychiatrist found")
    }
    res.send(psychiatrists);
}),

    scheduleConsultation : asyncHandler(async (req, res) => {
    const { psychiatristId, date } = req.body;
    const userId=req.user.id
    const existingPsychiatristConsultation = await Consultation.findOne({
        psychiatristId,
        date,
        status: "Scheduled"
    });

    if (existingPsychiatristConsultation) {
        throw new Error("The psychiatrist is not available at this time.");
    }

    const consultation = new Consultation({
        userId,
        psychiatristId,
        date,
        status: "Scheduled",
    });
    await consultation.save();
    res.send({ message: "Consultation scheduled successfully", consultation });
}),

deleteConsultation : asyncHandler(async (req, res) => {
    const { id } = req.body; 
    // Find the consultation
    const consultation = await Consultation.findById(id);
    if (!consultation) {
        throw new Error("Consultation not found");
    }

    // Delete the consultation
    await consultation.deleteOne();

    res.send("Consultation deleted successfully");
}),

    getConsultationHistory : asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const consultations = await Consultation.find({ userId }).populate("psychiatristId", "name specialization");
    res.send(consultations);
}),

getAvailableTimeSlots : asyncHandler(async (req, res) => {
    const { id, date } = req.body;

    if (!id || !date) {
        return res.status(400).json({ message: "Psychiatrist ID and date are required" });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0); // Normalize to start of the day

    // Fetch psychiatrist details
    const psychiatrist = await Psychiatrist.findById(id);
    if (!psychiatrist) {
        return res.status(404).json({ message: "Psychiatrist not found" });
    }

    // Check psychiatrist's availability for the selected day
    const dayOfWeek = selectedDate.toLocaleString("en-US", { weekday: "long" }); // e.g., "Monday"
    const availableSlotsForDay = psychiatrist.availability.find(entry => entry.day === dayOfWeek);

    if (!availableSlotsForDay) {
        return res.status(200).json({ message: "Psychiatrist is unavailable on this day", availableSlots: [] });
    }

    // Extract working hours (example: { day: "Monday", start: "09:00", end: "17:00" })
    const startHour = parseInt(availableSlotsForDay.start.split(":")[0], 10);
    const endHour = parseInt(availableSlotsForDay.end.split(":")[0], 10);
    const slotDuration = 60 * 60 * 1000; // 1 hour in milliseconds

    let allSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        let slot = new Date(selectedDate);
        slot.setHours(hour, 0, 0, 0);
        allSlots.push(slot);
    }

    // Fetch existing consultations for that psychiatrist on the selected date
    const existingConsultations = await Consultation.find({
        psychiatristId: id,
        date: {
            $gte: selectedDate,
            $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000), // End of the day
        },
        status: "Scheduled",
    });

    // Extract booked time slots
    const bookedSlots = existingConsultations.map(consultation => new Date(consultation.date).getTime());

    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot.getTime()));

    res.status(200).json({ availableSlots });
})
}
module.exports = psychiatristController