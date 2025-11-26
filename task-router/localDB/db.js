import { JSONFilePreset } from "lowdb/node";

const defaultData = { message: [] };

export const db = await JSONFilePreset("./task-router.json", defaultData);
