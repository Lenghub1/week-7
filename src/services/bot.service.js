import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";

dotenv.config();

class BotService {
  constructor(projectId, sessionId, languageCode) {
    // Use the GOOGLE_APPLICATION_CREDENTIALS environment variable to authenticate
    this.sessionClient = new SessionsClient();
    this.sessionPath = this.sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
    this.languageCode = languageCode;
    this.order = false;
    this.pendingOrder = {
      products: [],
      quantities: [],
      totalPrices: [],
    };
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
      throw error;
    }
  }
}

export default BotService;

