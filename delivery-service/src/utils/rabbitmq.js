import amqp from "amqplib";

const EXCHANGE = "message_exchange";
const QUEUES = [
  { name: "email_queue", key: "channel.email" },
  { name: "sms_queue", key: "channel.sms" },
  { name: "whatsapp_queue", key: "channel.whatsapp" },
];

export const createRabbitMQ = async () => {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  //declare queues

  for (const q of QUEUES) {
    await channel.assertQueue(q.name, { durable: true });
    await channel.bindQueue(q.name, EXCHANGE, q.key);
  }

  return { channel };
};
