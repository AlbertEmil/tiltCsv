"use strict";

const fs = require("fs");
const path = require("path");

const config = require("./config");
const utils = require("./utils");

const createDataDirectory = (directory=config.DATA_DIR) => {
  // TODO: Use try/catch for error handling
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

const getFilepath = (directory=config.DATA_DIR) => {
  const filename = getFilename();
  const filepath = path.join(directory, filename);
  return path.resolve(filepath);
};

const getFilename = () => {
  const timestamp = utils.timestamp(config.FILENAME_TIMESTAMP_FORMAT);
  const filename = `${timestamp}-${config.FILENAME_BASE}${config.FILE_SUFFIX}`;
  return filename;
};

const writeCsvData = (data) => {
  const filepath = getFilepath();
  // TODO: Use try/catch for error handling
  fs.appendFileSync(filepath, data, { flag: "a" });
};

createDataDirectory();

module.exports.writeCsvData = writeCsvData;
