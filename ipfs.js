var IPFS = require('ipfs'),
    SimplePeer = require('simple-peer'),
    wrtc = require('electron-webrtc')();

function repo () {
  return 'ipfs/yjs-demo/' + Math.random()
}

var ipfs = new IPFS({
	repo: repo(),
    config: { // overload the default IPFS node config
    Addresses: {
      Swarm: [
        '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/'
      ]
    }
  },
	EXPERIMENTAL: {
		pubsub: true
	}
});

var connected = false,
	id = null,
    document = document || null,
    location = location || { hash: null },
	chat = document ? document.getElementById('chat') : { innerHTML: '' },
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
            if(offer.type != 'offer' && offer.type != 'answer') chat.innerHTML += '<br/>peer: ' + offer.toString();
        }
	});
    //ipfs.pubsub.publish('room', new Buffer('hi'), (err) => console.error(err));
    //navigator.getUserMedia({ video: false, audio: true }, (stream) => {  
    //    console.log('got stream');
        peer = SimplePeer.WEBRTC_SUPPORT ? new SimplePeer({ initiator: true, trickle: false }) : new SimplePeer({ initiator: process.argv[2] === 'true', trickle: false, wrtc: wrtc });
        peer.on('error', function (err) { console.log('error', err) });

        peer.on('close', function () { console.log('connection closed...') });

        peer.on('signal', function (data) {
            //chat.innerHTML += '<br/>SIGNAL:' + JSON.stringify(data);
            var checkPeer = setInterval(() => {
                ipfs.pubsub.peers('room', (err, peers) => {
                    console.log(peers);
                    if(!peers.length) {
                        ipfs.pubsub.publish('room', new Buffer(JSON.stringify(data)), (err) => {
                            if(err) console.error(err);
                            //clearInterval(checkPeer);
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

        peer.on('stream', function (stream) {
            // got remote video stream, now let's show it in a video tag 
            var video = document.querySelector('audio')
            video.src = window.URL.createObjectURL(stream)
            video.play()
        });
    //}, (err) => console.error(err));
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