"use strict";

const fs = require("fs");

const noble = require("@abandonware/noble");
const Gpio = require("onoff").Gpio;
const { fromEvent } = require("rxjs");
const { filter, map, throttleTime } = require("rxjs/operators");
const rfs = require("rotating-file-stream");

const ble = require("./ble");
const calculator = require("./calculator");
const config = require("./config");
const file = require("./file");
const parser = require("./parser");
const utils = require("./utils");

let runState = null;

const button = new Gpio(config.BUTTON_PIN, "in", "rising", {
  debounceTimeout: config.BUTTON_DEBOUNCE_MS,
});

const led = new Gpio(config.LED_PIN, "out");

const setLedState = () => led.writeSync(Number(runState));

const buttonPressed = () => {
  runState = !runState;
  saveRunState();
  setLedState();
};

const loadRunState = () => {
  try {
    const rawdata = fs.readFileSync("runState.json");
    runState = JSON.parse(rawdata).isRunning;
    console.log("Run state loaded: ", runState);
  } catch (_) {
    runState = false;
    console.log("Run state was not saved. Set state to: ", runState);
  }
};

const saveRunState = () => {
  const data = JSON.stringify({
    changedAt: utils.timestamp("YYYYMMDD-HHmmss"),
    isRunning: runState,
  });
  fs.writeFileSync("runState.json", data);
  console.log("Run state saved: ", runState);
};

(async () => {
  console.log("Tilt client started");

  loadRunState();
  setLedState();

  const incomingData = fromEvent(noble, "discover").pipe(
    filter((_) => runState),
    filter((x) => x.uuid == config.TILT_RED_ADDRESS),
    throttleTime(config.THROTTLE_DATA_MS),
    map((x) => ble.parse(x)),
    map((x) => calculator.calculate(x)),
    map((x) => parser.prettify(x)),
    map((x) => parser.csvString(x))
  );

  incomingData.subscribe((data) => file.writeCsvData(data));
  incomingData.subscribe((data) => console.log(data));

  // scan for all devices, allow duplicates (as we need to receive new data continously)
  // unable to filter by UUID as noble filters by serviceUUID not by BeaconUUID
  noble.startScanning([], true);

  button.watch(async (err, value) => {
    if (err) {
      console.log(err);
    }
    buttonPressed();
  });

  process.on("SIGINT", () => {
    noble.stopScanning();
    led.unexport();
    button.unexport();
  });
})();
