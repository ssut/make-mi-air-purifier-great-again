const miio = require('miio');

const Device = require('./device');
const config = require('./config');

const purifiers = [];

const main = async () => {
  const { discover, devices, modes } = config;
  // collect only IP addresses (to be used in auto discovering)
  const deviceIPs = Object.values(devices).map(device => device.ip);

  // TODO: separate codes
  if (discover.enabled === true && discover.mode !== '') {
    const browser = miio.browse();
    browser.on('available', reg => {
      const { address, token, model, hostname } = reg;
      if (address && token && model && model.includes('airpurifier') && !deviceIPs.includes(address)) {
        const device = new Device(hostname, address, discover.mode);
        device.connect()
          .then(() => modes.find(mode => mode.name === discover.mode).addDevices(device))
          .then(() => console.info(String(new Date), `Device added: ${address} (mode: ${discover.mode})`));
      }
    });
  }

  // TODO: use proxy to observe object changes
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
