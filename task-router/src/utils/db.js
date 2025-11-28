import { JSONFilePreset } from "lowdb/node";
import dotenv from "dotenv";

dotenv.config();

const defaultData = { message: [] };

const db = await JSONFilePreset(
  `${process.env.DB_DIR}/task-router-db.json`,
  defaultData
);

export function isDuplicate({ channel, to, body }) {
  console.log(db.data.message);
  return db.data?.message.some(
    (msg) => msg.body === body && msg.to === to && msg.channel === channel
  );
}

export async function saveMessage({ body, to, channel, id }) {
  db.data?.message.push({
    id,
    body,
    to,
    channel,
    createdAt: new Date().toISOString(),
  });
  await db.write();
}
