'use strict';

const {
  inscribedAngle,
  centralAngleForArc,
  isRightAngle,
} = require('../js/circleTheorems/theorems');

describe('inscribedAngle', () => {
  test('returns 90° for an angle inscribed in a semicircle (Thales theorem)', () => {
    // Diameter A=(1,0) B=(-1,0), point C=(0,1) on the circle
    expect(inscribedAngle(1, 0, -1, 0, 0, 1)).toBeCloseTo(90);
  });

  test('returns 45° for a known specific case', () => {
    // A=(1,0), B=(0,1), C=(0,-1) → inscribed angle = 45°
    expect(inscribedAngle(1, 0, 0, 1, 0, -1)).toBeCloseTo(45);
  });

  test('returns 0 when vertex coincides with A (degenerate)', () => {
    expect(inscribedAngle(1, 0, 0, 1, 1, 0)).toBeCloseTo(0);
  });

  test('always returns a value in [0, 180]', () => {
    const angle = inscribedAngle(1, 0, -1, 0, 0.5, 0.866);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThanOrEqual(180);
  });

  test('is symmetric: swapping A and B gives the same angle', () => {
    const a1 = inscribedAngle(1, 0, -1, 0, 0, 1);
    const a2 = inscribedAngle(-1, 0, 1, 0, 0, 1);
    expect(a1).toBeCloseTo(a2);
  });

  test('returns 60° for an equilateral triangle inscribed in a circle', () => {
    // A, B, C placed 120° apart on the unit circle
    const A = { x: Math.cos(0), y: Math.sin(0) };
    const B = { x: Math.cos((2 * Math.PI) / 3), y: Math.sin((2 * Math.PI) / 3) };
    const C = { x: Math.cos((4 * Math.PI) / 3), y: Math.sin((4 * Math.PI) / 3) };
    expect(inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y)).toBeCloseTo(60);
  });
});

describe('centralAngleForArc', () => {
  const cx = 0;
  const cy = 0;

  test('is exactly twice the inscribed angle (angle-at-centre theorem)', () => {
    // A=(1,0), B=(0,1), P=(0,-1) on the opposite arc
    const inscribed = inscribedAngle(1, 0, 0, 1, 0, -1);
    const central = centralAngleForArc(cx, cy, 1, 0, 0, 1, 0, -1);
    expect(central).toBeCloseTo(inscribed * 2);
  });

  test('returns 180° for a diameter arc (P on circumference)', () => {
    // A=(1,0), B=(-1,0) is a diameter; P=(0,1) is on one semicircle
    const central = centralAngleForArc(cx, cy, 1, 0, -1, 0, 0, 1);
    expect(central).toBeCloseTo(180);
  });

  test('returns 90° for a quarter-circle arc (P on the opposite arc)', () => {
    // A=(1,0), B=(0,1) span 90°; P=(0,-1) is on the far arc
    const central = centralAngleForArc(cx, cy, 1, 0, 0, 1, 0, -1);
    expect(central).toBeCloseTo(90);
  });

  test('satisfies the theorem for another configuration', () => {
    // A=(1,0), B=(-1,0), P=(0,-1) (bottom semicircle)
    const inscribed = inscribedAngle(1, 0, -1, 0, 0, -1);
    const central = centralAngleForArc(cx, cy, 1, 0, -1, 0, 0, -1);
    expect(central).toBeCloseTo(inscribed * 2);
  });
});

describe('isRightAngle', () => {
  test('returns true for exactly 90°', () => {
    expect(isRightAngle(90)).toBe(true);
  });

  test('returns true for 89° (within default tolerance of 1°)', () => {
    expect(isRightAngle(89)).toBe(true);
  });

  test('returns true for 91° (within default tolerance of 1°)', () => {
    expect(isRightAngle(91)).toBe(true);
  });

  test('returns false for 88° (outside default tolerance)', () => {
    expect(isRightAngle(88)).toBe(false);
  });

  test('returns false for 92° (outside default tolerance)', () => {
    expect(isRightAngle(92)).toBe(false);
  });

  test('respects a custom tolerance', () => {
    expect(isRightAngle(85, 5)).toBe(true);
    expect(isRightAngle(84, 5)).toBe(false);
  });
});
