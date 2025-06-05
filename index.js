const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const scheduledJobs = {};

class CustomScheduler {
    constructor() {
        this.jobs = new Map();
        this.timers = new Map();
        this.isRunning = false;
        this.checkInterval = null;
    }
 
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        this.checkInterval = setInterval(() => {
            this.checkAndRunJobs();
        }, 60000); // Check every minute
        
        console.log('Custom scheduler started');
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        
        console.log('Custom scheduler stopped');
    }

    addJob(name, config, callback) {
        const job = {
            name,
            type: config.type,
            minute: config.minute || 0,
            hour: config.hour || 0,
            dayOfWeek: config.dayOfWeek || 0,
            callback,
            lastRun: null,
            isActive: true
        };

        this.jobs.set(name, job);
        
        // If it's a minute-based job, set up immediate scheduling
        if (config.type === 'minute') {
            this.scheduleMinuteJob(job);
        }
        
        return job;
    }

    removeJob(name) {
        const job = this.jobs.get(name);
        if (job) {
            job.isActive = false;
            this.jobs.delete(name);
            
            if (this.timers.has(name)) {
                clearTimeout(this.timers.get(name));
                this.timers.delete(name);
            }
            
            return true;
        }
        return false;
    }

    scheduleMinuteJob(job) {
        const now = new Date();
        const targetSeconds = job.minute * 60;
        const currentSeconds = now.getSeconds() + (now.getMinutes() * 60);
        
        let delay;
        if (targetSeconds > currentSeconds) {
            delay = (targetSeconds - currentSeconds) * 1000;
        } else {
            delay = (3600 - currentSeconds + targetSeconds) * 1000; // Next hour
        }

        const timer = setTimeout(() => {
            if (job.isActive) {
                job.callback();
                job.lastRun = new Date();
                
                // Schedule next run
                this.scheduleMinuteJob(job);
            }
        }, delay);

        this.timers.set(job.name, timer);
    }

    checkAndRunJobs() {
        const now = new Date();
        
        this.jobs.forEach(job => {
            if (!job.isActive) return;
            
            if (this.shouldRunJob(job, now)) {
                job.callback();
                job.lastRun = new Date(now);
            }
        });
    }

    shouldRunJob(job, now) {
        const currentMinute = now.getMinutes();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Sunday
        
        // Skip minute jobs (they have their own scheduling)
        if (job.type === 'minute') return false;
        
        // Check if we already ran this job in the current minute
        if (job.lastRun) {
            const lastRunMinute = job.lastRun.getMinutes();
            const lastRunHour = job.lastRun.getHours();
            const lastRunDay = job.lastRun.getDate();
            const currentDate = now.getDate();
            
            // Prevent running multiple times in the same minute
            if (lastRunMinute === currentMinute && 
                lastRunHour === currentHour && 
                lastRunDay === currentDate) {
                return false;
            }
        }

        switch (job.type) {
            case 'hourly':
                return currentMinute === job.minute;
                
            case 'daily':
                return currentMinute === job.minute && currentHour === job.hour;
                
            case 'weekly':
                return currentMinute === job.minute && 
                       currentHour === job.hour && 
                       currentDay === job.dayOfWeek;
                       
            default:
                return false;
        }
    }

    getJobInfo(name) {
        return this.jobs.get(name);
    }

    getAllJobs() {
        return Array.from(this.jobs.values());
    }
}

const scheduler = new CustomScheduler();
scheduler.start();

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

    const validTypes = ['minute', 'hourly', 'daily', 'weekly'];
    if (!validTypes.includes(type)) {
        return res.status(400).send({ message: 'Invalid type. Must be: minute, hourly, daily, or weekly' });
    }

    const config = { type };
    
    if (type === 'minute') {
        // For minute jobs, 'minute' parameter represents seconds within the hour
        config.minute = parseInt(minute) || 0;
        if (config.minute < 0 || config.minute > 59) {
            return res.status(400).send({ message: 'Minute must be between 0-59 for minute jobs' });
        }
    } else {
        config.minute = parseInt(minute) || 0;
        if (config.minute < 0 || config.minute > 59) {
            return res.status(400).send({ message: 'Minute must be between 0-59' });
        }
    }
    
    if (type === 'daily' || type === 'weekly') {
        config.hour = parseInt(hour) || 0;
        if (config.hour < 0 || config.hour > 23) {
            return res.status(400).send({ message: 'Hour must be between 0-23' });
        }
    }
    
    if (type === 'weekly') {
        config.dayOfWeek = parseInt(dayOfWeek) || 0;
        if (config.dayOfWeek < 0 || config.dayOfWeek > 6) {
            return res.status(400).send({ message: 'Day of week must be between 0-6 (0=Sunday)' });
        }
    }

    const job = scheduler.addJob(name, config, () => {
        logHelloWorld(name);
    });

    scheduledJobs[name] = job;
    
    let pattern = '';
    switch (type) {
        case 'minute':
            pattern = `Every hour at minute ${config.minute}`;
            break;
        case 'hourly':
            pattern = `Every hour at minute ${config.minute}`;
            break;
        case 'daily':
            pattern = `Daily at ${config.hour}:${config.minute.toString().padStart(2, '0')}`;
            break;
        case 'weekly':
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            pattern = `Weekly on ${days[config.dayOfWeek]} at ${config.hour}:${config.minute.toString().padStart(2, '0')}`;
            break;
    }

    res.send({ 
        message: 'Job scheduled successfully', 
        pattern,
        config: config
    });
});

app.post('/stop', (req, res) => {
    const { name } = req.body;
    
    if (!scheduledJobs[name]) {
        return res.status(404).send({ message: 'Job not found' });
    }

    const removed = scheduler.removeJob(name);
    if (removed) {
        delete scheduledJobs[name];
        return res.send({ message: 'Job stopped and removed successfully' });
    }
    
    res.status(500).send({ message: 'Failed to stop job' });
});

app.get('/jobs', (req, res) => {
    const jobs = scheduler.getAllJobs().map(job => ({
        name: job.name,
        type: job.type,
        minute: job.minute,
        hour: job.hour,
        dayOfWeek: job.dayOfWeek,
        lastRun: job.lastRun,
        isActive: job.isActive
    }));
    
    res.send({ jobs });
});

app.get('/jobs/:name', (req, res) => {
    const { name } = req.params;
    const job = scheduler.getJobInfo(name);
    
    if (!job) {
        return res.status(404).send({ message: 'Job not found' });
    }
    
    res.send({
        name: job.name,
        type: job.type,
        minute: job.minute,
        hour: job.hour,
        dayOfWeek: job.dayOfWeek,
        lastRun: job.lastRun,
        isActive: job.isActive
    });
});

process.on('SIGINT', () => {
    console.log('\nShutting down scheduler...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down scheduler...');
    scheduler.stop();
    process.exit(0);
});

app.listen(5000, () => {
    console.log('Scheduler running on http://localhost:5000');
    console.log('Custom scheduler implementation active');
});