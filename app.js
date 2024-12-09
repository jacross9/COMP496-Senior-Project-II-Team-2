// file for creating the back end of the IoT device
// not final file
// uses Javascript, Node.JS
// uses REST API

// install this: npm install express body-parser pcap
// install: npm install express body-parser pcap mysql2
// run this: node app.js
// use this to check activity: GET /status
// use this to get suspicious activity log: GET /logs
// bash command: curl http://localhost:3000/status
// server url: http://localhost:3000


const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const pcap = require('pcap');
const axios = require('axios');
const { analyzePacket } = require('./packetAnalysis');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logSuspiciousActivity = (data) => {
  const logFile = path.join(logDir, 'suspicious_activity.log');
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logFile, logEntry, 'utf8');
  console.log('Suspicious activity logged:', data);
};

const monitorTraffic = () => {
  try {
    console.log('Starting traffic monitoring...');
    const session = pcap.createSession('eth0'); // Adjust as needed
    session.on('packet', (rawPacket) => {
      const packet = pcap.decode.packet(rawPacket);
      const analysisResult = analyzePacket(packet);

      console.log(`Packet analyzed: ${JSON.stringify(analysisResult)}`);

      if (analysisResult.isSuspicious) {
        logSuspiciousActivity(analysisResult);
      }
    });
  } catch (error) {
    console.error('Error monitoring traffic:', error);
  }
};

app.get('/status', (req, res) => {
  res.json({ status: 'Monitoring is running' });
});

app.get('/logs', (req, res) => {
  const logFile = path.join(logDir, 'suspicious_activity.log');
  if (fs.existsSync(logFile)) {
    const logs = fs.readFileSync(logFile, 'utf8');
    res.send(logs);
  } else {
    res.send('No suspicious activity logged yet.');
  }
});

app.post('/data', (req, res) => {
  const { sourceIP, destIP, message } = req.body;
  console.log('Received data from Python:', { sourceIP, destIP, message });
  res.json({ success: true });
});

const sendDataToPython = async () => {
  try {
    const response = await axios.post('http://localhost:5000/process', {
      sourceIP: '192.168.1.1',
      destIP: '192.168.1.2',
      message: 'Example payload data'
    });
    console.log('Response from Python:', response.data);
  } catch (error) {
    console.error('Error sending data to Python:', error);
  }
};

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
  monitorTraffic();
});