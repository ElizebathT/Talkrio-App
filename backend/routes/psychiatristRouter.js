const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const psychiatristController = require("../controllers/psychiatristController");
const psychiatristRoutes = express.Router();

psychiatristRoutes.post("/add", userAuthentication,psychiatristController.addPsychiatrist);
psychiatristRoutes.get("/slots", userAuthentication,psychiatristController.getAvailableTimeSlots);
psychiatristRoutes.put("/edit", userAuthentication,psychiatristController.editPsychiatrist);
psychiatristRoutes.get("/history", userAuthentication,psychiatristController.getConsultationHistory);
psychiatristRoutes.get("/viewall", userAuthentication,psychiatristController.getPsychiatrists);
psychiatristRoutes.put("/schedule", userAuthentication,psychiatristController.scheduleConsultation);

module.exports = psychiatristRoutes;