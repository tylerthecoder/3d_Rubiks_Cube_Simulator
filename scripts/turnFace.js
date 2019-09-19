onmessage = ({
  data: {
    cube,
    layers,
    dir,
    side,
  }
}) => {
  console.log(cube, layers, dir, side);
  let angle = dir == 1 ? 90 : -90;
  // dont know why this is necessary!!
  if (side == 1) angle *= -1;

  this.cube.emptyFaces();

  // get all the pieces on all the faces that are sent in the request
  this.cube.inFace = this.cube.p
    .filter(p => layers.includes(p.pos[this.side]))

  const face = document.getElementById("theFace")

  for (const p of this.cube.inFace) {
    face.appendChild(document.getElementById("cubie" + p.id));
    p.rotate(this.side, dir);
  }

  this.cube.onTurn(this, layers, dir);

  /* return */
  new Promise((resolve) => {
    setTimeout(() => {
      if (this.cube.settings.animate) {
        face.style.transition = `transform ${this.cube.settings.turnSpeed}s`
        face.style.transform = `rotate${this.axis}(${angle}deg)`;
        face.addEventListener("transitionend", () => {
          this.cube.emptyFaces();
          resolve();
        })
      } else {
        this.cube.emptyFaces();
      }
    }, 1)
  })
  postMessage(res);
};