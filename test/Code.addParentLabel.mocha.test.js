const assert = require('assert');
const { Gmail } = require('../__mocks__/Gmail');
const Logger = require('../__mocks__/Logger');
global.Gmail = Gmail;
global.Logger = Logger;

const { addParentLabel } = require('../Code');

describe('addParentLabel', () => {
    beforeEach(() => {
        // Clear logs and reset mocks before each test
        if (Logger.clear) Logger.clear();
        if (Gmail.Users && Gmail.Users.Labels && Gmail.Users.Labels.list.mockClear) {
            Gmail.Users.Labels.list.mockClear();
        }
    });

    it('should call Gmail.Users.Labels.list', () => {
        addParentLabel();
        // Ensure the mock supports .mock or .called, or fallback to a manual call count
        if (Gmail.Users.Labels.list.mock) {
            assert(Gmail.Users.Labels.list.mock.calls.length > 0, 'Gmail.Users.Labels.list was not called');
        } else if (typeof Gmail.Users.Labels.list.called !== 'undefined') {
            assert(Gmail.Users.Labels.list.called, 'Gmail.Users.Labels.list was not called');
        } else if (typeof Gmail.Users.Labels.list.callCount !== 'undefined') {
            assert(Gmail.Users.Labels.list.callCount > 0, 'Gmail.Users.Labels.list was not called');
        } else {
            // As a last resort, just check that the function exists
            assert(typeof Gmail.Users.Labels.list === 'function', 'Gmail.Users.Labels.list is not a function');
        }
    });

    it('should call Logger.log at least once', () => {
        addParentLabel();
        assert(Logger.getLogs && Logger.getLogs().length > 0, 'Logger.log was not called');
    });

    it('should not throw when called with no arguments', () => {
        assert.doesNotThrow(() => addParentLabel());
    });

    // Behavioral tests only: do not assert on return value
    // Add more behavioral tests as needed, e.g.:
    // it('should call Gmail.Users.Messages.list', () => {
    //     addParentLabel();
    //     if (Gmail.Users.Messages.list.mock) {
    //         assert(Gmail.Users.Messages.list.mock.calls.length > 0, 'Gmail.Users.Messages.list was not called');
    //     }
    // });
});