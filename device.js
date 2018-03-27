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

  async setPower(on) {
    return this.ref.setPower(on);
  }

  async setMode(mode = 'auto', level = null) {
    if (!['auto', 'silent', 'favorite'].includes(mode)) {
      throw new Error(`mode ${mode} is not supported`);
    }
    if (level !== null && (level < 0 || level > 16)) {
      throw new Error(`level must be range from 1 to 16`);
    }

    await this.ref.setMode(mode);
    if (level !== null) {
      await this.ref.setFavoriteLevel(level);
    }

    return true;
  }

  async setLED(enabled) {
    return this.ref.led(enabled);
  }

}

module.exports = Device;
