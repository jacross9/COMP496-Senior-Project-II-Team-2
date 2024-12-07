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

// Start monitoring IoT traffic
const monitorTraffic = () => {
  try {
    console.log('Starting traffic monitoring...');
    const session = pcap.createSession('eth0');

    session.on('packet', (rawPacket) => {
      const packet = pcap.decode.packet(rawPacket);
      const sourceIP = packet.payload.payload.saddr;
      const destIP = packet.payload.payload.daddr;
      const payloadData = packet.payload.payload.payload.data;

      console.log(`Packet captured: ${sourceIP} -> ${destIP}`);

      if (isSuspicious(sourceIP, destIP, payloadData)) {
        logSuspiciousActivity({ sourceIP, destIP, payloadData });
      }
    });
  } catch (error) {
    console.error('Error monitoring traffic:', error);
  }
};

const isSuspicious = (sourceIP, destIP, data) => {
  const suspiciousPatterns = [
    'example-malware-signature',
    'plain-text-password',
  ];

  return suspiciousPatterns.some((pattern) => data?.toString()?.includes(pattern));
};

// REST API endpoints
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

// to import analyzePacket.js
const { analyzePacket } = require('./packetAnalysis');
// to use analyzePacket.js
const monitorTraffic = () => {
  try {
    console.log('Starting traffic monitoring...');
    const session = pcap.createSession('eth0'); // Adjust the interface as needed

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

// exposing endpoints (specifically POST)
app.post('/data', (req, res) => {
  const { sourceIP, destIP, message } = req.body;
  console.log('Received data from Python:', { sourceIP, destIP, message });
  res.json({ success: true });
});

// sends data to POST endpoint
const axios = require('axios');

const sendDataToPython = async () => {
  try {
    const response = await axios.post('http://localhost:3000/process', {
      sourceIP: '192.168.1.1',
      destIP: '192.168.1.2',
      message: 'Example payload data'
    });
    console.log('Response from Python:', response.data);
  } catch (error) {
    console.error('Error sending data to Python:', error);
  }
};

sendDataToPython();
// intialize app
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
  monitorTraffic();
});
