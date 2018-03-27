// TODO: separate all classes

const sleep = require('sleep-promise');
const { DateTime } = require('luxon');

const Condition = require('./condition');
const Device = require('./device');
const config = require(`${process.cwd()}/config.json`);

class Mode {

  constructor(name, config) {
    this.name = name;
    this.features = config;
    this.interval = config.interval || 1000;
    this.devices = [];
    this._dependents = undefined;
  }

  get dependents() {
    if (this._dependents !== undefined) {
      return this._dependents;
    }

    let depends = Object.keys(this.features)
      .reduce((conds, key) => {
        const current = this.features[key];
        if (current.conditions === undefined) {
          return conds;
        }

        const keys = current.conditions.map(Object.keys);
        conds = conds.concat(...keys, key);
        return conds;
      }, [])
      .filter(feature => Device.FEATURES.includes(feature));
    depends = Array.from(new Set(depends));

    this._dependents = depends;
    return depends;
  }

  addDevices(...devices) {
    const { dependents } = this;
    devices.forEach(device => {
      device.setParentMode(this);
      device.setPollingInterval(this.interval);
      device.subscribe(...dependents);
    });
    this.devices = this.devices.concat(devices);
  }

  get actions() {
    const actions = Object.keys(this.features)
      .reduce((acts, feature) => {
        if (this.features[feature].conditions === undefined) {
          return acts;
        }

        const { action, conditions } = this.features[feature];
        const conds = conditions
          .map(cond => ({ action: cond.action, testers: Condition.fromConfig(cond), feature }));
        acts.push({
          feature,
          action,
          conditions: conds,
        });

        return acts;
      }, []);

      return actions;
  }

  get defaults() {
    return Object.keys(this.features).reduce((defaults, current) => {
      if (this.dependents.includes(current)) {
        defaults[current] = [this.features[current].default] || null;
      }
      return defaults;
    }, {});
  }

  async loop() {
    const { actions, defaults, dependents } = this;
    const form = dependents
      .filter(item => Device.CHANGABLES.includes(item))
      .reduce((previous, current) => ({ ...previous, [current]: null }), {});

    for (;;) {
      // better ideas?
      // load all device information from depdents
      const time = DateTime.local();
      const devices = await Promise.all(this.devices.map(async (device) => ({
        device,
        data: {
          ...device.stats,
          time,
        },
      })));

      // try to match
      for (const info of devices) {
        const { device, data } = info;
        const changes = { ...form };

        for (const action of actions) {
          const { conditions, feature } = action;

          for (const condition of conditions) {
            const tests = condition.testers.map(tester => tester.test(data));
            const yet = tests.some(result => result === null);
            if (yet === true) {
              delete changes[feature];
              continue;
            }

            const passed = tests.every(result => result === true);
            if (passed === true) {
              changes[feature] = condition;
            }
          }
        }

        // apply changes
        const promises = [];
        for (const [feature, condition] of Object.entries(changes)) {
          const next = condition !== null ? condition.action : null;

          if (next === null && defaults[feature] !== null && data[feature] !== defaults[feature]) {
            promises.push(device.update(feature, ...defaults[feature]));
          } else {
            promises.push(device.update(feature, ...next));
          }
        }

        await Promise.all(promises);
      }

      await sleep(this.interval);
    }
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
