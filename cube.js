class Cube {
	constructor() {
		this.settings = {
			opaque: true, //toggles on and off the opacity
			turnSpeed: 0.3,
			animate: true,
			cubeSize: 100
		}
		this.xDeg = 155;
		this.yDeg = 115;
		this.zDeg = 0;
		this.html = document.getElementById("cube");
		this.inFace = [];
		this.dim = [2,2,2];
		this.onTurn = () => {};

		document.body.onkeydown = (event) => { this.handleKeys(event) };
	}

	generate () {
		this.p = [];
		this.faces = [
			new Face(0, this.dim[0], ['red', 'orange'], "ik8 edyb", this), // RL face
			new Face(1, this.dim[1], ['blue', 'green'], "ghn wop ", this),
			new Face(2, this.dim[2], ['yellow', 'white'], "jf- sl;a", this) // UB face
		]

		this.html.innerHTML = "<div id='theFace'></div>";
		const indices = [0, 0, 0];
		let failsafe = 0;
		const max = this.dim.reduce((a,c) => a * c)
		mainLoop:
		while(indices[0] < 1000) {
			if (failsafe++ > max + 1) break;
			const stickers = [];
			for (let i = 0; i < this.faces.length; i++) {
				const face = this.faces[i];
				console.log("Operation");
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

			const piece = new p(stickers, this.p.length, this, indices.slice(0), this.dim.slice(0));
			this.p.push(piece);
			indices[0]++;
		}
		this.draw();
	}

	draw() {
		this.html.style.transform = "rotateX(" + this.xDeg + "deg)rotateY(" + this.yDeg + "deg)rotateZ(" + this.zDeg + "deg)";
	}

	emptyFaces() {
		for (let p of this.inFace) {
			this.html.appendChild(document.getElementById("cubie" + p.id));
		}
		this.inFace.forEach(p => p.draw());
		this.inFace = [];
		const face = document.getElementById("theFace")
		face.style.transition = "transform 0s";
    face.style.transform = "";
	}

	async randomTurn(cb) {
		const face = this.faces[~~(Math.random() * this.faces.length)];
		return face.randomTurn(cb);
	}

	// to do, make async see if quicker
	isSolved () {
		const ledger = {};
		for (const p of this.p) {
			for (const s of p.stickers) {
				const faceColor = this.faces[s.face].getColor(p.pos[s.face]);
				if (!(faceColor in ledger)) {
					ledger[faceColor] = s.color
				} else if (ledger[faceColor] != s.color) {
					return false;
				}
			}
		}
		return true;
	}

	handleKeys (e) {
		let key = e.key
		this.yDeg += (key == "ArrowLeft") ? 5:(key=="ArrowRight") ? -5:0;
		this.xDeg += (key == "ArrowUp") ? 5:(key=="ArrowDown") ? -5:0;
		this.zDeg += (key == "PageUp") ? 5:(key=="PageDown") ? -5:0;

		this.draw();

		if (+key) this.lastNum = +key;
		for (const f of this.faces) {
			if (f.keyPress(key, this.lastNum)) this.lastNum = 0;
		}

	}
}