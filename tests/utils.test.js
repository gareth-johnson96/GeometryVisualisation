'use strict';

const {
  degreesToRadians,
  radiansToDegrees,
  pointOnCircle,
  angleBetweenPoints,
  distanceBetweenPoints,
  clamp,
} = require('../js/common/utils');

describe('degreesToRadians', () => {
  test('converts 0° to 0 radians', () => {
    expect(degreesToRadians(0)).toBe(0);
  });

  test('converts 180° to π radians', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
  });

  test('converts 360° to 2π radians', () => {
    expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
  });

  test('converts 90° to π/2 radians', () => {
    expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
  });
});

describe('radiansToDegrees', () => {
  test('converts 0 radians to 0°', () => {
    expect(radiansToDegrees(0)).toBe(0);
  });

  test('converts π radians to 180°', () => {
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });

  test('converts 2π radians to 360°', () => {
    expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360);
  });
});

describe('pointOnCircle', () => {
  test('returns the rightmost point at angle 0', () => {
    const pt = pointOnCircle(0, 0, 100, 0);
    expect(pt.x).toBeCloseTo(100);
    expect(pt.y).toBeCloseTo(0);
  });

  test('returns the bottom point at angle π/2', () => {
    const pt = pointOnCircle(0, 0, 100, Math.PI / 2);
    expect(pt.x).toBeCloseTo(0);
    expect(pt.y).toBeCloseTo(100);
  });

  test('offsets correctly from a non-zero centre', () => {
    const pt = pointOnCircle(50, 50, 100, 0);
    expect(pt.x).toBeCloseTo(150);
    expect(pt.y).toBeCloseTo(50);
  });

  test('returns the leftmost point at angle π', () => {
    const pt = pointOnCircle(0, 0, 100, Math.PI);
    expect(pt.x).toBeCloseTo(-100);
    expect(pt.y).toBeCloseTo(0);
  });
});

describe('angleBetweenPoints', () => {
  test('returns 0 for a horizontal rightward line', () => {
    expect(angleBetweenPoints(0, 0, 1, 0)).toBeCloseTo(0);
  });

  test('returns π/2 for a downward vertical line', () => {
    expect(angleBetweenPoints(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2);
  });

  test('returns π for a leftward horizontal line', () => {
    expect(angleBetweenPoints(0, 0, -1, 0)).toBeCloseTo(Math.PI);
  });

  test('returns -π/2 for an upward vertical line', () => {
    expect(angleBetweenPoints(0, 0, 0, -1)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('distanceBetweenPoints', () => {
  test('returns 0 for identical points', () => {
    expect(distanceBetweenPoints(3, 4, 3, 4)).toBe(0);
  });

  test('returns correct distance for a 3-4-5 right triangle', () => {
    expect(distanceBetweenPoints(0, 0, 3, 4)).toBeCloseTo(5);
  });

  test('is symmetric', () => {
    expect(distanceBetweenPoints(1, 2, 5, 6)).toBeCloseTo(
      distanceBetweenPoints(5, 6, 1, 2)
    );
  });
});

describe('clamp', () => {
  test('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test('clamps to min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test('clamps to max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
