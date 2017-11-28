class C {
	constructor() {
		this.settings = {
			"timer":2, //0 means none, 1 means lesiure time, 2 means competition timer
			"opaque":true, //toggles on and off the opacity
			"turnSpeed":0.1,
			"scrammbleSpeed":0.05
		}
		this.xDeg = 155;
		this.yDeg = 115;
		this.zDeg = 0;
		this.html = document.getElementById("cube");
		this.face = document.getElementById("theFace");
		this.inFace = [];
		this.p = [];
		this.animate = true;
		this.state = "idle"
		this.scrammbleTimer = 0;
		this.timer = 0;
		this.startTime = new Date();
		this.endTime = new Date();
		
		this.queue = [];
		
		this.colors = {
			"y":{face:"U",color:"yellow"},
			"w":{face:"D",color:"white"},
			"r":{face:"R",color:"red"},
			"o":{face:"L",color:"orange"},
			"b":{face:"F",color:"blue"},
			"g":{face:"B",color:"green"},
			"":{}
		}
		
		this.turns = {
			"R":{face:"R",swaps:"UBDF",axis:"z",dir:"CW",key:"i"},
			"RPrime":{face:"R",swaps:"FDBU",axis:"z",dir:"CCW",key:"k"},
			"U":{face:"U",swaps:"FLBR",axis:"y",dir:"CW",key:"j"},
			"UPrime":{face:"U",swaps:"RBLF",axis:"y",dir:"CCW",key:"f"},
			"F":{face:"F",swaps:"RDLU",axis:"x",dir:"CW",key:"h"},
			"FPrime":{face:"F",swaps:"ULDR",axis:"x",dir:"CCW",key:"g"},
			"L":{face:"L",swaps:"FDBU",axis:"z",dir:"CCW",key:"d"},
			"LPrime":{face:"L",swaps:"UBDF",axis:"z",dir:"CW",key:"e"},
			"D":{face:"D",swaps:"RBLF",axis:"y",dir:"CCW",key:"s"},
			"DPrime":{face:"D",swaps:"FLBR",axis:"y",dir:"CW",key:"l"},
			"B":{face:"B",swaps:"ULDR",axis:"x",dir:"CCW",key:"w"},
			"BPrime":{face:"B",swaps:"RDLU",axis:"x",dir:"CW",key:"o"},
			"M":{middle:true,face:"M",swaps:"UBDF",axis:"z",dir:"CW",key:"8"},
			"E":{middle:true,face:"E",swaps:"FLBR",axis:"y",dir:"CW",key:"n"},
			"S":{middle:true,face:"S",swaps:"RDLU",axis:"x",dir:"CW",key:"-"},
			"X":{turn:true,dir:"CW",swaps:"UBDF",axis:"z",key:"y"},
			"XPrime":{turn:true,dir:"CCW",swaps:"FDBU",axis:"z",key:"b"},
			"Y":{turn:true,dir:"CW",swaps:"FLBR",axis:"y",key:";"},
			"YPrime":{turn:true,dir:"CCW",swaps:"RBLF",axis:"y",key:"a"},
			"Z":{turn:true,dir:"CW",swaps:"RDLU",axis:"x",key:"p"}
		}
		
		this.faces = {
			'F':{translate:"translatex(100px)",rotate:"translateX(50px)rotatey(-90deg);",axis:"x"},
			'U':{translate:"translatey(100px)",rotate:"translateY(50px)rotatex(90deg);",axis:"y"},
			'R':{translate:"translatez(100px)",rotate:"translateZ(50px);",axis:"z"},
			'B':{translate:"translatex(-100px)",rotate:"translateX(-50px)rotatey(90deg);"},
			'L':{translate:"translatez(-100px)",rotate:"translatez(-50px)"},
			'D':{translate:"translatey(-100px)",rotate:"translatey(-50px)rotatex(90deg);"},
			'M':{isMiddle:true,between:['L','R']},
			'E':{isMiddle:true,between:['U','D']},
			'S':{isMiddle:true,between:['F','B']}
		}
	}
	
	generate () {
		let count = 0;
		this.html.innerHTML = "<div id='theFace'></div>"
		for (let c1 in this.colors) {
			for (let c2 in this.colors) {
				for (let c3 in this.colors) {
					let flag = false;
					let c = [c1,c2,c3].sort();
					if (c1==c2 || c2==c3 || c1==c3) flag = true;
					if (c.toString().replace(/,/g,"").length == 1) flag = false;
					if (c.indexOf("y") > -1 && c.indexOf("w") > -1) flag = true;
					if (c.indexOf("r") > -1 && c.indexOf("o") > -1) flag = true;
					if (c.indexOf("g") > -1 && c.indexOf("b") > -1) flag = true;
					for (let i of this.p) {
						if (c.join("") == i.stickers.concat().sort().join("")) flag = true
					}
					if (!flag) {
						let faces = [];
						for (let i of c) {
							faces.push(this.colors[i].face)
						}
						this.html.innerHTML += "<cubie id='cubie" + count + "'></cubie>"
						this.p.push(new p(c,faces,count,this))
						count++
					}
				}
			}
		}
		this.draw(false);
	}
	
	draw(bool) {
		this.html.style.transform = "rotateX(" + this.xDeg + "deg)rotateY(" + this.yDeg + "deg)rotateZ(" + this.zDeg + "deg)";
		if (bool) return 0; //pass in true if you dont want to render the pieces
		for (let i of this.p) {i.draw()}
	}
	
	turn (cual) {
		if (this.state == "scrammbled" && !cual.turn) this.startTimer()
		
		//put the pieces in a face, turn that face, draw the new position of the pieces, then destory the face.
		if (this.animate) this.draw(false);
		
		for (let i of this.inFace) {
			this.html.appendChild(document.getElementById("cubie" + i));
		}
		
		let face = document.getElementById("theFace")
		
		face.style.transition = "transform 0s";
		face.style.transform = "";
		
		let allP = [];
		for (let i of this.p) {
			allP.push(i.id)
		}
		this.inFace = (cual.turn) ? allP:this.piecesOnFace(cual.face)
		
		for (let i of this.inFace) {
			face.appendChild(document.getElementById("cubie" + i))
			this.p[i].rotate(cual.swaps)
		}
		setTimeout(() => {
			if (this.animate) {
				face.style.transition = "transform " + ((this.state == "scrammbling") ? this.settings.scrammbleSpeed:this.settings.turnSpeed) + "s"
				face.style.transform = "rotate" + cual.axis + "(" + ((cual.dir == "CW") ? 90:-90) + "deg)";
			}
		},1)
	}
	
	piecesOnFace (face) {
		let ret = [];
		for (let i in this.p) {
			i = parseInt(i,10)
			if (this.faces[face].isMiddle) {
				var findOne = function (haystack, arr) {
						return arr.some(function (v) {
								return haystack.indexOf(v) >= 0;
						});
				};
				if (!findOne(this.p[i].faces,this.faces[face].between)) ret.push(i)
			}else {
				if (this.p[i].faces.indexOf(face) > -1) ret.push(i)
			}
		}
		return ret;
	}
	
	scramble() {
		let times = 0;
		let allTheMoves = [];
		for (let i in this.turns) {
			if (!this.turns[i].turn && !this.turns[i].middle) allTheMoves.push(this.turns[i])
		}
		this.state = "scrammbling";
		
		this.scrammbleTimer = setInterval(() => {
			let index = Math.floor(Math.random() * allTheMoves.length);
			this.turn(allTheMoves[index]);
			times++;
			if (times >= 50) {
				clearInterval(this.scrammbleTimer);
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
		for (let i in this.turns) {
			if (this.state == "scrammbling") break;
			if (key == this.turns[i].key) this.turn(this.turns[i]);
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