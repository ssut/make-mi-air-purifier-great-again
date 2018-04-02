const Device = require('./device');
const config = require('./config');

const purifiers = [];

const main = async () => {
  const { devices, modes } = config;

  for (const [ name, args ] of Object.entries(devices)) {
    purifiers.push(new Device(name, args.ip, args.mode));
  }
  await Promise.all(purifiers.map(purifier => purifier.connect()));

  // mode can have multiple devices
  modes.forEach(mode => {
    const devices = purifiers.filter(p => p.modeName === mode.name);
    mode.addDevices(...devices);
  });

  await Promise.all(modes.map(mode => mode.loop()));
};

const loop = async () => {
  for (;;) {
    try {
      await main();
    } catch (e) {
      console.error('unexpected error:', e);
    }
    console.log('restarting..');
  }
};

loop()
  .catch(e => console.error(e));
