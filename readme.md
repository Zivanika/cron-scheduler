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
- [body-parser](https://www.npmjs.com/package/body-parser)

---

## 📦 Installation

```bash
git clone https://github.com/Zivanika/job-scheduler-node.git
cd job-scheduler-node
npm install
```

## ▶️ Running the App

```bash
node index.js
```

🔌 API Endpoints
🧪 POST /schedule
Schedules a new job.
Request Body (JSON):
➤ Minute Job (runs every hour at specified minute):

```json
{
  "name": "hello_minute",
  "type": "minute",
  "minute": 30
}
```

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
  "minute": 30,
  "hour": 14
}
```

➤ Weekly Job:

```json
{
  "name": "hello_weekly",
  "type": "weekly",
  "minute": 0,
  "hour": 9,
  "dayOfWeek": 1
}
```

Parameters:

name (string): Unique identifier for the job
type (string): Job frequency - "minute", "hourly", "daily", or "weekly"
minute (number): Minute of the hour (0-59)
hour (number): Hour of the day (0-23) - required for daily/weekly jobs
dayOfWeek (number): Day of the week (0-6, where 0=Sunday) - required for weekly jobs

Response:

```json
{
  "message": "Job scheduled successfully",
  "pattern": "Daily at 14:30",
  "config": {
    "type": "daily",
    "minute": 30,
    "hour": 14
  }
}
```

🛑 POST /stop
Stops and removes a scheduled job.
Request Body (JSON):

```json
{
  "name": "hello_hourly"
}
```

Response:

```json
{
  "message": "Job stopped and removed successfully"
}
```

📋 GET /jobs
Lists all scheduled jobs with their current status.
Response:

```json
{
  "jobs": [
    {
      "name": "hello_hourly",
      "type": "hourly",
      "minute": 15,
      "hour": 0,
      "dayOfWeek": 0,
      "lastRun": "2025-06-05T10:15:00.000Z",
      "isActive": true
    },
    {
      "name": "daily_report",
      "type": "daily",
      "minute": 30,
      "hour": 14,
      "dayOfWeek": 0,
      "lastRun": null,
      "isActive": true
    }
  ]
}
```

🔍 GET /jobs/:name
Gets detailed information about a specific job.
Parameters:

name (path parameter): The name of the job to retrieve

Response:

```json
{
  "name": "hello_hourly",
  "type": "hourly",
  "minute": 15,
  "hour": 0,
  "dayOfWeek": 0,
  "lastRun": "2025-06-05T10:15:00.000Z",
  "isActive": true
}
```

Error Response (404):

```json
{
  "message": "Job not found"
}
```

🗂 Output
All jobs log "Hello World" with a timestamp to:

- The console

- A file named hello_output.txt
