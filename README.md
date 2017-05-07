# monotonic-map

A simple replication protocol for _maps_ to monotonic values.

A _Map_ is also known as a key:value store, for example, javascript `{}` objects.
_Monotonic_ means that the values only go in one direction. I.e. a familiar example is counting. Another example is a Set, if items are never removed.

## overview

This is a very simple replication protocol which was created
as an abstraction of the vector clock exchange in
[scuttlebutt](https://github.com/dominictarr/scuttlebutt)
as intended for use in [scuttlebot](https://github.com/ssbc/scuttlebot) as part of
[epidemic-broadcast-trees](https://github.com/dominictarr/epidemic-broadcast-trees)

Instead of a _clock_ we send a _map_, where we consider
the values to be always increasing (defined by user provided function)

This produces a replication protocol where essentially, one peer
sends the values they have. A peer doesn't need to send a value
if they know the peer already has it. But this also means that
a peer can send the same update back (confirming it), to let the sender know they
received it. (sending this information is implicit in [epidemic-broadcast-trees](https://github.com/dominictarr/epidemic-broadcast-trees), anyway)

If replication is more common than updates, then confirming
the update will save the remote sending it again on the next connection.
But if it's more likely that the value is updated again anyway,
then it would be more efficient to just let it update.

## api

``` js
var MonotonicMap = require('monotonic-map')
```

###  `mm = MonotonicMap(compare(a,b)=>-1|0|1)`

define a `MonotonicMap` around a `compare` function.
`compare` is used to check that the new value for a key is
greater than the current value. see _mm.set_.

### mm.get(key)

returns the current value, if defined.

### mm.set(key, value)

if `compare(value, _value = mm.get(key)) > 0` then `value`
becomes the new value for this key. if `compare` returns 0
then the value is not changed. If it returns < 0, an error is thrown.

### mm.send(peer_id) => map

get a `map` to send to a remote `peer_id`.
`map` will be a serializable representation (.i.e. plain js object) of the state of the current map.

### mm.receive (peer_id, map)

receive `map` from `peer_id`. If any value in the map are greater
than the current values for the local key, then they will be
updated.

## License

MIT








