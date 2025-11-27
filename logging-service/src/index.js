import { createRabbitMQ } from "./utils/rabbitmq.js";
import { saveLog } from "./utils/elastic.js";

const startServer = async () => {
  const { channel } = await createRabbitMQ();

  console.log("📃 Logging Service Started - Wating for logs...");

  channel.consume("logs", async (msg) => {
    if (!msg) return;

    try {
      const log = JSON.parse(msg.content.toString());
      console.log("📥 Received Log", log);

      await saveLog(log);

      channel.ack(msg);
    } catch (error) {
      console.log("❌ Failed to process logs:", error.message);

      // retry later
      setTimeout(() => channel.nack(msg, false, true), 2000);
    }
  });
};

startServer();
