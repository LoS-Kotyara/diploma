const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

const micCommand = 'arecord -l'

class Music {

  constructor() {
    this.arecordProcess = undefined;
    this.aplayProcess = undefined;
    this.micState = false;
    this.max = { index: -1, value: -1 }

    this.lowerBound = 127;
    this.noisePercent = 0.4;
  }

  execCommand = async (command) => {
    const { stderr } = await exec(command);

    return stderr === '' ? true : false;
  }

  checkStates = async () => {
    try {
      this.micState = await this.execCommand(micCommand)
    } catch (error) {
      console.error(`exec error: ${error}`);
    }
  }

  signalProcessing = (data) => {
    const signal = new Uint16Array(data);
    const tempMax = { index: -1, value: -1 };
    signal.forEach((el, index) => {
      if (el > tempMax.value) {
        tempMax.value = el;
        tempMax.index = index;
      }
    });

    let noisePercent = signal.reduce((acc, value) => {
      if (value === 255) return acc + 1
      return acc
    }, 0) / signal.length;

    if (tempMax.value < this.lowerBound || noisePercent > this.noisePercent) {
      tempMax.value = 0;
      tempMax.index = -1;
    }

    if (tempMax.value > this.max.value) {
      this.max = tempMax
    }
  }

  startMic = () => {
    this.arecordProcess = spawn('arecord', ['-f', 'S8', '-t', 'raw', '-c', '1', '-r41000']);


    this.arecordProcess.stdout.on('data', (data) => {
      this.signalProcessing(data);
    });

    this.aplayProcess = spawn('aplay', ['-', '-f', 'S8', '-t', 'raw', '-c', '1', '-r41000'])

    this.arecordProcess.stdout.pipe(this.aplayProcess.stdin)
  }

  stopMic = () => {
    this.arecordProcess.stdin.pause()
    this.aplayProcess.stdin.pause()

    this.arecordProcess.kill('SIGKILL');
    this.aplayProcess.kill('SIGKILL');
    try {
      exec('pkill arecord -KILL', err => { return })
      exec('pkill aplay -KILL', err => { return })
    }
    catch (err) {
      console.error(err)
    }

    this.arecordProcess = undefined;
    this.aplayProcess = undefined;
  }

  setProcesses = () => {
    if (this.micState && this.arecordProcess === undefined) {
      console.log('Launching arecord...')
      this.startMic();
      console.log('arecord is launched!')
    }

    if (!this.micState && this.arecordProcess !== undefined) {
      console.log('Killing arecord...')
      this.stopMic()
      console.log('arecord is killed')
    }
  }

  start = () => {
    setInterval(async () => {
      await this.checkStates();
      this.setProcesses()
    }, 100)
  }

  getMax = () => {
    const result = this.max;
    this.max = { index: -1, value: -1 };
    return result
  }

  getMicStatus = () => {
    return this.micState
  };

  getLowerBound = () => {
    return this.lowerBound
  }

  getNoisePercent = () => {
    return this.noisePercent
  }

  setLowerBound = (newLowerBound) => {
    if (0 <= newLowerBound && newLowerBound <= 255) {
      this.lowerBound = newLowerBound
    }
  }

  setNoisePercent = (newNoisePercent) => {
    if (0 <= newNoisePercent && newNoisePercent <= 255) {
      this.noisePercent = newNoisePercent
    }
  }
}

module.exports = Music;