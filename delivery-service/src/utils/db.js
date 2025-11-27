import { JSONFilePreset } from "lowdb/node";

const defaultData = { delivered: [] };

const db = await JSONFilePreset("./messages.json", defaultData);

export async function isDuplicate(id) {
  return db.data.delivered.some((m) => m.id === id);
}

export async function saveMessage(msg) {
  db.data.delivered.push(msg);
  await db.write();
}
