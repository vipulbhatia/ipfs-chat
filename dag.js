var IPFS = require('ipfs');

var ipfs = new IPFS();

var obj1 = {
	foo: 'bar',
	prev: null
};

var obj2 = {
	foo: 'baz',
	prev: null
}

ipfs.on('ready', () => {
	ipfs.dag.put(obj1, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
		if(err) throw err;
		cid = cid.toBaseEncodedString();
		console.log(cid);
		obj2.prev = cid;
		ipfs.dag.put(obj2, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
			if(err) throw err;
			cid = cid.toBaseEncodedString();
			console.log(cid);
			ipfsDagGetTree(cid, 0);
		});
	});
});

function errOrLog(err, result) {
  if (err) {
    console.error('error: ' + err)
  } else {
    console.log(result.value)
  }
}

ipfsDagPut = (obj) => {
	ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
		if(err) throw err;
		console.log('stored hash for', obj, ':', cid);
	});
}

ipfsDagGetTree = (cid, counter) => {
	if(cid == null) return;
	ipfs.dag.get(cid, (err, result) => {
		console.log('state', counter, ':', result.value);
		++counter;
		ipfsDagGetTree(result.value.prev, counter);
	});
}