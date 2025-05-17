// Simple Logger mock for testing
let logs = [];

const Logger = {
  log: (msg) => logs.push(msg),
  getLogs: () => logs,
  clear: () => { logs = []; }
};

module.exports = Logger;
