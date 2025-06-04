# 🕒 Node.js Job Scheduler

A lightweight job scheduling system built with Node.js using `express` and `node-cron`. Allows scheduling of jobs to log "Hello World" to the console and a file on an **hourly**, **daily**, or **weekly** basis.

---

## 🚀 Features

- 📅 Schedule jobs at specific times
- 🔁 Supports **hourly**, **daily**, and **weekly** jobs
- 📄 Logs output to both the console and `hello_output.txt`
- 🔧 REST API to schedule or stop jobs
- ⚡ No database required (in-memory jobs)

---

## 🛠️ Tech Stack

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [node-cron](https://www.npmjs.com/package/node-cron)
- [body-parser](https://www.npmjs.com/package/body-parser)

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/job-scheduler-node.git
cd job-scheduler-node
npm install
```

## ▶️ Running the App

```bash
node index.js
```

## 🔌 API Endpoints

🧪 POST /schedule

- Schedules a new job.

Request Body (JSON):
➤ Hourly Job:

```json
{
  "name": "hello_hourly",
  "type": "hourly",
  "minute": 15
}
```
➤ Daily Job:
```json
{
  "name": "hello_daily",
  "type": "daily",
  "minute": 0,
  "hour": 12
}
```
➤ Weekly Job:
```json
{
  "name": "hello_weekly",
  "type": "weekly",
  "minute": 0,
  "hour": 10,
  "dayOfWeek": 1
}
```
Note: dayOfWeek is 0 (Sunday) to 6 (Saturday)

🛑 POST /stop
- Stops an active job.

Request Body:
```json
{
  "name": "hello_hourly"
}
```

🗂 Output
All jobs log "Hello World" with a timestamp to:

- The console

- A file named hello_output.txt