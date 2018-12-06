class p {
	constructor(colors, faces, id, cube, pos) {
		this.pos = pos;
		this.stickers = colors;
		this.faces = faces.map(f => f + pos[f]);
		this.id = id;
		this.cube = cube;
		this.html = "";
		this.draw();
	}

	draw() {
		this.html = document.getElementById("cubie" + this.id);

		let transform = "";
		transform += this.cube.faces.x.getTransform(this.pos.x + 1);
		transform += this.cube.faces.y.getTransform(this.pos.y + 1);
		transform += this.cube.faces.z.getTransform(this.pos.z + 1);

		this.html.style.transform = transform;

		let html = "";
		const baseFaces = Object.values(this.cube.faces).flatMap(f => [
			f.side + "0",
			f.side + String(f.depth-1)
		])
		for (const face of baseFaces) {
			const faceIndex = this.faces.indexOf(face);
			const backgroundColor = faceIndex > -1 ? this.stickers[faceIndex] : 'black';

			// don't draw black faces
			if (faceIndex === -1 && !this.cube.settings.opaque) continue;

			const rotate = this.cube.faces[face.substr(0,1).toLocaleLowerCase()].getRotate(Number(face.substr(1)))
			html += `<div style="transform:${rotate};background-color:${backgroundColor}" class='sticker'></div>`
		}
		this.html.innerHTML = html;

		//set opacity of the pieces
		for (let i in this.html.children) if (this.html.children[i].innerHTML) this.html.children[i].style.opacity = (this.cube.settings.opaque) ? 1:0.7;
	}

	rotate (swaps, t) {
		let newFaces = [];
		for (const face of this.faces) {
			if (swaps.indexOf(face) !== -1) {
				let j = swaps.indexOf(face);
				newFaces.push(swaps[(j+1)%4]);
			}else {
				newFaces.push(face)
			}
		}
		this.faces = newFaces;


		const [ cFace, cDepths, cDirection ] = t;
		const x1 = "xyz".replace(cFace, "").toLocaleLowerCase().split('');
		const x2 = cDirection == 1 ? [
			(this.cube.n-this.pos[x1[1]])-1,
			this.pos[x1[0]]
		] : [
			this.pos[x1[1]],
			this.cube.n-this.pos[x1[0]]-1
		]
		this.pos[x1[0]] = x2[0];
		this.pos[x1[1]] = x2[1];
	}
}
