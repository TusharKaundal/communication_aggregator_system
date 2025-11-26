import { db } from "./db.js";

export function isDuplicate(body) {
  return db.data.messages.some((msg) => msg.body === body);
}

export async function save(body, to, channel, id) {
  db.data.messages.push({
    id,
    body,
    to,
    channel,
    createdAt: new Date().toISOString(),
  });
  await db.write();
}
