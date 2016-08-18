var _ = require('lodash');
WGo.Board.drawHandlers.FLAT = {
	stone: {
		draw: function (args, board) {
			var xr = board.getX(args.x);
			var yr = board.getY(args.y);
			var sr = board.stoneRadius - 0.5;

			if (args.c === WGo.W) {
				this.fillStyle = 'hsl(0, 0%, 95%)';
			} else {
				this.fillStyle = 'hsl(0, 0%, 20%)';
			}

			this.beginPath();
			this.arc(xr, yr, Math.max(0, sr), 0, 2 * Math.PI, true);
			this.fill();
		}
	}
};


var elem = document.getElementById('sgf-player');
console.log('elem', elem);
var player = new WGo.BasicPlayer(elem, {
	sgfFile: '/sgf/hashimoto_utaro-iwamoto_kaoru.sgf',
	move: 150,
	enableWheel: false,
	board: {
		stoneHandler: WGo.Board.drawHandlers.FLAT,
		width: '100%'
	},
	layout: {}
});

var previousScrollY = window.scrollY;
window.onscroll = _.throttle(function (event) {
	console.log('scroll', event);
	console.log('window.scrollY', window.scrollY);
	if (window.scrollY > previousScrollY) {
		player.next();
	} else {
		player.previous();
	}
	previousScrollY = window.scrollY;
}, 50);
