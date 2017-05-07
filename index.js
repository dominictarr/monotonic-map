
function copy (obj) {
  var o = {}
  for(var k in obj) o[k] = obj[k]
  return o
}

module.exports = function (compare) {

  var store = {}
  var peers = {}

  return {
    set: function (key, value) {
      if(store[key] == null)
        return store[key] = value
      var c = compare(value, store[key])
      if(c > 0)
        store[key] = value
      else if (c < 0)
        throw new Error('tried to set old value')
    },
    get: function (key) {
      return store[key]
    },
    send: function (peer) {
      if(!peers[peer]) {
        console.log('COPY TO', peer, store)
        return copy(store)
      }
      else {
        var send = {}
        for(var k in store) {
          var value = store[k], _value = peers[peer][k]
          if(_value == null || compare(value, _value) > 0)
            send[k] = value
        }
        return send
      }
    },
    receive: function (map, peer, response) {
      peers[peer] = peers[peer] || {}
      var changes = {}
      for(var k in map) {
        if(store[k] == null || compare(map[k], store[k]) > 0)
          changes[k] = store[k] = map[k]
        peers[peer][k] = map[k]
      }
      if(response)
        //check if we have something missing from peer.
        for(var k in store) {
          if(peers[peer][k] == null || compare(store[k], peers[peer][k]))
            changes[k] = store[k]
        }
      return changes
    },
    store: store,
    peers: peers
  }
}

