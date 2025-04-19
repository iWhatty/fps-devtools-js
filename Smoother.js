// === Smoother ===
export class Smoother {
    constructor(lagFactor = 0.5) {
      this.weight = lagFactor;
      this.avg = null;
      this.min = Infinity;
      this.max = -Infinity;
    }
  
    update(value) {
      if (this.avg === null) {
        this.avg = value;
      } else {
        this.avg = this.avg * (1 - this.weight) + value * this.weight;
      }
  
      this.min = Math.min(this.min, value);
      this.max = Math.max(this.max, value);
      return this.avg;
    }
  
    reset() {
      this.min = Infinity;
      this.max = -Infinity;
    }
  
    get smoothed() {
      return this.avg ?? 0;
    }
  }
  