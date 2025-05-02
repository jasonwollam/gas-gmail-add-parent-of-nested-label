const { Gmail } = require('../__mocks__/Gmail');
global.Gmail = Gmail;
const Logger = require('../__mocks__/Logger');
const { getPadding } = require('../Code.js');


test('should log a message', () => {
    Logger.clear();
    Logger.log('Test message');
    expect(Logger.getLogs()).toContain('Test message');
});

test('getPadding returns correct padding', () => {
  expect(getPadding(['a', 'abc'], 2)).toBe(5);
});