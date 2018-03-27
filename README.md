# MAKE MI AIR PURIFIER GREAT AGAIN

![](https://i.imgur.com/xX2nuH3.png)

Mi Air Purifier was not great its auto rule for PM2.5 is so INSENSITIVE that it will not act even when AQI > 50. I think this is a perfect solution that will make your air purifier *really* smarter.

(한국어) 샤오미 공기청정기는 굉장히 멍청하게 작동하기 때문에 똑똑하게 만들어주는 것이 이 프로젝트의 목표입니다.

## What this can do

- control multiple devices at the same time
- microcontrol fan speed by PM2.5 level, what the device did not do
- turn on/off the device by conditions
- turn on/off the LED by conditions

### so what conditions are supported

- AQI (aka. PM2.5 level)
- Time (Hours and minutes)
- Temperature/Humidity (I think most of the time you don't need this)

## Limitations

- This application does not support live updating device information because I think there is a front cache in the device endpoint so you need to set interval time to more than 1s.
- (한국어) 샤오미 공기청정기가 라이브 데이터를 제공 안합니다. 그래서 몇 초마다 데이터를 가져오는 방법을 써야합니다. 설정에 인터벌이 있는데 이걸 1초 이상으로 두시면 됩니다. 어차피 계속 긁어와봐야 캐시때문에 실시간값이 나오지 않기 때문에 한 10초 정도로 두는 것이 안정적인 것 같습니다.

## Getting started

1. First you need to clone this repo and then just `npm i`.
2. Rename `config.example.json` to `config.json`.
3. Update configurations and run by `node .`.

#### Configurations

I think the config file is so intuitive that I don't need to explain about it. You just need to update the IP address:

![](https://imgur.com/WJarRNk.png)

## License

This is an open source project licensed under the MIT license.

