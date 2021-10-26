"use strict";

const moment = require("moment");

const config = require("./config");

const csvArray = (dataArray) => {
  const arr = dataArray.map((x) => {
    return [`${x.variable} [${x.unit}]`, String(x.value)];
  });
  // const cols = arr.map((x) => x[0]);
  const data = arr.map((x) => x[1]);
  return data;
};

const csvString = (data, sep) => {
  const arr = csvArray(data);
  return arr.join(sep) + "\n";
};

const prettify = (data) => {
  const timestamp = moment().format(config.TIMESTAMP_FORMAT);
  return [
    {
      variable: "timestamp",
      value: timestamp,
      unit: config.TIMESTAMP_FORMAT,
    },
    {
      variable: "temperature",
      value: data.temperature,
      unit: "°C",
    },
    {
      variable: "specific_gravity",
      value: data.specGravity,
      unit: "-",
    },
    {
      variable: "degree_plato",
      value: data.plato,
      unit: "°P",
    },
  ].filter((x) => x.value !== null);
};

module.exports.prettify = prettify;
module.exports.csvString = csvString;
