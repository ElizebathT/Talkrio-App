const dialogflow = require("dialogflow");
const path = require("path");

const projectId = "your-project-id"; // Get from Dialogflow
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: path.join(__dirname, "../talkrio-7e3ae1d62da3.json"),
});

async function sendMessageToDialogflow(message, sessionId) {
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: "en",
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0].queryResult.fulfillmentText;
}

module.exports = { sendMessageToDialogflow };
