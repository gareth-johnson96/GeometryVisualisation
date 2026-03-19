'use strict';

/**
 * Pure maths helpers for circle theorem angle computations.
 * These functions are independent of p5.js and can be unit-tested with Jest.
 */

/**
 * Computes the inscribed angle (in degrees) at vertex P subtended by chord AB.
 * Uses the dot-product formula; always returns a value in [0, 180].
 * @param {number} ax @param {number} ay - Point A coordinates
 * @param {number} bx @param {number} by - Point B coordinates
 * @param {number} px @param {number} py - Vertex P coordinates
 * @returns {number} angle in degrees
 */
function inscribedAngle(ax, ay, bx, by, px, py) {
  const vax = ax - px;
  const vay = ay - py;
  const vbx = bx - px;
  const vby = by - py;
  const dot = vax * vbx + vay * vby;
  const magA = Math.sqrt(vax * vax + vay * vay);
  const magB = Math.sqrt(vbx * vbx + vby * vby);
  if (magA < 1e-9 || magB < 1e-9) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

/**
 * Computes the central angle (in degrees) at circle centre (cx, cy) for the arc
 * from A to B that does NOT contain point P (the "opposite" arc to P).
 * Returns a value in (0, 360].
 * @param {number} cx @param {number} cy - Circle centre
 * @param {number} ax @param {number} ay - Point A
 * @param {number} bx @param {number} by - Point B
 * @param {number} px @param {number} py - Reference point P (on the opposite arc)
 * @returns {number} central angle in degrees
 */
function centralAngleForArc(cx, cy, ax, ay, bx, by, px, py) {
  const angleA = Math.atan2(ay - cy, ax - cx);
  const angleB = Math.atan2(by - cy, bx - cx);
  const angleP = Math.atan2(py - cy, px - cx);

  // Counterclockwise arc from A to B (0 to 360 degrees)
  const arcAB = ((angleB - angleA) * (180 / Math.PI) + 360) % 360;

  // Position of P counterclockwise from A (0 to 360 degrees)
  const posP = ((angleP - angleA) * (180 / Math.PI) + 360) % 360;

  if (posP < arcAB) {
    // P is on the counterclockwise arc A→B, so it subtends the other arc (B→A ccw)
    return 360 - arcAB;
  }
  // P is on the counterclockwise arc B→A, so it subtends the arc A→B
  return arcAB;
}

/**
 * Checks whether an angle is approximately 90 degrees (a right angle).
 * @param {number} angleDeg - angle in degrees
 * @param {number} [tolerance=1] - acceptable deviation in degrees
 * @returns {boolean}
 */
function isRightAngle(angleDeg, tolerance = 1) {
  return Math.abs(angleDeg - 90) <= tolerance;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { inscribedAngle, centralAngleForArc, isRightAngle };
}
