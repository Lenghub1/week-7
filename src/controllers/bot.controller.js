import dotenv from "dotenv";
import { dialogflowService } from "@/utils/dialogflow.js";
dotenv.config();



export default async function handleTextQuery(req, res) {
  const { text } = req.body;

  try {
    const result = await dialogflowService.detectTextIntent(text);
    const intentName = result.intent.displayName;
    

    switch (intentName) {
      case "add_order":
        result.fulfillmentText = result.fulfillmentText;
        break;
      case "track.order":
        dialogflowService.processTrackOrder(result);
        break;
      case "order.id":
        if (!dialogflowService.isTrackOrder) {
          result.fulfillmentText = "Please start tracking an order first.";
        } else {
          const trackId = result.parameters.fields.id.stringValue;
          console.log(trackId);
          const shipping =
            await dialogflowService.getOrderStatusByShippingId(trackId);
          if (shipping) {
            result.fulfillmentText = `Thank you ! , here is your status ${shipping}`;
          } else {
            result.fulfillmentMessages = "Sorry we cant find your ShippingId";
          }
          dialogflowService.processTrackOrderDone(result);
        }

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
