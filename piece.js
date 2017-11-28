class p {
	constructor(colors, faces, id, cube) {
		this.stickers = [];
		this.faces = [];
		for (let i in colors) {
			if (colors[i] !== "") this.stickers.push(colors[i])
		}
		for (let i in faces) {
			if (faces[i]) this.faces.push(faces[i])
		}
		this.id = id;
		this.cube = cube;
		this.html = "";
		this.draw();
	}

	draw() {
		let transform = "";
		this.html = document.getElementById("cubie" + this.id)
		for (let i of this.faces) {
			transform += this.cube.faces[i.toString()].translate;
		}
		
		this.html.style.transform = transform;
		
		let html = "";
		for (let i in this.cube.faces) {
			if (this.cube.faces[i].isMiddle) continue;
			if (this.faces.indexOf(i) > -1) {
				let style = "style='transform:translate(-50%,-50%)" + this.cube.faces[i].rotate + 
						";background-color:" + this.cube.colors[this.stickers[this.faces.indexOf(i)]].color + "'";
				html += "<div " + style + " class='sticker' ><h1></h1></div>"
			}else {
				if (!this.cube.settings.opaque) continue;
				let style = "style='transform:translate(-50%,-50%)" + this.cube.faces[i].rotate + ";background-color:black'";
				html += "<div " + style + " class='sticker' ><h1></h1></div>"
			}
		}
		this.html.innerHTML = html;
		
		//set opacity of the pieces
		for (let i in this.html.children) if (this.html.children[i].innerHTML) this.html.children[i].style.opacity = (this.cube.settings.opaque) ? 1:0.7;
	}
	
	rotate (swaps) {
		swaps = swaps.split("");
		let newFaces = [];
		for (let i in this.faces) {
			if (swaps.indexOf(this.faces[i]) !== -1) {
				let j = swaps.indexOf(this.faces[i]);
				newFaces.push(swaps[(j+1)%4]);
			}else {
				newFaces.push(this.faces[i])
			}
		}
		this.faces = newFaces;
	}
	
}