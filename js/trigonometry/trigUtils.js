'use strict';

/**
 * Pure maths helpers for the Trigonometry module.
 * These functions are independent of p5.js and can be unit-tested with Jest.
 */

var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;

/** sin in degrees */
function sinDeg(degrees) {
  return Math.sin(degrees * DEG2RAD);
}

/** cos in degrees */
function cosDeg(degrees) {
  return Math.cos(degrees * DEG2RAD);
}

/** tan in degrees */
function tanDeg(degrees) {
  return Math.tan(degrees * DEG2RAD);
}

/**
 * Given hypotenuse and an angle (in degrees), returns the opposite and
 * adjacent sides of the right-angled triangle.
 * @param {number} hyp - hypotenuse length
 * @param {number} angleDeg - angle in degrees
 * @returns {{opposite: number, adjacent: number}}
 */
function rightTriangleSides(hyp, angleDeg) {
  return {
    opposite: hyp * sinDeg(angleDeg),
    adjacent: hyp * cosDeg(angleDeg),
  };
}

/**
 * Area of a triangle from three {x,y} vertices using the cross-product
 * (shoelace) formula.
 * @param {{x:number,y:number}} a
 * @param {{x:number,y:number}} b
 * @param {{x:number,y:number}} c
 * @returns {number} area (always non-negative)
 */
function triangleArea(a, b, c) {
  return Math.abs(
    (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
  ) / 2;
}

/**
 * Angle at vertex A (opposite side a) using the cosine rule.
 * a² = b² + c² − 2bc·cos A  ⟹  cos A = (b² + c² − a²) / (2bc)
 * @param {number} a - side opposite to the angle we want
 * @param {number} b - second side
 * @param {number} c - third side
 * @returns {number} angle at A in degrees
 */
function angleFromSides(a, b, c) {
  var cosA = (b * b + c * c - a * a) / (2 * b * c);
  cosA = Math.max(-1, Math.min(1, cosA)); // clamp to [-1, 1]
  return Math.acos(cosA) * RAD2DEG;
}

/**
 * Side a from the cosine rule given sides b, c and the included angle A.
 * a² = b² + c² − 2bc·cos A
 * @param {number} b
 * @param {number} c
 * @param {number} angleADeg - angle A in degrees
 * @returns {number} side a
 */
function sideFromCosineRule(b, c, angleADeg) {
  var a2 = b * b + c * c - 2 * b * c * cosDeg(angleADeg);
  return Math.sqrt(Math.max(0, a2));
}

/**
 * Euclidean distance between two {x,y} points.
 * @param {{x:number,y:number}} p1
 * @param {{x:number,y:number}} p2
 * @returns {number}
 */
function dist2D(p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sinDeg,
    cosDeg,
    tanDeg,
    rightTriangleSides,
    triangleArea,
    angleFromSides,
    sideFromCosineRule,
    dist2D,
  };
}
