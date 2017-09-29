var IPFS = require('ipfs'),
    SimplePeer = require('simple-peer');

function repo () {
  return 'ipfs/yjs-demo/' + Math.random()
}

var ipfs = new IPFS({
	repo: repo(),
	EXPERIMENTAL: {
		pubsub: true
	}
});

var connected = false,
	id = null,
	chat = document.getElementById('chat'),
    peerConnected = false,
    ipfsConnected = false,
    peer;

ipfs.on('ready', () => ipfs.id((err, info) => {
	if(err) throw err;
	id = info.id;
	connected = true;
    ipfsConnected = true;
	console.log('got address', info.id);
	ipfs.pubsub.subscribe('room', (msg) => {
        var offer = JSON.parse(msg.data.toString());
        console.log('got offer:', offer);
		if(msg.from.toString() != info.id) {
            peer.signal(offer);
            if(offer.type != 'offer' && offer.type != 'answer') chat.innerHTML = chat.innerHTML + 'peer: ' + offer.toString() + '<br/>';
        }
	});

    peer = new SimplePeer({ initiator: location.hash === '#1', trickle: false });
    peer.on('error', function (err) { console.log('error', err) });

    peer.on('signal', function (data) {
        //chat.innerHTML += '<br/>SIGNAL:' + JSON.stringify(data);
        var checkPeer = setInterval(() => {
            ipfs.pubsub.peers('room', (err, peers) => {
                console.log(peers);
                if(peers.length) {
                    ipfs.pubsub.publish('room', new Buffer(JSON.stringify(data)), (err) => {
                        if(err) console.error(err);
                        clearInterval(checkPeer);
                    });
                }
            });
        }, 1000);
    });

    peer.on('connect', function () {
        connected = true;
        console.log('CONNECT');
    });

    peer.on('data', function (data) {
        chat.innerHTML += '<br/>peer: ' + data;
    });
}));

send = (ev) => {
	if(ev.keyCode == 13) {
		chat.innerHTML += '<br/>me: ' + ev.target.value;
		if(connected) {
			console.log('sent:', ev.target.value);
			peer.send(ev.target.value);
		} else console.log('not connected...');
	}
}
