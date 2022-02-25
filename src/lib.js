const statics = require('../static/statics.json');

const isLogable = statics.isDebug || false;
const isEmulatorLog = statics.emulatorLog || false;

const trace = (isDebug, tracer) => {
  if(isDebug !== true) {
    return () => {};
  }
  return (data) => tracer(data)
  
}
const log = trace(isLogable, console.log);
const error = trace(isLogable, console.error);
const emulatorLog = trace(isLogable || isEmulatorLog, console.log)

module.exports = {
  log,
  error,
  emulatorLog,
};