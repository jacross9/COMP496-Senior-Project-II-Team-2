// creating the main back-end index.js file
//file trains the model, has packet simulation, and gives main functionality


const fs = require('fs');
const path = require('path');
const { analyzePacket } = require('./packetAnalysis');
const { trainModel } = require('./train_data_analyzer');

// File paths
const trainingDataPath = path.join(__dirname, 'training_data.json');
const modelPath = path.join(__dirname, 'trained_model.json');

/**
 * Load training data from the file system
 */
const loadTrainingData = () => {
  if (fs.existsSync(trainingDataPath)) {
    const rawData = fs.readFileSync(trainingDataPath, 'utf8');
    return JSON.parse(rawData);
  } else {
    console.error('Training data file not found. Ensure training_data.json exists.');
    return [];
  }
};

/**
 * Train the model and save it to a file
 */
const createTrainedModel = () => {
  console.log('Loading training data...');
  const trainingData = loadTrainingData();

  if (trainingData.length === 0) {
    console.error('No training data available. Exiting.');
    return;
  }

  console.log('Training the model...');
  const model = trainModel(trainingData);

  console.log('Saving trained model...');
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf8');
  console.log(`Trained model saved to ${modelPath}`);
};

/**
 * Simulate packet analysis using the trained model
 */
const simulatePacketAnalysis = (packet) => {
  if (!fs.existsSync(modelPath)) {
    console.error('Trained model not found. Train the model first using createTrainedModel.');
    return;
  }

  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  const { suspiciousPatterns } = model;

  const result = analyzePacket(packet);
  const isSuspicious = suspiciousPatterns.some((pattern) => result.payload.includes(pattern));

  console.log(`Packet Analysis Result: ${JSON.stringify(result)}`);
  console.log(`Is packet suspicious? ${isSuspicious ? 'Yes' : 'No'}`);
};

/**
 * Main function
 */
const main = () => {
  console.log('Starting process...');

  // Train the model (uncomment to run training process)
  // createTrainedModel();

  // Simulate packet analysis (example packet)
  const examplePacket = {
    payload: {
      saddr: '192.168.1.2',
      daddr: '8.8.8.8',
      payload: {
        payload: {
          data: 'example-malware-signature detected in traffic'
        }
      }
    }
  };
  simulatePacketAnalysis(examplePacket);
};

main();
