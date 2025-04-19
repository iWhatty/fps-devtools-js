class Smoother {
    constructor(lagFactor = 0.5) {
      this.weight = lagFactor; // new reading weight: 0.5 = 50%
      this.avg = null;
    }
  
    update(value) {
      if (this.avg === null) {
        this.avg = value;
      } else {
        this.avg = this.avg * (1 - this.weight) + value * this.weight;
      }
      return this.avg;
    }
  
    get smoothed() {
      return this.avg ?? 0;
    }
  
    setLagFactor(factor) {
      this.weight = factor;
    }
  }
  