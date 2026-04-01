'use strict';

/**
 * Pure maths helpers for the Regular Polygon Angles module.
 * These functions are independent of p5.js and can be unit-tested with Jest.
 */

/**
 * Calculates the interior angle of a regular polygon with n sides.
 * Formula: (n - 2) × 180 / n
 * @param {number} n - Number of sides (must be >= 3)
 * @returns {number} Interior angle in degrees
 */
function interiorAngle(n) {
  if (n < 3) return 0;
  return ((n - 2) * 180) / n;
}

/**
 * Calculates the exterior angle of a regular polygon with n sides.
 * Formula: 360 / n
 * @param {number} n - Number of sides (must be >= 3)
 * @returns {number} Exterior angle in degrees
 */
function exteriorAngle(n) {
  if (n < 3) return 0;
  return 360 / n;
}

/**
 * Returns the vertices of a regular polygon centred at (cx, cy) with the
 * given circumradius and number of sides.
 * The first vertex is at the top (angle = -π/2).
 * @param {number} cx - Centre x
 * @param {number} cy - Centre y
 * @param {number} radius - Circumradius
 * @param {number} n - Number of sides
 * @returns {Array<{x: number, y: number}>}
 */
function polygonVertices(cx, cy, radius, n) {
  var vertices = [];
  for (var i = 0; i < n; i++) {
    var angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    vertices.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return vertices;
}

/**
 * Returns the common name of a regular polygon with n sides.
 * Covers triangle (3) through dodecagon (12); returns "n-gon" for larger values.
 * @param {number} n - Number of sides
 * @returns {string}
 */
function polygonName(n) {
  var names = {
    3: 'Triangle',
    4: 'Quadrilateral',
    5: 'Pentagon',
    6: 'Hexagon',
    7: 'Heptagon',
    8: 'Octagon',
    9: 'Nonagon',
    10: 'Decagon',
    11: 'Hendecagon',
    12: 'Dodecagon',
  };
  return names[n] || n + '-gon';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    interiorAngle,
    exteriorAngle,
    polygonVertices,
    polygonName,
  };
}
