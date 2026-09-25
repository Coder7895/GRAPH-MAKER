/**
 * Complex Number Primitive & Operations for Fourier Analysis
 */

export interface Complex {
  re: number; // Real component (x-coordinate)
  im: number; // Imaginary component (y-coordinate)
}

export class ComplexNum implements Complex {
  re: number;
  im: number;

  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }

  static fromPolar(r: number, theta: number): ComplexNum {
    return new ComplexNum(r * Math.cos(theta), r * Math.sin(theta));
  }

  add(other: Complex): ComplexNum {
    return new ComplexNum(this.re + other.re, this.im + other.im);
  }

  subtract(other: Complex): ComplexNum {
    return new ComplexNum(this.re - other.re, this.im - other.im);
  }

  multiply(other: Complex): ComplexNum {
    // (a + bi)(c + di) = (ac - bd) + (ad + bc)i
    return new ComplexNum(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  scale(s: number): ComplexNum {
    return new ComplexNum(this.re * s, this.im * s);
  }

  get magnitude(): number {
    return Math.hypot(this.re, this.im);
  }

  get phase(): number {
    return Math.atan2(this.im, this.re);
  }
}
