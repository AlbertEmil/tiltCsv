"use strict";

const temperatureCelsius = (parsedPeripheral) => {
  return (parsedPeripheral.major - 32) / 1.8;
};

const specificGravity = (parsedPeripheral) => {
  return parsedPeripheral.minor / 1000;
};

const degreePlato = (specGravity) => {
  return (
    -616.868 +
    111.14 * specGravity -
    630.272 * specGravity ** 2 +
    135.997 * specGravity ** 3
  );
};

const calculate = (beacon) => {
  const temperature = temperatureCelsius(beacon);
  const specGravity = specificGravity(beacon);
  const plato = degreePlato(specGravity);
  return {temperature, specGravity, plato};
};

module.exports.calculate = calculate;
