class p {
	constructor(stickers, id, cube, pos) {
		this.pos = pos;
		this.stickers = stickers;
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
		for (const face of 'xyz'.split('')) {
			for (let dir = -1; dir <=1; dir += 2) {
				const sticker = this.stickers
												.filter(s => s.face === face && s.dir === dir)[0];
				const backgroundColor = sticker ? sticker.color : 'black';

				// don't draw black faces
				if (!sticker && !this.cube.settings.opaque) continue;

				const rotate = this.cube.faces[face].getRotate(dir)
				html += `<div style="transform:${rotate};background-color:${backgroundColor}" class='sticker'></div>`
			}
		}
		this.html.innerHTML = html;

		//set opacity of the pieces
		for (let i in this.html.children) if (this.html.children[i].innerHTML) this.html.children[i].style.opacity = (this.cube.settings.opaque) ? 1:0.7;
	}

	rotate (t) {
		const [ cFace, cDepths, cDirection ] = t;

		const str = cDirection == 1 ? "xyz" : "zyx"

		const sides = str.replace(cFace, "").split('');
		for (const sticker of this.stickers) {
			if (sides.includes(sticker.face)) {
				// go to the next sides
				const index = sides.indexOf(sticker.face);
				sticker.face = sides[(index+1)%2];
				if (index+1 == 2) {
					sticker.dir *= -1;
				}
			}
		}

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
