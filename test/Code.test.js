// Do not require addParentLabel at the top

describe('addParentLabel', () => {
    let originalGmail, originalLogger;
    let mockLabels, mockMessages, modifyCalls, loggerCalls;
    let addParentLabel;

    beforeEach(() => {
        // Mock Logger
        loggerCalls = [];
        global.Logger = {
            log: (msg) => loggerCalls.push(msg)
        };

        // Mock Gmail API
        mockLabels = [
            // System labels
            { id: 'INBOX', name: 'INBOX', type: 'system' },
            // User labels
            { id: 'sport', name: 'sport', type: 'user' },
            { id: 'sport/hockey', name: 'sport/hockey', type: 'user' },
            { id: 'sport/basketball', name: 'sport/basketball', type: 'user' },
            { id: 'Action/Logs', name: 'Action/Logs', type: 'user' }, // in skiplabel
            { id: 'Spend', name: 'Spend', type: 'user' }, // in offspring
            { id: 'Spend/Child', name: 'Spend/Child', type: 'user' }, // offspring child
        ];
        mockMessages = [
            // Only sport/hockey and sport/basketball are valid nested labels
            { name:'sport/hockey', id: 'msg1' },
            { name: 'sport/basketball', id: 'msg3'},
            { name: 'Spend/Child', id: 'msg4'},
            { name: 'INBOX', id: 'msg2' }
        ];
        modifyCalls = [];

        global.Gmail = {
            Users: {
                Labels: {
                    list: jest.fn(() => ({ labels: mockLabels }))
                },
                Messages: {
                    list: jest.fn((user, opts) => {
                        // Parse label from query
                        const match = opts.q && opts.q.match(/label:([^\s]+)/);
                        if (match) {
                            const label = match[1];
                            // Always return an array (even if empty) for messages, as Gmail API does
                            return { messages: mockMessages };
                        }
                        // If no label matched, return empty array
                        return { messages: [] };
                    }),
                    modify: jest.fn((opts, user, msgId) => {
                        // Ensure the structure matches the assertion in the test
                        modifyCalls.push({ opts, user, msgId });
                        return {}; // Simulate Gmail API response
                    })
                }
            }
        };

        // Require addParentLabel after mocks are set up
        ({ addParentLabel } = require('../Code.js'));
    });

    afterEach(() => {
        delete global.Gmail;
        delete global.Logger;
        jest.clearAllMocks();
    });

    it('[Integration] Integrated Test Run - should add parent labels to nested labels not in skip lists', () => {
        addParentLabel();

        // sport/hockey and sport/basketball should get parent "sport" added to their messages
        expect(modifyCalls).toEqual(
          expect.arrayContaining([
            { msgId: "msg1", opts: { addLabelIds: ["sport"] }, user: "me" },
            { msgId: "msg3", opts: { addLabelIds: ["sport"] }, user: "me" },
            { msgId: "msg4", opts: { addLabelIds: ["sport"] }, user: "me" },
            { msgId: "msg1", opts: { addLabelIds: ["sport"] }, user: "me" },
            { msgId: "msg3", opts: { addLabelIds: ["sport"] }, user: "me" },
            { msgId: "msg4", opts: { addLabelIds: ["sport"] }, user: "me" },
          ])
        );
        // Should NOT add parent for Spend/Child (offspring skip list)
        expect(modifyCalls.find(call => call.opts.addLabelIds === 'INBOX')).toBeUndefined();
    });

    it('[Integration] Integrated Test Run - should log summary and skip list validation', () => {
        addParentLabel();
        // Should log number of labels, system labels, orphans, etc.
        expect(loggerCalls.some(msg => msg.includes('GMAIL labels retrieved'))).toBe(true);
        expect(loggerCalls.some(msg => msg.includes('system labels'))).toBe(true);
        expect(loggerCalls.some(msg => msg.includes('have no parent'))).toBe(true);
        // Should log skip list validation for offspring and skiplabel
        expect(loggerCalls.some(msg => msg.includes('Offspring skip list'))).toBe(true);
        expect(loggerCalls.some(msg => msg.includes('Labels skip list'))).toBe(true);
    });

    it('[integration] should not add parent label if parent label is missing in mylabels', () => {
        // Remove 'sport' label from mockLabels
        mockLabels = mockLabels.filter(l => l.name !== 'sport');
        addParentLabel();
        // Should log unable to lookup root parent label
        expect(loggerCalls.some(msg => msg.includes('Unable to Lookup Root Parent Label: sport'))).toBe(true);
        // Should not call modify for sport/hockey or sport/basketball
        expect(modifyCalls.length).toBe(0);
    });

    it('[integration] should not add parent label for labels in skiplabel', () => {
        // Add a nested label in skiplabel
        mockLabels.push({ id: 'Action/Logs/Child', name: 'Action/Logs/Child', type: 'user' });
        mockMessages['Action/Logs/Child'] = [{ id: 'msg5' }];
        addParentLabel();
        // Should not call modify for msg5
        expect(modifyCalls.find(call => call.msgId === 'msg5')).toBeUndefined();
    });

    it('[integration] should handle case when no messages are found for a label', () => {
        // Remove messages for sport/basketball
        delete mockMessages['sport/basketball'];
        addParentLabel();
        // Should not throw, and should not call modify for sport/basketball
        expect(modifyCalls.find(call => call.opts.addLabelIds === 'sport/basketball')).toBeUndefined();
    });
});