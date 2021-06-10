const WebSocketServer = require('websocket').server;
const http = require('http');

class WS {
  /**
   * 
   * @param {LED} LED 
   * @param {Music} Music 
   */
  constructor(LED, Music) {
    this.ws = null
    this.LED = LED;
    this.Music = Music;
  }

  /**
   * 
   * @returns {{
   * general: {
   *  wss: boolean,
   *  strip: boolean,
   *  microphone: boolean,
   * },
   * strip: {
   *  brightness: number,
   *  fps: number
   * },
   * microphone: {
   *  lowerBound: number,
   *  noisePercent: number
   * }
   * }}
   */
  getSensorsData = () => {
    return {
      general: {
        wss: true,
        strip: this.LED.getStripStatus(),
        microphone: this.Music.getMicStatus()
      },
      strip: {
        brightness: this.LED.getBrightness(),
        fps: this.LED.getFPS()
      },
      microphone: {
        lowerBound: this.Music.getLowerBound(),
        noisePercent: this.Music.getNoisePercent()
      }
    }
  }

  /**
   * 
   * @param {connection} connection 
   */
  sendSensorsData = (connection) => {
    const json = this.getSensorsData();
    connection.sendUTF(JSON.stringify(json))
  }

  /**
   * 
   * @param {{
   * general: {
   *  wss: boolean,
   *  strip: boolean,
   *  microphone: boolean,
   * },
   * strip: {
   *  brightness: number,
   *  fps: number
   * },
   * microphone: {
   *  lowerBound: number,
   *  noisePercent: number
   * }
   * }} payload 
   */
  getNewSensorsData = (payload) => {
    const state = this.getSensorsData();

    /* On/off strip */
    if (state.general.strip !== payload.general.strip) {
      console.log(payload.general.strip);
      payload.general.strip ? this.LED.start() : this.LED.stop();
    }

    /* On/off mic */
    /* No func */

    /* Set brightness */
    console.log(payload)
    if (state.strip.brightness !== payload.strip.brightness) {
      this.LED.setBrightness(payload.strip.brightness)
    }

    /* Set fps */
    if (state.strip.fps !== payload.strip.fps) {
      this.LED.setFPS(payload.strip.fps)
    }

    /* Set lower bound */
    if (state.microphone.lowerBound !== payload.microphone.lowerBound) {
      this.Music.setLowerBound(payload.microphone.lowerBound)
    }

    /* Set noise percent */
    if (state.microphone.noisePercent !== payload.microphone.noisePercent) {
      this.Music.setNoisePercent(payload.microphone.noisePercent)
    }


  }

  connect = (port = 8000) => {
    const server = http.createServer(function (request, response) {
      console.log((new Date()) + ' Received request for ' + request.url);
      response.writeHead(404);
      response.end();
    });

    server.listen(port, function () {
      console.log((new Date()) + ' Server is listening on port ' + port);
    });

    this.ws = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
    });


    this.ws.on('request', (request) => {
      console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');
      const connection = request.accept(null, request.origin);

      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          const dataFromClient = JSON.parse(message.utf8Data)
          if (dataFromClient.type === 'get') {
            this.sendSensorsData(connection)
          }

          if (dataFromClient.type === 'set') {
            const payload = dataFromClient.payload;
            this.getNewSensorsData(payload);
            this.sendSensorsData(connection);
          }
        }
      });

      connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
    });
  }
}

module.exports = WS;
