import { SessionsClient, EntityTypesClient } from "@google-cloud/dialogflow";
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
    this.projectId = projectId;
    this.entityTypesClient = new EntityTypesClient();
    this.isOrder = false;
  }
  processTrackOrder() {
    this.isTrackOrder = true;
  }
  processTrackOrderDone() {
    this.isTrackOrder = false;
  }

  procressOrder() {
    this.isOrder = true;
  }
  procressOrderDone() {
    this.isOrder = false;
  }
  async getOrderStatusByShippingId(trackNumber) {
    try {
      const order = await Order.findOne({
        tracking_number: trackNumber,
      });

      if (order) {
        return order.shipping.status;
      } else {
        return "Shipping ID not found";
      }
    } catch (error) {
      console.error(error);
      throw error;
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
  async addEntityValues(entityTypeName, newValues) {
    try {
      // Retrieve the existing entity type
      const [existingEntityType] = await this.entityTypesClient.getEntityType({
        name: `projects/${this.projectId}/locations/global/agent/entityTypes/${entityTypeName}`,
      });

      if (!existingEntityType) {
        throw new Error(`Entity type ${entityTypeName} not found.`);
      }

      // Add the new values to the existing entity type
      const updatedEntityType = {
        ...existingEntityType,
        entities: [
          ...(existingEntityType.entities || []),
          ...newValues.map((value) => ({ value })),
        ],
      };

      // Update the entity type in Dialogflow
      await this.entityTypesClient.updateEntityType({
        entityType: updatedEntityType,
        updateMask: {
          paths: ["entities"],
        },
      });
    } catch (error) {
      console.error(`Error adding entity values: ${error.message}`);
    }
  }
  
}

export default BotService;
