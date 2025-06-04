const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const scheduledJobs = {};

function logHelloWorld(jobName) {
    const now = new Date().toISOString();
    const log = `${jobName} - Hello World at ${now}\n`;
    console.log(log);
    fs.appendFileSync('hello_output.txt', log);
}

app.post('/schedule', (req, res) => {
    const { name, type, minute, hour, dayOfWeek } = req.body;

    if (scheduledJobs[name]) {
        return res.status(400).send({ message: 'Job with this name already exists' });
    }

    // Cron pattern based on type
    let pattern = '* * * * * *'; // default
    if (type === 'minute'){
        pattern = `${minute || 0} * * * * * `;
    }
    else if (type === 'hourly') {
        pattern = `${minute || 0} * * * *`;
    } else if (type === 'daily') {
        pattern = `${minute || 0} ${hour || 0} * * *`;
    } else if (type === 'weekly') {
        pattern = `${minute || 0} ${hour || 0} * * ${dayOfWeek || 0}`; // 0 = Sunday
    } else {
        return res.status(400).send({ message: 'Invalid type' });
    }

    // Schedule job
    const task = cron.schedule(pattern, () => {
        logHelloWorld(name);
    });

    scheduledJobs[name] = task;
    res.send({ message: 'Job scheduled successfully', pattern });
});

// Endpoint to stop a job
app.post('/stop', (req, res) => {
    const { name } = req.body;
    const job = scheduledJobs[name];
    if (job) {
        job.stop();
        delete scheduledJobs[name];
        return res.send({ message: 'Job stopped' });
    }
    res.status(404).send({ message: 'Job not found' });
});

app.listen(5000, () => {
    console.log('Scheduler running on http://localhost:5000');
});
