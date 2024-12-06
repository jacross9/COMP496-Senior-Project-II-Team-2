// trains the data collected from IoT device

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { analyzePacket } = require('./analyzePacket'); 

const trainingDataFile = path.join(__dirname, 'training_data.json');
const modelFile = path.join(__dirname, 'trained_model.json');


const trainModel = (data) => {
  const patterns = new Set();

  data.forEach((entry) => {
    if (entry.isSuspicious && entry.payload) {
      // this extracts keywords or patterns from suspicious payloads
      const words = entry.payload.split(/\s+/).filter((word) => word.length > 3);
      words.forEach((word) => patterns.add(word));
    }
  });

  return {
    suspiciousPatterns: Array.from(patterns),
  };
};

//create file to save trained data
const saveModel = (model) => {
  fs.writeFileSync(modelFile, JSON.stringify(model, null, 2), 'utf8');
  console.log(`Trained model saved to ${modelFile}`);
};

const loadTrainingData = () => {
  if (fs.existsSync(trainingDataFile)) {
    const rawData = fs.readFileSync(trainingDataFile, 'utf8');
    return JSON.parse(rawData);
  }

  console.error('Training data file not found. Please provide training data.');
  return [];
};

/**
 * Main function to train the model based on provided data
 */
const main = () => {
  console.log('Loading training data...');
  const trainingData = loadTrainingData();

  if (trainingData.length === 0) {
    console.error('No training data available. Exiting.');
    return;
  }

  console.log('Training model...');
  const model = trainModel(trainingData);

  console.log('Saving trained model...');
  saveModel(model);

  console.log('Model training complete.');
};

main();
