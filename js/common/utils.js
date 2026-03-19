/**
 * Shared maths helpers for GeometryVisualisation
 */

/**
 * Converts degrees to radians.
 * @param {number} degrees
 * @returns {number}
 */
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 * @param {number} radians
 * @returns {number}
 */
function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Returns the {x, y} coordinates of a point on a circle.
 * @param {number} cx - Centre x
 * @param {number} cy - Centre y
 * @param {number} radius
 * @param {number} angleRadians - Angle in radians (0 = right, clockwise)
 * @returns {{ x: number, y: number }}
 */
function pointOnCircle(cx, cy, radius, angleRadians) {
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}

/**
 * Returns the angle (in radians) of the line from (x1, y1) to (x2, y2).
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function angleBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Returns the Euclidean distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function distanceBetweenPoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamps a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    degreesToRadians,
    radiansToDegrees,
    pointOnCircle,
    angleBetweenPoints,
    distanceBetweenPoints,
    clamp,
  };
}
