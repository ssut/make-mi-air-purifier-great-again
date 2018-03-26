const Device = require('./device');
const config = require('./config');

const purifiers = [];

const main = async () => {
  const { devices, modes } = config;

  for (const [ name, args ] of Object.entries(devices)) {
    purifiers.push(new Device(name, args.ip, args.mode));
  }
  await Promise.all(purifiers.map(purifier => purifier.connect()));

  modes.forEach(mode => {
    const devices = purifiers.filter(p => p.mode === mode.name);
    mode.addDevices(...devices);
  });

};

main()
  .catch(e => console.error(e));
