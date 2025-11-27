import amqp from "amqplib";

export const createRabbitMQ = async () => {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();
  await channel.assertQueue("logs", { durable: true });

  return { connection, channel };
};
