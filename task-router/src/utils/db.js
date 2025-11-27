import { JSONFilePreset } from "lowdb/node";

const defaultData = { message: [] };

const db = await JSONFilePreset("./task-router.json", defaultData);

export function isDuplicate(body) {
  return db.data?.message.some((msg) => msg.body === body);
}

export async function saveMessage(body, to, channel, id) {
  db.data?.message.push({
    id,
    body,
    to,
    channel,
    createdAt: new Date().toISOString(),
  });
  await db.write();
}
