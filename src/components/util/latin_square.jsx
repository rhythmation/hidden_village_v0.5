const seedFunction = function (s) {
    return function () {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  };
  
  // Latin square function was ripped from:
  // http://web.archive.org/web/20210517194113/https://rosettacode.org/wiki/Random_Latin_squares
  // The only difference is that a seedFunction to create a deterministic latin square is added
  // so that we can use the logic across multiple instantiations of the game.
  export default class Latin {
    constructor(size = 3) {
      this.seed = seedFunction(1);
      this.size = size;
      this.mst = [...Array(this.size)].map((v, i) => i + 1);
      this.square = Array(this.size)
        .fill(0)
        .map(() => Array(this.size).fill(0));
  
      if (this.create(0, 0)) {
        console.table(this.square);
      }
    }
  
    create(c, r) {
      const d = [...this.mst];
      let s;
      while (true) {
        do {
          s = d.splice(Math.floor(this.seed() * d.length), 1)[0];
          if (!s) return false;
        } while (this.check(s, c, r));
  
        this.square[c][r] = s;
        if (++c >= this.size) {
          c = 0;
          if (++r >= this.size) {
            return true;
          }
        }
        if (this.create(c, r)) return true;
        if (--c < 0) {
          c = this.size - 1;
          if (--r < 0) {
            return false;
          }
        }
      }
    }
  
    check(d, c, r) {
      for (let a = 0; a < this.size; a++) {
        if (c - a > -1) {
          if (this.square[c - a][r] === d) return true;
        }
        if (r - a > -1) {
          if (this.square[c][r - a] === d) return true;
        }
      }
      return false;
    }
  }
  