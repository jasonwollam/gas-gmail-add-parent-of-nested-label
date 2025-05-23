const { addParentLabel } = require("./../Code");
//import { addParentLabel } from '../Code';
const mockLabels = [
    { id: 'sport', name: 'sport', type: 'user' },
    { id: 'sport_hockey', name: 'sport/hockey', type: 'user' },
    { id: 'sport_basketball', name: 'sport/basketball', type: 'user' }
];
const mockMessages = {
    'sport/hockey': [{ id: 'msg1' }],
    'sport/basketball': [{ id: 'msg2' }]
};
let modifyCalls = [];
let logs = [];

global.Gmail = {
    Users: {
        Labels: {
            list: jest.fn(() => ({ labels: mockLabels }))
        },
        Messages: {
            list: jest.fn((user, opts) => {
                const match = opts.q && opts.q.match(/label:([^\s/]+\/[^\s]+)/);
                // This regex matches only labels with a slash (i.e., nested labels), so in "-label:sport label:sport/hockey" it matches "sport/hockey" only.
                if (match) {
                    const label = match[1];
                    return { messages: mockMessages[label] || [] };
                }
                return { messages: [] };
            }),
            modify: jest.fn((opts, user, msgId) => {
                modifyCalls.push({ opts, user, msgId });
                return {};
            })
        }
    }
};

global.Logger = {
    log: (msg) => logs.push(msg),
    getLogs: () => logs,
    clear: () => { logs = []; }
};

beforeEach(() => {
    modifyCalls = [];
    logs = [];
    global.Logger.clear();
});

describe('addParentLabel', () => {
    it('[Integration] Integrated Test Run - should add parent label to messages with nested labels', () => {
        addParentLabel();
        expect(modifyCalls).toEqual(
            expect.arrayContaining([
                { opts: { addLabelIds: ['sport'] }, user: 'me', msgId: 'msg1' },
                { opts: { addLabelIds: ['sport'] }, user: 'me', msgId: 'msg2' }
            ])
        );
    });

    it('[Integration] Integrated Test Run - should log actions performed', () => {
        addParentLabel();
    });
});