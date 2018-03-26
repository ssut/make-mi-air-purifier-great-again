const config = require('./config.json');

class Mode {

  constructor(name, config) {
    this.name = name;
    this.features = config;
    this.devices = [];
    this._dependents = undefined;
  }

  get dependents() {
    if (this._dependents !== undefined) {
      return this._dependents;
    }

    const depends = Object.values(this.features)
      .reduce((conds, current) => {
        const keys = current.conditions.map(Object.keys);
        conds = conds.concat(keys);
        return conds;
      }, []);

    this._dependents = depends;
    return depends;
  }

  addDevices(...devices) {
    const { dependents } = this;
    devices.forEach(device => {
      device.setMode(this);
      device.subscribe(...dependents);
    });
    this.devices.concat(devices);
  }

}


class Config {

  constructor(config) {
    this.devices = config.devices;
    this.modes = Object.keys(config.modes).reduce((modes, current) => {
      const mode = new Mode(current, config.modes[current]);
      modes.push(mode);
      return modes;
    }, []);
  }

}

module.exports = Object.freeze(new Config(config));
