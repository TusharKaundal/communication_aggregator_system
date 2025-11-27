import amqp from "amqplib";
const EXCHANGE = "message_exchange";
export const createRabbitMQ = async () => {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertQueue("logs", { durable: true });

  return { connection, channel };
};
