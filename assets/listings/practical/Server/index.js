/*       Imports and constants      ***********************/

const Music = new (require('./music'));
const LED = new (require('./LED'))(60);
const Server = new (require('./server'))(LED, Music);

/**********************************************************/


/*       Main process                         *************/

Server.connect();
Music.start()
LED.process(Music)

/**********************************************************/


/*       Capture halt signal       ************************/

console.log('Press <ctrl>+C to exit.');

process.on('SIGINT', function () {
  LED.stop()
  process.nextTick(function () { process.exit(0); });
});

/**********************************************************/
