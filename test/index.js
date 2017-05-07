var tape = require('tape')

var MonotonicMap = require('../')

function compare (a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}

function Replicate1(t, alice, bob) {
  return function (ab, ba, _a, _b) {
    var _ab = alice.send('bob')
    t.deepEqual(_ab, ab, 'alice sent to bob')

    var _ba = bob.send('alice')
    t.deepEqual(_ba, ba, 'bob sent to alice')

    t.deepEqual(alice.receive(_ba, 'bob'), _a, 'alice updated from bob')
    t.deepEqual(bob.receive(_ab, 'alice'), _b, 'bob updated from alice')

    t.deepEqual(alice.receive(_b, 'bob'), {})
    t.deepEqual(bob.receive(_a, 'alice'), {})
  }
}

function isEmpty(obj) {
  for(var k in obj)
    return false
  return true
}

function Replicate2(t, alice, bob) {
  return function (ab, ba, _a, _b) {
    var args = [].slice.call(arguments)
    var peers = [alice, bob], names = ['alice', 'bob']
    var data = alice.send('bob'), i = 1
    t.deepEqual(data, args.shift())
    while(!isEmpty(data)) {
      data = peers[i%2].receive(data, names[(i+1)%2], true)
      t.deepEqual(data, args.shift(), 'send:'+i)
      i ++
    }
    t.equal(args.length, 0)
  }
}


tape('simple', function (t) {
  var alice = MonotonicMap(compare)
  var bob = MonotonicMap(compare)
  var replicate = Replicate1(t, alice, bob)

  alice.set('a', 1)
  alice.set('b', 2)
  alice.set('a', 2) //update.
  t.throws(function () {
    alice.set('a', 0)
  })

//  t.deepEqual(alice.send('bob'), {a: 2, b: 2}, 'alice send to bob?')

  console.log('Alice', alice)
  replicate(
    {a: 2, b: 2}, //a->b
    {}, //b->a
    {}, //received by alice
    {a: 2, b: 2} //received by bob
  )

  bob.set('b', 3) //update just one item relative to alice.

//  t.deepEqual(bob.send('alice'), {b: 3})
//  
//  _data = alice.send('bob')
//  t.deepEqual(alice.receive(bob.send('alice'), 'bob'), {b: 3})
//  t.deepEqual(bob.receive(_data, 'alice'), {})

  replicate
  (
    {},
    {b: 3},
    {b: 3},
    {}
  )

  bob.set('c', 7)

  t.deepEqual(bob.send('alice'), {c: 7})
  //bob doesn't actually know for sure that alice has b:3 yet,
  //so it's still in the send set.
  _data = alice.send('bob')
  t.deepEqual(alice.receive(bob.send('alice'), 'bob'), {c:7})
  t.deepEqual(bob.receive(_data, 'alice'), {})


  console.log("Alice", alice)
  console.log('Bob', bob)

  replicate
  (
    {},
    {c: 7},
    {},
    {}
  )

  t.end()
})

tape('reply', function (t) {
  var alice = MonotonicMap(compare)
  var bob = MonotonicMap(compare)
  var replicate = Replicate2(t, alice, bob)

  alice.set('a', 1)

  replicate({a:1}, {a:1}, {})

  alice.set('c', 1)

  replicate({c:1}, {c:1}, {})

  alice.set('a', 2)
  bob.set('b', 1)

  replicate({a:2}, {b:1, a: 2}, {b:1}, {})

  t.end()
})





