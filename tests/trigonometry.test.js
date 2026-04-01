'use strict';

const {
  sinDeg,
  cosDeg,
  tanDeg,
  rightTriangleSides,
  triangleArea,
  angleFromSides,
  sideFromCosineRule,
  dist2D,
} = require('../js/trigonometry/trigUtils');

describe('sinDeg', () => {
  test('sin(0) = 0', () => {
    expect(sinDeg(0)).toBeCloseTo(0);
  });

  test('sin(30) = 0.5', () => {
    expect(sinDeg(30)).toBeCloseTo(0.5);
  });

  test('sin(90) = 1', () => {
    expect(sinDeg(90)).toBeCloseTo(1);
  });

  test('sin(180) ≈ 0', () => {
    expect(sinDeg(180)).toBeCloseTo(0);
  });
});

describe('cosDeg', () => {
  test('cos(0) = 1', () => {
    expect(cosDeg(0)).toBeCloseTo(1);
  });

  test('cos(60) = 0.5', () => {
    expect(cosDeg(60)).toBeCloseTo(0.5);
  });

  test('cos(90) ≈ 0', () => {
    expect(cosDeg(90)).toBeCloseTo(0);
  });

  test('cos(180) = -1', () => {
    expect(cosDeg(180)).toBeCloseTo(-1);
  });
});

describe('tanDeg', () => {
  test('tan(0) = 0', () => {
    expect(tanDeg(0)).toBeCloseTo(0);
  });

  test('tan(45) = 1', () => {
    expect(tanDeg(45)).toBeCloseTo(1);
  });
});

describe('rightTriangleSides', () => {
  test('hyp=100, angle=30 gives opp≈50', () => {
    expect(rightTriangleSides(100, 30).opposite).toBeCloseTo(50);
  });

  test('hyp=100, angle=30 gives adj≈86.6', () => {
    expect(rightTriangleSides(100, 30).adjacent).toBeCloseTo(86.6025, 3);
  });

  test('opp² + adj² = hyp² (Pythagoras)', () => {
    var { opposite, adjacent } = rightTriangleSides(100, 30);
    expect(opposite * opposite + adjacent * adjacent).toBeCloseTo(10000);
  });

  test('angle=0 gives opp=0 and adj=hyp', () => {
    var { opposite, adjacent } = rightTriangleSides(50, 0);
    expect(opposite).toBeCloseTo(0);
    expect(adjacent).toBeCloseTo(50);
  });
});

describe('triangleArea', () => {
  test('right triangle with legs 3 and 4 has area 6', () => {
    var a = { x: 0, y: 0 };
    var b = { x: 3, y: 0 };
    var c = { x: 0, y: 4 };
    expect(triangleArea(a, b, c)).toBeCloseTo(6);
  });

  test('collinear points give area 0', () => {
    var a = { x: 0, y: 0 };
    var b = { x: 1, y: 1 };
    var c = { x: 2, y: 2 };
    expect(triangleArea(a, b, c)).toBeCloseTo(0);
  });

  test('area is always non-negative', () => {
    var a = { x: 1, y: 2 };
    var b = { x: 4, y: 6 };
    var c = { x: 7, y: 2 };
    expect(triangleArea(a, b, c)).toBeGreaterThanOrEqual(0);
  });
});

describe('angleFromSides', () => {
  test('equilateral triangle: all angles are 60°', () => {
    expect(angleFromSides(5, 5, 5)).toBeCloseTo(60);
  });

  test('right triangle (3-4-5): angle opposite hypotenuse is 90°', () => {
    // a=5 (hyp), b=3, c=4  → cos A = (9+16-25)/(2*3*4) = 0 → 90°
    expect(angleFromSides(5, 3, 4)).toBeCloseTo(90);
  });

  test('clamps degenerate cosA > 1 to return 0°', () => {
    // sides 1,1,3 — impossible triangle but should not throw
    var angle = angleFromSides(1, 1, 3);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThanOrEqual(180);
  });
});

describe('sideFromCosineRule', () => {
  test('equilateral triangle: all sides equal', () => {
    // b=5, c=5, angle=60° → a should be 5
    expect(sideFromCosineRule(5, 5, 60)).toBeCloseTo(5);
  });

  test('Pythagoras special case: angle=90°', () => {
    // b=3, c=4, A=90° → a = sqrt(9+16) = 5
    expect(sideFromCosineRule(3, 4, 90)).toBeCloseTo(5);
  });

  test('angle=0° → a = |b - c|', () => {
    expect(sideFromCosineRule(5, 3, 0)).toBeCloseTo(2);
  });
});

describe('dist2D', () => {
  test('distance between same point is 0', () => {
    expect(dist2D({ x: 3, y: 4 }, { x: 3, y: 4 })).toBeCloseTo(0);
  });

  test('distance between (0,0) and (3,4) is 5', () => {
    expect(dist2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
  });

  test('distance is symmetric', () => {
    var p1 = { x: 1, y: 2 };
    var p2 = { x: 4, y: 6 };
    expect(dist2D(p1, p2)).toBeCloseTo(dist2D(p2, p1));
  });

  test('horizontal distance', () => {
    expect(dist2D({ x: 0, y: 0 }, { x: 7, y: 0 })).toBeCloseTo(7);
  });
});
