/**
 * Shared UI component helpers for GeometryVisualisation.
 * These are lightweight wrappers used by p5.js sketches.
 */

/**
 * Draws a text label at the given position.
 * @param {object} p - p5 instance
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {object} [options]
 * @param {number} [options.size=14]
 * @param {string} [options.colour='#000000']
 */
function drawLabel(p, text, x, y, options = {}) {
  const { size = 14, colour = '#000000' } = options;
  p.push();
  p.fill(colour);
  p.noStroke();
  p.textSize(size);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(text, x, y);
  p.pop();
}

/**
 * Draws a simple reset button on the canvas and returns its bounding box.
 * @param {object} p - p5 instance
 * @param {number} x - Left edge
 * @param {number} y - Top edge
 * @param {number} [width=80]
 * @param {number} [height=30]
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
function drawResetButton(p, x, y, width = 80, height = 30) {
  p.push();
  p.fill('#4a90e2');
  p.stroke('#2c5f9e');
  p.strokeWeight(1);
  p.rect(x, y, width, height, 6);
  p.fill('#ffffff');
  p.noStroke();
  p.textSize(13);
  p.textAlign(p.CENTER, p.CENTER);
  p.text('Reset', x + width / 2, y + height / 2);
  p.pop();
  return { x, y, width, height };
}

/**
 * Returns true if the given (px, py) point is inside a rectangle.
 * @param {number} px
 * @param {number} py
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @returns {boolean}
 */
function isInsideRect(px, py, rect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}

/**
 * Draws a horizontal slider on the canvas and returns its current value.
 * @param {object} p - p5 instance
 * @param {number} x - Left edge of track
 * @param {number} y - Centre y of track
 * @param {number} trackWidth
 * @param {number} min
 * @param {number} max
 * @param {number} value - Current value
 * @param {string} [label='']
 * @returns {number} The (unchanged) current value — update via mouse interaction in the sketch
 */
function drawSlider(p, x, y, trackWidth, min, max, value, label = '') {
  const t = (value - min) / (max - min);
  const handleX = x + t * trackWidth;

  p.push();
  // Track
  p.stroke('#cccccc');
  p.strokeWeight(4);
  p.line(x, y, x + trackWidth, y);
  // Handle
  p.fill('#4a90e2');
  p.noStroke();
  p.ellipse(handleX, y, 16, 16);
  // Label
  if (label) {
    p.fill('#333333');
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(label + ': ' + value, x, y - 8);
  }
  p.pop();

  return value;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    drawLabel,
    drawResetButton,
    isInsideRect,
    drawSlider,
  };
}
