import BotService from "@/services/bot.service.js";
import dotenv from "dotenv";

dotenv.config();

const dialogflowService = new BotService(
  process.env.GOOGLE_PROJECT_ID,
  process.env.DIALOGFLOW_SESSION_ID,
  process.env.DIALOGFLOW_SESSION_LANGUAGE_CODE
);

export default async function handleTextQuery(req, res) {
  const { text } = req.body;

  try {
    const result = await dialogflowService.detectTextIntent(text);
    const intentName = result.intent.displayName;

    console.log(intentName);

    switch (intentName) {
      case "add_order":
        result.fulfillmentText = result.fulfillmentText;
        break;

      case "order.remove":
        result.fulfillmentText = result.fulfillmentText;
        break;
      case "order.completed":
        result.fulfillmentText = "Do you want to checkout ?";
        break;
      default:
    }

    res.send(result);
  } catch (error) {
    console.error("Error processing text query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
