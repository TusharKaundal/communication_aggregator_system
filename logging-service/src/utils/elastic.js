import dotenv from "dotenv";
import { Client } from "@elastic/elasticsearch";

dotenv.config();
export const es = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const saveLog = async (log) => {
  await es.index({
    index: "communication_logs",
    document: log,
  });
};
