const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const Message = require("../models/chatModel");
const chatRoutes = express.Router();

chatRoutes.get("/:roomId", userAuthentication,async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});
  
  // Save a new message
chatRoutes.post("/", userAuthentication,async (req, res) => {
  try {
    const { roomId, senderId, receiverId, message, timestamp } = req.body;

    const newMessage = new Message({
      roomId,
      senderId,
      receiverId,
      message,
      timestamp,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error saving message", error });
  }
});

module.exports = chatRoutes;