# OrchidUI for OrchidOS

The user interface and experience of OrchidOS

[Update 1.0.145 Changelog](UPDATE.md)

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

**macOS**
```sh
npm run build-mac-x86_64 # x86_64
npm run build-mac-aarch64 # aarch64
```

# About
This is one repository of the multiple repositories needed for piecing up the operating system

# Secrets
Any secrets like API keys or tokens should go in `.env` and not `.env.secret`
If people publicly see your secrets. They might do malicious things with your APIs

Heres a template of a `.env` file for you :\)
```ini
# For APIs OpenOrchid uses to work
API_KEY_ORCHID=YOUR_API_KEY_HERE
API_KEY_GTRANSLATE=YOUR_API_KEY_HERE
API_KEY_GMAPS=YOUR_API_KEY_HERE
API_KEY_SAFEBROWSING=YOUR_API_KEY_HERE
API_KEY_WEATHER=YOUR_API_KEY_HERE
# ...

# For Discord RPC
API_KEY_DISCORD=YOUR_API_KEY_HERE
DISCORD_CLIENT_ID=YOUR_CLIENT_ID_HERE
```
