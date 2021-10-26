# TILT Hydrometer @ Carl-Wilhelms-Bräu

Log data from a [TILT Hydrometer](https://tilthydrometer.com/) to CSV files using a Raspberry Pi 3 B+. To handle data a [NodeJS](https://nodejs.org/en/) client based-on [`@abandonware/noble`](https://github.com/abandonware/noble) is used. Incoming is data is streamlined based on [RxJS](https://rxjs.dev/) observables. A user push button to start/stop data recording and status LED are implemented with the [`onoff` package](https://github.com/fivdi/onoff).

## Infrastructure

        +---------------+           +---------------+           +---------------+
        |               |           |               |           |               |
        |     Tilt      | --------> | NodeJS client | --------> |    CSV file   |
        |               |           |               |           |               |
        +---------------+           +---------------+           +---------------+

General information about the software used in this project, as well as its proper installation and configuration can be found in the sections below. The hardware connections for button and LED are:

- Button: GPIO24 (Pin 18 on header J1) and 3V3 (Pin 17 on J1), debouncing is [done in software](https://github.com/fivdi/onoff#debouncing-buttons), internal pull-down resistor is activated by default (see [datasheet, pp. 102/103](http://www.farnell.com/datasheets/1521578.pdf))
- LED: Connected via 68 Ohms to GPIO27 (Pin 13 on J1) and GND (Pin 14 on J1), [calculate appropiate resistor value as needed](https://www.kitronik.co.uk/blog/led-resistor-value-calculator/)

Are general pinout diagram for a Raspberry Pi 3 B/B+ can be found [here](https://pinout.xyz/).

## Comparable projects

A very basic implementation of a NodeJS-based TILT client called can be found [here](https://github.com/mariacarlinahernandez/tilt-hydrometer). The software used on an "orignal" [TILT Pi](https://tilthydrometer.com/products/tilt-pi-raspberry-pi-disk-image-download) is based on [Node-RED](https://nodered.org/) and its [flow is available online](https://flows.nodered.org/flow/0cc3b1d4f7e159800c01c650c30752ae). In addition there are several implementations based on Python like [pytilt](https://github.com/atlefren/pytilt).

## User login and credentials

Package installation and system configuration requires user login on the Raspberry Pi. This can be done locally or remotely via SSH. The default user credentials `pi` / `raspberry` can be used for this, but it is highly recommended to change these credentials. In addition any user credentials stated below are just sample values an should be changed.

## Install Raspbian Lite on SD card or USB drive

Download the latest release of Raspbian Lite from the [Raspbian homepage](https://www.raspberrypi.org/downloads/raspbian/). After the download is completed, flash it onto the SD card or the USB drive using [balenaEtcher](https://www.balena.io/etcher/).

In addition to boot from SD, some of the later Raspberry Pi models support [USB boot](https://www.raspberrypi.org/documentation/hardware/raspberrypi/bootmodes/msd.md) to boot form USB drives such as USB flash drives, HDDs or SSDs. This can be handy due to improved data transfer rates and improved reliability - espcially when working with data-driven applications and interfaces such as databases.

## Basic configuration (before and after first boot)

If you want to access the Raspberry Pi in headless mode (without connecting keyboard, mouse and monitor to the Pi), you need to enable `ssh`. To do so, create an empty file with name `ssh` on the `BOOT` partition of the SD card or USB drive. In addition you can create Wifi credentials (for non-enterprise grade networks) as explained in the [headless docs](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md).

DHCP-based ethernet is enabled by default. However, setting-up a static IP address requires some further work for which you need to mount the main partititon of your SD card or USB drive. For this, a Mac or a Linux computer (or Virtual Machine) is needed. Futher information can be found [here](https://howtoraspberrypi.com/how-to-raspberry-pi-headless-setup/).

Enterprise-grade Wifi networks (such as [`eduroam` at TU Braunschweig](https://doku.rz.tu-bs.de/doku.php?id=netz:wlan:wlan_einrichten_linux)) can be configured after having access to the Raspberry Pi.

## NodeJS-based client for TILT

The TILT hydrometer uses the [iBeacon](https://en.wikipedia.org/wiki/IBeacon) data format which is documented [here](https://kvurd.com/blog/tilt-hydrometer-ibeacon-data-format/) and used to retrieve data from the device. A measurement is done [every five seconds](https://tilthydrometer.com/pages/faqs) and the updated readings are sent via Bluetooth thereafter.

_Remark: During development, it seemed that data is sent nearly every second._

For communications with the Tilt Hydrometer, a NodeJS-based client (written in JavaScript) is used. An implementation of the [iBeacon data format](https://en.wikipedia.org/wiki/IBeacon#Technical_details) for NodeJS can be found in the [`@abandonware/noble` package](https://github.com/abandonware/noble) which is used to communicate with the hydrometer. As the tilt device sends data wrapped in the [BLE `minor` and `major` fields](https://os.mbed.com/blog/entry/BLE-Beacons-URIBeacon-AltBeacons-iBeacon/), parsing the incoming data is required. The data protocol can be found [here](https://kvurd.com/blog/tilt-hydrometer-ibeacon-data-format/). The project [`node-beacon-scanner`](https://github.com/ansgomez/node-beacon-scanner) contains [a parser for the iBeacon format](https://github.com/ansgomez/node-beacon-scanner/blob/master/lib/parser-ibeacon.js) which will be adopted.

In order to make all the measuremtens available for later analysis and visualization, every reading is stored in CSV files. The [`discover`](https://github.com/abandonware/noble#event-peripheral-discovered) event is [used for creating a RxJs observable](https://rxjs.dev/api/index/function/fromEvent). To listen just for the data broadcast by the Tilt Hydrometer and reduce the data rate, any incoming BLE beacon data is filtered first and then downsampled using RxJs' [`filter()`](https://rxjs.dev/api/operators/filter) and [`throttleTime()`](https://rxjs.dev/api/operators/throttleTime) operators. Further data processing is attached to the observable via [RxJs' `map()` operator](https://rxjs.dev/api/operators/map).

_Remark: Incoming data is downsampled, so that other values are ignored and not averaged._

The GPIOs available on header J1 are used to interact with the user push button and LED, the [GPIOs](https://www.raspberrypi.org/documentation/usage/gpio/) (available on header J1) are used. These are accessed via the NodeJS module `onfoff` which additionally provides button interrupts and [software-debounce](https://www.npmjs.com/package/onoff#debouncing-buttons).

### Install required packages, prerequisites and dependencies

1. Update package repositories and install latest packages:

        sudo apt-get update && sudo apt-get upgrade

1. Install additional packages:

        sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev bluez-hcidump libcap2-bin

1. Install latest LTS release of NodeJS as described [here](https://github.com/nodesource/distributions#installation-instructions)

1. Allow `node` processes to access bluetooth devices without bein executed as root:

        sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

### Install files and enable `systemd` service

You can either install all the [required dependencies](license-information-and-module-dependencies) on your own or install all dependencies automatically by calling

        npm install

after you downloaded or cloned all the files from the project's repository into the user `pi`'s home directory (if the user name and user group is different, you need to edit [`tilt.service`](tilt.service)).

In order to execute [`tilt.js`](tilt.js) automatically after the system is booted, a [`systemd`](https://en.wikipedia.org/wiki/Systemd) service file is provided. If you want to use the service, follow these steps:

1. Copy the `.service` file to the appropriate location:

        sudo cp ~/tilt/tilt.service /etc/systemd/system

1. Enable the service to systemd:

        sudo systemctl enable tilt

1. Check the service status to check if it was loaded properly:

        sudo systemctl status tilt

1. Start the service manually (if you do not want to reboot the system):

        sudo systemctl start tilt

### Log files

The `systemd` service logs into the global `syslog`, which can be accessed via `journalctl -u tilt-client`. Some very basic diagnostics (about the `systemd` service) can be obtained from `systemctl` by using `systemctl status tilt`.

### Test and debug Bluetooth connection to Tilt

For testing and debugging the Bluetooth connection to the Tilt Hydrometer, `hcitool lescan` and `hcidump -R` can be used. In addition, to check the BLE-module is working, Nordic Semiconductor's app [`nRF Connect for Mobile`](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp) is handy.

## Issues

Feel free to submit any issues and feature requests using the Issue Tracker.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. In general, we are using a "fork-and-pull" workflow:

1. Fork the repo on GitHub.
1. Clone the project to your own machine.
1. Commit changes to your own branch.
1. Push your work back up to your fork.
1. Submit a Pull request so that we can review your changes.

## License Information and module dependencies

This project is published under the [MIT Licencse](https://choosealicense.com/licenses/mit/). A copy of the license text can be found in [`LICENSE.md`](LICENSE.md).

Direct dependencies, this project depends on, are:

| Module               | license                                                       | Repo                                                    | npm                                                        |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| noble                | [MIT](https://choosealicense.com/licenses/mit/)               | [Link](https://github.com/abandonware/noble)            | [Link](https://www.npmjs.com/package/@abandonware/noble)   |
| onoff                | [MIT](https://choosealicense.com/licenses/mit/)               | [Link](https://github.com/fivdi/onoff)                  | [Link](https://www.npmjs.com/package/onoff)                |
| moment               | [MIT](https://choosealicense.com/licenses/mit/)               | [Link](https://github.com/moment/moment)                | [Link](https://www.npmjs.com/package/moment)               |
| rotating-file-stream | [MIT](https://choosealicense.com/licenses/mit/)               | [Link](https://github.com/iccicci/rotating-file-stream) | [Link](https://www.npmjs.com/package/rotating-file-stream) |
| rxjs                 | [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/) | [Link](https://github.com/ReactiveX/rxjs)               | [Link](https://www.npmjs.com/package/rxjs)                 |
