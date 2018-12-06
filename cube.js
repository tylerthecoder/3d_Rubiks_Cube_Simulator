class C {
	constructor() {
		this.settings = {
			timer:2, //0 means none, 1 means lesiure time, 2 means competition timer
			opaque:true, //toggles on and off the opacity
			turnSpeed:0.1,
			scrammbleSpeed:0.05,
			animate: true,
			cubeSize: 100
		}
		this.xDeg = 155;
		this.yDeg = 115;
		this.zDeg = 0;
		this.html = document.getElementById("cube");
		this.face = document.getElementById("theFace");
		this.inFace = [];
		this.p = [];
		this.state = "idle"
		this.scrambleTimer = 0;
		this.timer = 0;
		this.startTime = new Date();
		this.endTime = new Date();
		this.n = 2;

		this.queue = [];

		const n = this.n
		this.moves = {
			"i": ['x', [1], 1],  // R
			"k": ['x', [1], -1], // R'
			"j": ['z', [1], 1],  // U
			"f": ['z', [1], -1], // U'
			"h": ['y', [1], 1],  // F
			"g": ['y', [1], -1], // F'
			"d": ['x', [n], 1],  // L
			"e": ['x', [n], -1], // L'
			"s": ['z', [n], 1],  // D
			"l": ['z', [n], -1], // D'
			"w": ['y', [n], 1],  // B
			"o": ['y', [n], -1], // B'
			"8": ['x', [2], 1],  // M
			"n": ['y', [2], 1],  // E
			"-": ['z', [2], 1],  // S
			"y": ['x', [1,2,3], 1],  // X
			"b": ['x', [1,2,3], -1], // X'
			";": ['z', [1,2,3], 1],  // Y
			"a": ['z', [1,2,3], -1], // Y'
			"p": ['y', [1,2,3], 1],  // Z
		}

		this.faces = {
			x: new Face('x', this.n, ['red', 'orange'], this),
			y: new Face('y', this.n, ['blue', 'green'], this),
			z: new Face('z', this.n, ['yellow', 'white'], this)
		}

		document.body.onkeydown = (event) => { this.handleKeys(event) };
	}

	generate () {
		let count = 0;
		this.html.innerHTML = "<div id='theFace'></div>";
		const indices = [0, 0, 0];

		const faces = Object.values(this.faces)
		const faceNames = Object.keys(this.faces)

		let failsafe = 0;
		mainLoop:
		while(indices[0] < 10) {
			if (failsafe++ > 1000) break;
			const f = [];
			const colors = [];
			//const stickers = [];
			for (let i in faces) {
				if (indices[i] >= faces[i].depth) {
					// we are on the last index of the last thing
					if (i == faces.length-1) break mainLoop;
					indices[i] = 0;
					indices[Number(i)+1]++;
				}
				if (faces[i].isEdge(indices[i])) {
					f.push(faceNames[i]);
					colors.push(faces[i].getColor(indices[i]))
				}
			}
			if (colors.length === 0) {
				indices[0]++;
				continue;
			}
			this.html.innerHTML += `<cubie id='cubie${count}'></cubie>`;
			const piece = new p(colors, f, count, this, {
				x: indices[0],
				y: indices[1],
				z: indices[2]
			});
			this.p.push(piece);
			count++;
			indices[0]++;
		}

		this.draw(false);
	}

	draw(bool) {
		this.html.style.transform = "rotateX(" + this.xDeg + "deg)rotateY(" + this.yDeg + "deg)rotateZ(" + this.zDeg + "deg)";
		if (bool) return 0; //pass in true if you dont want to render the pieces
		this.p.forEach(p => p.draw());
	}

	turn (t) {
		// ['Y', [1], 1]
		const [ cFace, cDepths, cDirection ] = t;
		const f = this.faces[cFace.toLocaleLowerCase()];

		// using slice to copy the swaps
		const swaps = f.swaps.slice(0);
		if (cDirection === -1) {
			swaps.reverse()
		}
		let angle = cDirection == 1 ? 90 : -90;

		// dont know why this is necessary!!
		if (cFace == "y") angle *= -1;

		//put the pieces in a face, turn that face, draw the new position of the pieces, then destroy the face.
		if (this.settings.animate) this.draw(false);

		for (let i of this.inFace) {
			this.html.appendChild(document.getElementById("cubie" + i));
		}

		const face = document.getElementById("theFace")

		face.style.transition = "transform 0s";
		face.style.transform = "";

		// get all the pieces on all the faces that are sent in the request
		this.inFace = cDepths.flatMap(depth => {
			const other = [];
			for (let i in this.p) {
				const piece = this.p[i];
				if (piece.pos[cFace.toLocaleLowerCase()] === depth - 1) {
					other.push(i);
				}
			}
			return other;
		})

		for (const pieceIndex of this.inFace) {
			face.appendChild(document.getElementById("cubie" + pieceIndex))
			this.p[pieceIndex].rotate(swaps, t)
		}
		setTimeout(() => {
			if (this.settings.animate) {
				face.style.transition = "transform " + ((this.state == "scrammbling") ? this.settings.scrammbleSpeed:this.settings.turnSpeed) + "s"
				face.style.transform = "rotate" + f.axis + "(" + angle + "deg)";
			}
		},1)
	}

	scramble() {
		let times = 0;
		let allTheMoves = [];
		for (let i in this.turns) {
			if (!this.turns[i].turn && !this.turns[i].middle) allTheMoves.push(this.turns[i])
		}
		this.state = "scrammbling";

		this.scrambleTimer = setInterval(() => {
			let index = Math.floor(Math.random() * allTheMoves.length);
			this.turn(allTheMoves[index]);
			times++;
			if (times >= 50) {
				clearInterval(this.scrambleTimer);
				this.state = (this.settings.timer == 2) ? "scrammbled":"idle";
			}
		}, 60);
	}

	isSolved () {
		let ledger = {};
		for (let i of this.p) {
			for (let j in i.faces){
				if (ledger[i.faces[j]] === undefined) {
					ledger[i.faces[j]] = i.stickers[j];
				}else if (ledger[i.faces[j]] !== i.stickers[j]){
					return false;
				}
			}
		}
		return true;
	}

	startTimer () {
		this.startTime = new Date();
		this.state = "timerRunning";
		this.timer = setInterval(() => {
			if (this.state == "timerRunning" && this.isSolved()) this.stopTimer()
			timeDis.innerHTML = ((new Date()) - this.startTime)/1000;
		}, 10);

	}

	stopTimer () {
		this.endTime = ((new Date()) - this.startTime)/1000;
		clearInterval(this.timer);
		this.state = "idle";
	}

	handleKeys (e) {
		let key = e.key
		this.yDeg += (key == "ArrowLeft") ? 5:(key=="ArrowRight") ? -5:0;
		this.xDeg += (key == "ArrowUp") ? 5:(key=="ArrowDown") ? -5:0;
		this.zDeg += (key == "PageUp") ? 5:(key=="PageDown") ? -5:0;
		this.draw(true)
		if (key in this.moves) {
			this.turn(this.moves[key])
		}
		if (key == "Shift" && this.state == "idle") {
			this.scramble();
		}else if (key == " " && this.state == "idle" && this.settings.timer == 1) {
			this.startTimer();
		}else if (key == " " && this.state == "timerRunning" && this.settings.timer == 1) {
			this.stopTimer();
		}
	}

}