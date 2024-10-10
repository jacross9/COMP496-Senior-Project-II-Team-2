// Senior Project
// Main Index JS File


'use strict';
const Engine = require('./lib/engine');
const Logger = require('./lib/logger');
const config = require('./lib/config');
const device = require('./lib/device');
const { Endpoint } = require('aws-sdk');

config.loadConstConfigValues().then(
    async (configValues) => {
        config.logger = new Logger(configValues.loggingLevel);
        config.simulatorLoopInterval = configValues.simulatorLoopInterval;
        config.iotRegion = configValues.iotRegion;
        config.topic = configValues.topic;
        config.device = await device.getDevice(configValues.iotRegion, configValues.simulatorLoopInterval);
        config.logger.log(`Device got id. Device ID: ${config.device.deviceId}`, config.logger.levels.INFO);

        await config.getIotEndpoint(configValues.iotRegion).then(
            async (endpoint) => {
                config.logger.log(`IoT Endpoint configured for the target region: ${configValues.iotRegion}: ${endpoint}`, config.logger.levels.INFO);
                config.iotEndpoint = endpoint;

                let engine = new Engine(config);
                engine.start();
            }
        ).catch(
            (err) => {
                config.logger.log(`Error obtaining IoT Endpoint. Error: ${err}`, config.logger.levels.ROBUST);
                config.logger.error(err, config.logger.levels.ROBUST);
            }
        );
    }
).catch(
    (err) => {
        config.logger.log(`Error starting the engine. Error: ${err}`, config.logger.levels.ROBUST);
        config.logger.error(err, config.logger.levels.ROBUST);
    }
);
