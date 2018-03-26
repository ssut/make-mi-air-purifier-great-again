const miio = require('miio');
const { EventEmitter } = require('events');

class Device extends EventEmitter {

  constructor(name, ip, mode) {
    this.ref = null;
    this.mode = null;
    this.name = name;
    this.ip = ip;
    this.modeName = mode;

    this.stats = { aqi: -1, temperature: -1, humidity: -1 };
  }

  setMode(mode) {
    this.mode = mode;
  }

  get connected() {
    return this.ref !== null;
  }

  async connect() {
    const address = this.ip;

    this.ref = await miio.device({ address });
    if (!this.ref.matches('type:air-purifier')) {
      throw new Error(`Not an air purifier given: ${address}`);
    }

    return true;
  }

  async subscribe(...features) {
    if (features.includes('aqi')) {
      this.ref.on('pm2.5Changed', aqi => {
        this.stats.aqi = aqi;
        this.emit('aqi', aqi);
      });
    }
    if (features.includes('temperature')) {
      // TODO: temperature observer
    }
    if (features.includes('humidity')) {
      // TODO: humidity observer
    }

    return true;
  }

  async temperature() {
    return this.ref.temperature();
  }

  async humidity() {
    return this.ref.humidity();
  }

}

module.exports = Device;
