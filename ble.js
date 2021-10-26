"use strict";

const parse = (peripheral) => {
  // based on: https://github.com/ansgomez/node-beacon-scanner/blob/master/lib/parser-ibeacon.js
  const data = peripheral.advertisement.manufacturerData;
  if (data.length < 25) {
    return null;
  }
  return {
    uuid: data.slice(4, 20).toString("hex"),
    major: data.slice(20, 22).readUInt16BE(),
    minor: data.slice(22, 24).readUInt16BE(),
    txPower: data.slice(24, 25).readInt8(),
  };
};

module.exports.parse = parse;
