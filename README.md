# OrchidUI for OrchidOS

The user interface and experience of OrchidOS

# Building

To be able to run the user interface, the source code requires Node.js and you have to install the required node dependencies:
```sh
npm install
```

To run the simulator. Run this command and make it go vroom vroom:
```sh
npm start
```

To build the GUI desktop. You could build for the following OSes and architectures with the following commands:

**Linux (OrchidOS Primary)**
```sh
npm run build-linux-x86_64 # x86_64
npm run build-linux-aarch64 # aarch64
npm run build-linux-armv7h # armv7h
```

**Windows**
```sh
npm run build-windows-x86_64 # x86_64
npm run build-windows-aarch64 # aarch64
```

**MacOS**
```sh
npm run build-mac-x86_64 # x86_64
npm run build-mac-aarch64 # aarch64
```

# About
This is one repository of the multiple repositories needed for piecing up the operating system
