import { v4 as uuid } from "uuid";
import { isDuplicate, saveMessage } from "../utils/db.js";
const EXCHANGE = "message_exchange";

export const resolvers = {
  Query: {
    portStatus: () => "Task Router OK",
  },
  Mutation: {
    sendMessage: async (_, { input }, { rabbit }) => {
      const { channel: type, to, body } = input;

      if (isDuplicate(body)) {
        throw new Error("Duplicate body detected");
      }

      // ◼ Auto-generate IDs
      const messageId = uuid();
      const traceId = uuid();

      // Save message in DB
      await saveMessage({ id: messageId, channel: type, to, body });

      // Routing key → channel.email / channel.sms / channel.whatsapp
      const routingKey = `channel.${type}`;

      const payload = {
        id: messageId,
        channel: type,
        to,
        body,
        traceId,
        attempt: 0,
        createdAt: new Date(),
      };

      // Retry logic for RabbitMQ publish

      let attempt = 0;
      let published = false;

      while (!published && attempt < 3) {
        try {
          rabbit.channel.publish(
            EXCHANGE,
            routingKey,
            Buffer.from(JSON.stringify(payload)),
            { persistent: true }
          );
          published = true;
        } catch (err) {
          attempt++;
          await new Promise((r) => setTimeout(r, 500 * attempt)); // backoff
        }
      }

      if (!published) {
        throw new Error("Failed to publish message after retries.");
      }

      // ◼ Logging
      rabbit.channel.sendToQueue(
        "logs",
        Buffer.from(
          JSON.stringify({
            timestamp: new Date(),
            traceId,
            spanId: uuid(),
            service: "task-router",
            level: "info",
            event: "message_routed",
            message: "Message routed successfully",
            meta: { messageId, channel: type, body },
          })
        )
      );

      return {
        status: "queued",
        traceId,
        messageId,
      };
    },
  },
};
