// Simple Gmail mock for testing

// Use CommonJS syntax for compatibility with Jest and Mocha

if (typeof jest !== "undefined") {
  global.Gmail = {
    Users: {
      Labels: {
        list: jest.fn().mockReturnValue({ labels: [] })
      },
      Messages: {
        list: jest.fn().mockReturnValue({ messages: [] }),
        modify: jest.fn()
      }
    }
  };

  global.GmailApp = {
    sendEmail: jest.fn().mockImplementation((to, subject, body) => {
      return {
        to: to,
        subject: subject,
        body: body,
        status: 'sent'
      };
    }),
    getUserEmail: jest.fn().mockReturnValue('test@example.com'),
    // Add more mocked methods as needed
  };
} else {
  global.Gmail = {
    Users: {
      Labels: {
        list: () => ({ labels: [] })
      },
      Messages: {
        list: () => ({ messages: [] }),
        modify: () => {}
      }
    }
  };

  global.GmailApp = {
    sendEmail: (to, subject, body) => ({
      to: to,
      subject: subject,
      body: body,
      status: 'sent'
    }),
    getUserEmail: () => 'test@example.com',
    // Add more mocked methods as needed
  };
}

// Mock Gmail object
const Gmail = {
  Users: {
    Labels: {
      list: function() {
        // Return an object with a 'labels' array of label objects
        return {
          labels: [
            { id: 'LABEL_1', name: 'sport/hockey', type: 'user' },
            { id: 'LABEL_2', name: 'sport', type: 'user' },
            { id: 'LABEL_3', name: 'Action/Logs', type: 'user' },
            { id: 'LABEL_4', name: 'INBOX', type: 'system' }
          ]
        };
      }
    },
    Messages: {
      list: function(user, opts) {
        // Return an object with a 'messages' array of message objects
        return {
          messages: [
            { id: 'MSG_1' },
            { id: 'MSG_2' }
          ]
        };
      },
      modify: function(request, user, msgId) {
        // Simulate modifying a message (do nothing)
        return true;
      }
    }
  }
};

const listMock = function() {};
listMock.mock = { calls: [] };
listMock.called = false;
const listWrapper = function() {
    listMock.called = true;
    listMock.mock.calls.push(arguments);
    return { labels: [{ id: 'LABEL_1', name: 'TestLabel' }] };
};
listWrapper.mock = listMock.mock;
listWrapper.called = false;

module.exports.Gmail = {
    Users: {
        Labels: {
            list: listWrapper
        },
        Messages: {
            list: function() { return { messages: [] }; },
            modify: function() { return true; }
        }
    }
};

module.exports = { Gmail };