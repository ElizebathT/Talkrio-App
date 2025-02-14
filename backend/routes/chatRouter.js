const express = require("express");
const { sendMessageToDialogflow } = require("../middlewares/dialogflowService");

const chatRouter = express.Router();

chatRouter.post("/chat", async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const response = await sendMessageToDialogflow(message, sessionId);
        res.send({ reply: response });
    } catch (error) {
        throw new Error( "Failed to process message");
    }
});

module.exports = chatRouter;
