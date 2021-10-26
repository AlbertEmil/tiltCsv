"use strict";

const EventEmitter = require("events");
const fs = require("fs");

const { fromEvent } = require("rxjs");
const rfs = require("rotating-file-stream");
const { filter, map, throttleTime } = require("rxjs/operators");

const config = require("./config");
const dataParser = require("./parser");

// const SAMPLING_TIME_MS = 200;
// const CSV_BASE_NAME = "data.csv";
// const CSV_DELIMITER = ";";
// const CSV_OPTIONS = {
//   headers: false,
//   writeHeaders: false,
//   delimiter: ";",
// };

// let runState = null;
// const eventEmitter = new EventEmitter();

// const stream = rfs.createStream(CSV_BASE_NAME, {
//   // TODO: Use compression ?
//   // compress: "gzip",
//   // TODO: Adopt interval
//   interval: "5s",
// });


// setInterval(() => eventEmitter.emit("discover", dummyData()), SAMPLING_TIME_MS);
// setInterval(() => {
//   buttonPressed();
// }, SAMPLING_TIME_MS * 16);

// const incomingData = fromEvent(eventEmitter, "discover");
const result = incomingData.pipe(
  // TODO: Ignore values if not running (runState)
  filter((x) => runState),
  throttleTime(config.THROTTLE_DATA_MS),
  map((x) => dataParser.format(x)),
  map((x) => dataParser.csvArray(x)),
  map((x) => dataParser.csvString(x, CSV_DELIMITER))
);

onStart();

result.subscribe((data) => stream.write(data));
result.subscribe((data) => console.log(data));
