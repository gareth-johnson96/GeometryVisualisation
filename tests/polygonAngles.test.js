'use strict';

const {
  interiorAngle,
  exteriorAngle,
  polygonVertices,
  polygonName,
} = require('../js/polygonAngles/polygon');

describe('interiorAngle', () => {
  test('equilateral triangle (n=3) has interior angle 60°', () => {
    expect(interiorAngle(3)).toBeCloseTo(60);
  });

  test('square (n=4) has interior angle 90°', () => {
    expect(interiorAngle(4)).toBeCloseTo(90);
  });

  test('regular pentagon (n=5) has interior angle 108°', () => {
    expect(interiorAngle(5)).toBeCloseTo(108);
  });

  test('regular hexagon (n=6) has interior angle 120°', () => {
    expect(interiorAngle(6)).toBeCloseTo(120);
  });

  test('regular polygon with 20 sides has interior angle 162°', () => {
    expect(interiorAngle(20)).toBeCloseTo(162);
  });

  test('returns 0 for n < 3', () => {
    expect(interiorAngle(2)).toBe(0);
    expect(interiorAngle(0)).toBe(0);
  });

  test('satisfies the formula (n-2)*180/n for any valid n', () => {
    for (var n = 3; n <= 20; n++) {
      expect(interiorAngle(n)).toBeCloseTo(((n - 2) * 180) / n);
    }
  });
});

describe('exteriorAngle', () => {
  test('equilateral triangle (n=3) has exterior angle 120°', () => {
    expect(exteriorAngle(3)).toBeCloseTo(120);
  });

  test('square (n=4) has exterior angle 90°', () => {
    expect(exteriorAngle(4)).toBeCloseTo(90);
  });

  test('regular hexagon (n=6) has exterior angle 60°', () => {
    expect(exteriorAngle(6)).toBeCloseTo(60);
  });

  test('returns 0 for n < 3', () => {
    expect(exteriorAngle(2)).toBe(0);
  });

  test('exterior angles always sum to 360° for any valid n', () => {
    for (var n = 3; n <= 20; n++) {
      expect(exteriorAngle(n) * n).toBeCloseTo(360);
    }
  });

  test('interior and exterior angles sum to 180° for any valid n', () => {
    for (var n = 3; n <= 20; n++) {
      expect(interiorAngle(n) + exteriorAngle(n)).toBeCloseTo(180);
    }
  });
});

describe('polygonVertices', () => {
  test('returns n vertices for a polygon with n sides', () => {
    for (var n = 3; n <= 8; n++) {
      expect(polygonVertices(0, 0, 100, n).length).toBe(n);
    }
  });

  test('all vertices lie on the circumscribed circle', () => {
    var vertices = polygonVertices(0, 0, 100, 6);
    vertices.forEach(function (v) {
      var dist = Math.sqrt(v.x * v.x + v.y * v.y);
      expect(dist).toBeCloseTo(100);
    });
  });

  test('first vertex is at the top (y is minimum)', () => {
    var vertices = polygonVertices(0, 0, 100, 6);
    var topY = vertices[0].y;
    // Top vertex should have y close to -100 (12 o'clock)
    expect(topY).toBeCloseTo(-100);
    expect(vertices[0].x).toBeCloseTo(0);
  });

  test('offsets correctly from a non-zero centre', () => {
    var vertices = polygonVertices(50, 50, 100, 4);
    vertices.forEach(function (v) {
      var dx = v.x - 50;
      var dy = v.y - 50;
      var dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeCloseTo(100);
    });
  });

  test('vertices of a regular polygon are equally spaced in angle', () => {
    var n = 6;
    var vertices = polygonVertices(0, 0, 100, n);
    var expectedStep = (2 * Math.PI) / n;
    for (var i = 1; i < vertices.length; i++) {
      var a1 = Math.atan2(vertices[i - 1].y, vertices[i - 1].x);
      var a2 = Math.atan2(vertices[i].y, vertices[i].x);
      // Normalise difference to [0, 2π)
      var diff = ((a2 - a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      expect(diff).toBeCloseTo(expectedStep);
    }
  });
});

describe('polygonName', () => {
  test('returns "Triangle" for n=3', () => {
    expect(polygonName(3)).toBe('Triangle');
  });

  test('returns "Quadrilateral" for n=4', () => {
    expect(polygonName(4)).toBe('Quadrilateral');
  });

  test('returns "Pentagon" for n=5', () => {
    expect(polygonName(5)).toBe('Pentagon');
  });

  test('returns "Hexagon" for n=6', () => {
    expect(polygonName(6)).toBe('Hexagon');
  });

  test('returns "Decagon" for n=10', () => {
    expect(polygonName(10)).toBe('Decagon');
  });

  test('returns "n-gon" for n > 12', () => {
    expect(polygonName(15)).toBe('15-gon');
    expect(polygonName(20)).toBe('20-gon');
  });
});
