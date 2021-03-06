var sendToMultiple, subscriptions;

subscriptions = require('./subscriptions');

module.exports = function(eventTransport, wsTransport, emitter) {
  return eventTransport.listen(function(obj) {
    var cb, send;
    send = wsTransport.event();
    cb = (function() {
      switch (obj.t) {
        case 'all':
          return function(msg) {
            return send.all(msg);
          };
        case 'socketId':
          return function(msg) {
            return send.socketId(obj.socketId, msg);
          };
        case 'channel':
          return function(msg) {
            return sendToMultiple(send, msg, obj.channels, 'channel');
          };
        case 'user':
          return function(msg) {
            return sendToMultiple(send, msg, obj.users, 'user');
          };
      }
    })();
    return emitter.emit('0', obj, {}, cb);
  });
};

sendToMultiple = function(send, msg, destinations, type) {
  destinations = destinations instanceof Array && destinations || [destinations];
  destinations.forEach(function(destination) {
    var set, socketIds;
    set = subscriptions[type];
    if (socketIds = set.members(destination)) {
      return socketIds.slice(0).forEach(function(socketId) {
        if (!send.socketId(socketId, msg, destination)) {
          return set.removeFromAll(socketId);
        }
      });
    }
  });
  return true;
};
