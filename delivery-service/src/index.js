import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { createRabbitMQ } from "./utils/rabbitmq.js";
import { isDuplicate, saveMessage } from "./utils/db.js";
import { emailDelivery } from "./services/email.js";
import { whatsappDelivery } from "./services/whatsapp.js";
import { smsDelivery } from "./services/sms.js";
dotenv.config();

const processMessage = async (channel, msg, handler, type) => {
  const data = JSON.parse(msg.content.toString());
  console.log(`📨 Received message from router → ${type}`, data);

  // detecting duplicacy

  if (isDuplicate(data.id)) {
    console.log(`⚠️ Duplicate message skipped`, data.id);
    return channel.ack(msg);
  }

  try {
    await handler(data);
    await saveMessage(data);
    console.log(`✔ ${type} delivered successfully:`, data.id);

    channel.sendToQueue(
      "logs",
      Buffer.from(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          traceId: data.traceId,
          spanId: uuid(),
          service: "delivery-service",
          level: "info",
          event: `${type.toLowerCase()}_delivered`,
          meta: { messageId: data.id, channel: type, to: data.to },
        })
      )
    );
    channel.ack(msg);
  } catch (error) {
    console.log(`❌ ${type} delivery failed — retrying...`, error.message);

    channel.sendToQueue(
      "logs",
      Buffer.from(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          traceId: data.traceId,
          spanId: uuid(),
          service: "delivery-service",
          level: "error",
          event: `${type.toLowerCase()}_delivery_failed`,
          meta: { error: error.message, messageId: data.id, channel: type },
        })
      )
    );

    // retry after delay
    setTimeout(() => channel.nack(msg, false, true), 2000);
  }
};

async function startServer() {
  const { channel } = await createRabbitMQ();

  console.log("🚚 Delivery Service Started");

  //Email consumer
  channel.consume("email_queue", (msg) => {
    if (msg !== null) {
      processMessage(channel, msg, emailDelivery, "Email");
    }
  });

  //SMS consumer
  channel.consume("sms_queue", (msg) => {
    if (msg !== null) {
      processMessage(channel, msg, smsDelivery, "SMS");
    }
  });

  //whatsapp consumer
  channel.consume("whatsapp_queue", (msg) => {
    if (msg !== null) {
      processMessage(channel, msg, whatsappDelivery, "WhatsApp");
    }
  });
}

startServer();
