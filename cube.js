class C {
	constructor() {
		this.settings = {
			timer: 2, //0 means none, 1 means lesiure time, 2 means competition timer
			opaque: true, //toggles on and off the opacity
			turnSpeed: 0.3,
			scrammbleSpeed: 0.05,
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
		this.dim = [3,3,3];

		this.faces = [
			new Face(0, this.dim[0], ['red', 'orange'], "ik8 deyb", this), // RL face
			new Face(1, this.dim[1], ['blue', 'green'], "hgn wop ", this),
			new Face(2, this.dim[2], ['yellow', 'white'], "jf- sl;a", this)
		]

		document.body.onkeydown = (event) => { this.handleKeys(event) };
	}

	generate () {
		this.html.innerHTML = "<div id='theFace'></div>";
		const indices = [0, 0, 0];

		let failsafe = 0;
		mainLoop:
		while(indices[0] < 10) {
			if (failsafe++ > 1000) break;
			const stickers = [];
			for (let i = 0; i < this.faces.length; i++) {
				const face = this.faces[i];
				if (indices[i] >= face.depth) {
					// we are on the last index of the last thing
					if (i == this.faces.length-1) break mainLoop;
					indices[i] = 0;
					indices[i+1]++;
				}
				if (face.isEdge(indices[i])) {
					const sticker = {
						color: face.getColor(indices[i]),
						face: i,
						dir: indices[i] == 0 ? 1 : -1 // if it is the front or back
					}
					stickers.push(sticker)
				}
			}
			if (stickers.length === 0) {
				indices[0]++;
				continue;
			}
			this.html.innerHTML += `<cubie id='cubie${this.p.length}'></cubie>`;

			const piece = new p(stickers, this.p.length, this, indices.slice(0));
			this.p.push(piece);
			indices[0]++;
		}

		this.draw(false);
	}

	draw(bool) {
		this.html.style.transform = "rotateX(" + this.xDeg + "deg)rotateY(" + this.yDeg + "deg)rotateZ(" + this.zDeg + "deg)";
		if (bool) return 0; //pass in true if you dont want to render the pieces
		this.p.forEach(p => p.draw());
	}

	emptyFaces() {
		for (let p of this.inFace) {
			this.html.appendChild(document.getElementById("cubie" + p.id));
		}
		this.draw();
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
		this.draw(true);

		if (+key) this.lastNum = +key;
		for (const f of this.faces) {
			if (f.keyPress(key, this.lastNum)) this.lastNum = 0;
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