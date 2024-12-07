// import this: const { detectSuspiciousActivity, analyzeSuspiciousPacket, loadSuspiciousPatterns } = require('./suspiciousActivity');

const fs = require('fs');

const detectSuspiciousActivity = (payload, suspiciousPatterns) => {
  if (!payload || !suspiciousPatterns || suspiciousPatterns.length === 0) return false;

  // Check if payload contains any suspicious patterns
  return suspiciousPatterns.some((pattern) => payload.includes(pattern));
};


const analyzeSuspiciousPacket = (packet, suspiciousPatterns) => {
  const result = {
    sourceIP: packet?.payload?.saddr || 'Unknown',
    destinationIP: packet?.payload?.daddr || 'Unknown',
    isSuspicious: false,
    payload: '',
  };

  try {
    const payloadData = packet?.payload?.payload?.payload?.data || '';
    result.payload = payloadData.toString();
    result.isSuspicious = detectSuspiciousActivity(result.payload, suspiciousPatterns);
  } catch (error) {
    console.error('Error analyzing packet:', error);
  }

  return result;
};


const loadSuspiciousPatterns = (modelFilePath) => {
  try {
    if (fs.existsSync(modelFilePath)) {
      const modelData = JSON.parse(fs.readFileSync(modelFilePath, 'utf8'));
      return modelData.suspiciousPatterns || [];
    }
    console.warn('Model file not found. Using empty suspicious patterns list.');
    return [];
  } catch (error) {
    console.error('Error loading suspicious patterns:', error);
    return [];
  }
};

module.exports = { detectSuspiciousActivity, analyzeSuspiciousPacket, loadSuspiciousPatterns };

const packet = {
  payload: {
    saddr: '192.168.1.1',
    daddr: '8.8.8.8',
    payload: { payload: { data: 'example-malware-signature detected' } },
  },
};
const analysis = analyzeSuspiciousPacket(packet, suspiciousPatterns);
console.log(analysis);
