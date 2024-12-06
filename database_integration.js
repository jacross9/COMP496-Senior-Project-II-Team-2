// need a SQL database called "network_monitor"
// install: npm install mysql2
// bash: node app.js


const mysql = require('mysql2');

// database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password', 
  database: 'network_monitor',
};

// creates a connection pool
const pool = mysql.createPool(dbConfig);


const savePacketAnalysis = (analysis) => {
  const query = `INSERT INTO packet_logs (source_ip, destination_ip, source_port, destination_port, payload, is_suspicious, analysis_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    analysis.sourceIP || null,
    analysis.destinationIP || null,
    analysis.sourcePort || null,
    analysis.destinationPort || null,
    analysis.payload || null,
    analysis.isSuspicious || false,
    new Date(),
  ];

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error('Error saving packet analysis:', err);
      return;
    }
    console.log('Packet analysis saved to database:', results.insertId);
  });
};

const getSuspiciousLogs = (callback) => {
  const query = `SELECT * FROM packet_logs WHERE is_suspicious = true ORDER BY analysis_time DESC`;

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving suspicious logs:', err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};


const initializeDatabase = () => {
  const query = `CREATE TABLE IF NOT EXISTS packet_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    source_port INT,
    destination_port INT,
    payload TEXT,
    is_suspicious BOOLEAN,
    analysis_time DATETIME
  )`;

  pool.query(query, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
      return;
    }
    console.log('Database initialized successfully.');
  });
};

// Initialize the database on script load
initializeDatabase();

module.exports = { savePacketAnalysis, getSuspiciousLogs };
