# Communication Aggregator System

This repository contains the reference implementation for a three-service communication aggregator: a **Task Router** GraphQL API, a **Delivery Service** that fans out work across channels, and a **Logging Service** that centralizes observability in Elasticsearch. All three services are orchestrated locally through Docker Compose and communicate asynchronously through RabbitMQ.

---

## Architecture Overview

- **Task Router (`task-router`)** receives GraphQL `sendMessage` mutations, persists deduplicated intents to LowDB (`db/data/task-router-db.json`), and publishes payloads to a RabbitMQ topic exchange (`message_exchange`).
- **Delivery Service (`delivery-service`)** subscribes to channel-specific queues, calls mocked channel adapters (`services/email|sms|whatsapp.js`), persists deliveries to `db/data/message-db.json`, and emits structured log events.
- **Logging Service (`logging-service`)** consumes the `logs` queue, send them into Elasticsearch (`communication_logs` index).
- **Shared Infrastructure** includes RabbitMQ, Elasticsearch (observability), and file-based LowDB instances that make the state visible without installing a heavyweight RDBMS.

### Data Flow

1.  **Client → Task Router**: GraphQL mutation arrives with `channel`, `to`, and `body`. Router assigns `messageId` + `traceId`, detectduplicates, and stores it.
2.  **Task Router → RabbitMQ**: Router publishes the payload to `message_exchange` using routing key `channel.<type>`.
3.  **RabbitMQ → Delivery Service**: The delivery worker consumes `email_queue`, `sms_queue`, or `whatsapp_queue`, invokes the corresponding handler/adapter , and delivery record.
4.  **Delivery Service → RabbitMQ Logs Queue**: Event logs are sent to the durable `logs` queue.
5.  **Logging Service → Elasticsearch**: The logger indexes every log document into `communication_logs` for querying in Kibana or via the REST API.

---

## Running the Stack

### 1. Via Docker Compose (recommended)

```bash
docker compose up -d
```

This brings up RabbitMQ (ports `5672/15672`), Elasticsearch (`9200/9300`), and all three Node.js services. LowDB volumes are mounted so data survives container restarts.

> **Elastic credentials**: populate `logging-service/.env` (see `ELASTIC_URL`, `ELASTIC_USER`, `ELASTIC_PASSWORD`). For local testing you can use the default `elastic` user created by the official image.

### 2. Run services individually or local/host system

Each service uses `npm` scripts; run them in separate terminals after exporting the env vars shown.

```bash
# RabbitMQ & Elasticsearch must already be running (compose or local installs)

# Task Router (GraphQL on :4000)
cd task-router
npm install
RABBITMQ_URL=amqp://localhost PORT=4000 DB_DIR=../db/data npm run start

# Delivery Service workers
cd delivery-service
npm install
RABBITMQ_URL=amqp://localhost DB_DIR=../db/data npm run start

# Logging Service
cd logging-service
npm install
RABBITMQ_URL=amqp://localhost \
ELASTIC_URL=http://localhost:9200 \
ELASTIC_USER=elastic \
ELASTIC_PASSWORD=changeme \
npm run start
```

---
