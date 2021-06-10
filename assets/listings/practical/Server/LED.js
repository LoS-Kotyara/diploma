const ws281x = require('rpi-ws281x-native');

const R = 333
const G = 666
const B = 999

class LED {

  constructor(ledsCount = 60) {
    this.LEDS_DRIVER = ws281x;
    this.ledsCount = ledsCount
    this.LEDS_ARRAY = new Uint32Array(this.ledsCount);
    this.brightness = 255;

    this.start();

    this.getColor = this.optionOne;

    this.status = true;
    this.fps = 60;
  }

  /**
   * 
   * @param {number[]} lights 
   * @param {number} newLight 
   * @returns {number[]}
   */
  shiftLights = (lights, newLight) => {
    const centerElement = Math.floor(lights.length / 2);

    let leftLights = [];
    for (let i = 0; i < centerElement - 1; i++) {
      leftLights.push(lights[i + 1]);
    }
    leftLights.push(newLight);

    const rightLights = [];
    for (let i = lights.length - 1; i > centerElement; i--) {
      rightLights.push(lights[i - 1]);
    }
    rightLights.push(newLight);

    return [...leftLights, ...rightLights.reverse()];
  }

  /**
   * 
   * @param {1} index number of the color processing option
   */
  changeOption = (index) => {
    switch (index) {
      case 1:
        this.getColor = this.optionOne;
        break;

      default:
        this.getColor = this.optionOne;
        break;
    }
  }

  /**
   * @param {{index: number, value: number}} max 
   * @description returns color according to the audio tempo
   */
  optionOne = (max) => {
    const { index, value } = max;
    let color = 0;

    const R_perc = 0.5;
    const G_perc = 0.3;
    const B_perc = 0.1;


    if (index > 0) {

      const _R = R_perc > Math.random() ? (Math.abs((index - R)) % value) : Math.floor(Math.random() * 256)

      const _G = G_perc > Math.random() ? (Math.abs((index - G)) % value) : Math.floor(Math.random() * 256)

      const _B = B_perc > Math.random() ? (Math.abs((index - B)) % value) : Math.floor(Math.random() * 256)

      color = (_R << 16) | (_G << 8) | _B;
    };

    return color;
  }

  stop = () => {
    this.LEDS_DRIVER.reset()
    this.status = false;
  };

  start = () => {
    this.status = true
    this.LEDS_DRIVER.init(this.ledsCount, {
      brightness: this.brightness,
      stripType: 'ws2812'
    });
  }

  /**
   * 
   * @param {{index: number, value: number}} maxValue 
   */
  render = (maxValue) => {
    if (this.status) {
        const color = this.getColor(maxValue)
        // console.log({ maxValue })
        this.LEDS_ARRAY = this.shiftLights(this.LEDS_ARRAY, color);
        this.LEDS_DRIVER.render(this.LEDS_ARRAY)
    }
  }

  process = (Music) => {
    let max = Music.getMax();
    setInterval(() => {
      this.render(max);
      max = Music.getMax()
    }, 1000 / this.fps);
  }

  getStripStatus = () => {
    return this.status;
  }

  getBrightness = () => {
    return this.brightness
  }

  getFPS = () => {
    return this.fps
  }

  setBrightness = (brightness) => {
    if (0 <= brightness && brightness <= 255) {      
      this.brightness = brightness
      
      this.stop()
      this.start()
    }
  }

  setFPS = (fps) => {
    if (0 < fps && fps <= 60){
      this.fps = fps
    }
  }
}

module.exports = LED;
