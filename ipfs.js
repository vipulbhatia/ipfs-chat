var IPFS = require('ipfs');

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
	chat = document.getElementById('chat');

ipfs.on('ready', () => ipfs.id((err, info) => {
	if(err) throw err;
	id = info.id;
	connected = true;
	console.log('got address', info.id);
	ipfs.pubsub.subscribe('room', (msg) => {
		if(msg.from.toString() != info.id) chat.innerHTML = chat.innerHTML + 'peer: ' + msg.data.toString() + '<br/>';
	});
}));

send = (ev) => {
	if(ev.keyCode == 13) {
		chat.innerHTML = chat.innerHTML + 'me: ' + ev.target.value + '<br/>';
		if(connected) {
			console.log('sent:', ev.target.value);
			ipfs.pubsub.publish('room', new Buffer(ev.target.value), (err) => {
				if(err) console.error(err);
			});
		} else console.log('not connected...');
	}
}