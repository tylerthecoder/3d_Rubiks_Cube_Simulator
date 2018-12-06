class Face {
  constructor(side, depth, colors, cube) {
    this.side = side;
    this.depth = depth;
    this.colors = colors;
    this.cube = cube;
    this.axis = this.side == "x" ? "z" : this.side == "y" ?  "x": "y";
  }

  getTransform(layer) {
    const translate = this.cube.settings.cubeSize/2 * (this.depth -1) - (layer-1) * this.cube.settings.cubeSize;
		return `translate${this.axis}(${translate}px)`;
  }

  getRotate(dir) {
    const rotateAxis = this.side == "x" ? false : this.side == "y" ? "y" : "x";
    let translate = `translate(-50%,-50%)translate${this.axis}(${50 * dir}px)`;
    if (rotateAxis) translate += `rotate${rotateAxis}(90deg)`;
    return translate + ';'
  }

  isEdge(layer) {
    return layer == 0 || layer == this.depth - 1;
  }

  getColor(layer) {
    if (layer == 0) {
      return this.colors[0];
    } else {
      return this.colors[1];
    }
  }


}