const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const psychiatristController = require("../controllers/psychiatristController");
const psychiatristRoutes = express.Router();

psychiatristRoutes.post("/add", userAuthentication,psychiatristController.addPsychiatrist);
psychiatristRoutes.get("/slots", userAuthentication,psychiatristController.getAvailableTimeSlots);
psychiatristRoutes.put("/edit", userAuthentication,psychiatristController.editPsychiatrist);
psychiatristRoutes.get("/viewall", userAuthentication,psychiatristController.getPsychiatrists);
psychiatristRoutes.delete("/delete", userAuthentication,psychiatristController.deletePsychiatrist);

psychiatristRoutes.put("/schedule", userAuthentication,psychiatristController.scheduleConsultation);
psychiatristRoutes.get("/history", userAuthentication,psychiatristController.getConsultationHistory);
psychiatristRoutes.delete("/remove", userAuthentication,psychiatristController.deleteConsultation);

module.exports = psychiatristRoutes;