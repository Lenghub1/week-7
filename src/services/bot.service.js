import { SessionsClient } from "@google-cloud/dialogflow";
import APIError from "@/utils/APIError.js";
import Order from "@/models/order.model.js";
class BotService {
  constructor(projectId, sessionId, languageCode) {
    // Use the GOOGLE_APPLICATION_CREDENTIALS environment variable to authenticate

    this.sessionClient = new SessionsClient();
    this.sessionPath = this.sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
    this.languageCode = languageCode;
    this.isTrackOrder = false;
  }
  processTrackOrder() {
    this.isTrackOrder = true;
  }
  processTrackOrderDone() {
    this.isTrackOrder = false;
  }
  processDone;
  async getOrderByNumberValue(numberValue) {
    try {
      // Assuming your Order schema has a field called 'orderNumber'
      const order = await Order.findById(numberValue);

      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    } catch (error) {
      console.error("Error getting order:", error);
      throw new Error("Error getting order");
    }
  }
  async detectTextIntent(text) {
    const request = {
      session: this.sessionPath,
      queryInput: {
        text: {
          text,
          languageCode: this.languageCode,
        },
      },
    };
    try {
      const [response] = await this.sessionClient.detectIntent(request);
      return response.queryResult;
    } catch (error) {
      console.error("Error detecting text intent:", error);
      throw new APIError({ status: 500, message: "Internal server error" });
    }
  }
}

export default BotService;
