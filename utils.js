"use strict";

const moment = require("moment");

const getTimestamp = (formatter) => {
  return moment().format(formatter);
};

module.exports.timestamp = getTimestamp;
