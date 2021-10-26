"use strict";

let config = {};

// button configuration
config.BUTTON_PIN = 24;
config.BUTTON_DEBOUNCE_MS = 100;

// LED configuration
config.LED_PIN = 27;
config.LED_BLINK_INTERVAL_MS = 200;

// tilt & incoming data settings
config.TILT_RED_UUID = "a495bb10c5b14b44b5121370f02d74de";
config.TILT_RED_ADDRESS = "d0bf238b9395";
config.THROTTLE_DATA_MS = 30 * 60 * 1000; // 30 minutes

// data formatting & csv settings
config.CSV_BASE_NAME = "data.csv";
config.ROTATE_CSV_INTERVAL = "2h";  // https://github.com/iccicci/rotating-file-stream#interval
config.CSV_DELIMITER = ";";
config.CSV_OPTIONS = {
  headers: false,
  writeHeaders: false,
  delimiter: ";",
};
config.TIMESTAMP_FORMAT = "DD.MM.YYYY HH:mm:ss";

module.exports = config;
