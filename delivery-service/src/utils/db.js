import { JSONFilePreset } from "lowdb/node";
import dotenv from "dotenv";

dotenv.config();

const defaultData = { delivered: [] };

const db = await JSONFilePreset(
  `${process.env.DB_DIR}/message-db.json`,
  defaultData
);

export function isDuplicate(id) {
  return db.data?.delivered.some((m) => m.id === id);
}

export async function saveMessage(msg) {
  db.data?.delivered.push(msg);
  await db.write();
}
