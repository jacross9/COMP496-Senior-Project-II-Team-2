// created to analyze the packet information being sent to IoT device
// uses DNS queries
// implements AI based anomaly detection

// code isn't importing correctly so this file may need to revised, i'm not sure what's happening


const analyzePacket = (packet) => {
  const analysisResult = {};
  
  // Extract IP information
  try {
    const ethernet = packet.payload;
    const ip = ethernet.payload;
    
    if (ip?.saddr && ip?.daddr) {
      analysisResult.sourceIP = ip.saddr.toString();
      analysisResult.destinationIP = ip.daddr.toString();
    }

    const transport = ip.payload;
    if (transport?.sport && transport?.dport) {
      analysisResult.sourcePort = transport.sport;
      analysisResult.destinationPort = transport.dport;
    }
    

    const appPayload = transport?.payload?.toString();
    analysisResult.payload = appPayload || 'No application data';
    
    analysisResult.isSuspicious = detectSuspiciousPatterns(appPayload);
  } catch (error) {
    analysisResult.error = `Error analyzing packet: ${error.message}`;
  }
  
  return analysisResult;
};

const detectSuspiciousPatterns = (data) => {
  if (!data) return false;

  const suspiciousPatterns = [
    'example-malware-signature', 
    'plain-text-password',  
    'credit-card',
  ];


  return suspiciousPatterns.some((pattern) => data.includes(pattern));
};

module.exports = { analyzePacket, detectSuspiciousPatterns };
