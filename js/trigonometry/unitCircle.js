/* global p5, sinDeg, cosDeg, tanDeg */
'use strict';

/**
 * Unit Circle – Interactive p5.js sketch (instance mode).
 *
 * Features:
 *  - Draggable point on the unit circle
 *  - Colour-coded projections: cos (green), sin (red)
 *  - Tangent segment at (1,0): orange
 *  - Values panel: θ°, θ rad, sin θ, cos θ, tan θ
 *  - Reset button
 */

(function () {
  // ── Constants ─────────────────────────────────────────────────────────────
  var CANVAS_W = 560;
  var CANVAS_H = 520;
  var CX       = 280;
  var CY       = 260;
  var RADIUS   = 180;
  var HANDLE_R = 10;

  var COL = {
    bg:        [248, 249, 250],
    circle:    [26,  115, 232],
    axis:      [160, 160, 160],
    cos:       [52,  168,  83],   // green
    sin:       [234,  67,  53],   // red
    tan:       [251, 130,   0],   // orange
    handle:    [251, 188,   4],
    handleStk: [180, 130,   0],
    text:      [32,   33,  36],
    textMuted: [95,   99, 104],
    boxFill:   [255, 255, 255],
    boxBorder: [200, 210, 230],
    resetBtn:  [26,  115, 232],
  };

  // ── State ─────────────────────────────────────────────────────────────────
  var angle = -Math.PI / 6; // -30°, initial
  var isDragging = false;
  var resetBtn;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmt(n) {
    return (Math.round(n * 1000) / 1000).toFixed(3);
  }

  function toDeg(r) {
    var d = r * 180 / Math.PI;
    return Math.round(d * 10) / 10;
  }

  function btnHit(btn, mx, my) {
    return mx >= btn.x && mx <= btn.x + btn.w &&
           my >= btn.y && my <= btn.y + btn.h;
  }

  /** Convert unit-circle coords to canvas coords */
  function toCanvas(ux, uy) {
    return { x: CX + ux * RADIUS, y: CY - uy * RADIUS };
  }

  // ── p5 sketch ─────────────────────────────────────────────────────────────
  var sketch = function (p) {

    p.setup = function () {
      var canvas = p.createCanvas(CANVAS_W, CANVAS_H);
      canvas.parent('canvas-container');
      canvas.elt.setAttribute('aria-label', 'Unit circle trigonometry visualisation');
      p.textFont('Segoe UI, Arial, sans-serif');
      resetBtn = { x: CANVAS_W - 90, y: CANVAS_H - 40, w: 76, h: 28 };
    };

    p.draw = function () {
      p.background(...COL.bg);

      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);
      var tanA = sinA / cosA; // may be ±Infinity at ±90°

      drawAxes();
      drawCircle();
      drawProjections(cosA, sinA, tanA);
      drawTangentLine(cosA, sinA, tanA);
      drawHandle(cosA, sinA);
      drawValuesBox(cosA, sinA, tanA);
      drawResetBtn();
    };

    // ── Axes ─────────────────────────────────────────────────────────────
    function drawAxes() {
      p.push();
      p.stroke(...COL.axis);
      p.strokeWeight(1.5);
      // x-axis
      p.line(CX - RADIUS - 30, CY, CX + RADIUS + 30, CY);
      // y-axis
      p.line(CX, CY - RADIUS - 30, CX, CY + RADIUS + 30);

      // Tick at (1,0), (-1,0), (0,1), (0,-1)
      p.stroke(...COL.axis);
      p.strokeWeight(1);
      var ticks = [
        [1, 0, '1'], [-1, 0, '-1'], [0, 1, '1'], [0, -1, '-1']
      ];
      p.fill(...COL.textMuted);
      p.noStroke();
      p.textSize(11);
      ticks.forEach(function (tk) {
        var cp = toCanvas(tk[0], tk[1]);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(tk[2], cp.x + (tk[0] !== 0 ? 0 : 10), cp.y + (tk[1] !== 0 ? 0 : 10));
      });
      p.pop();
    }

    // ── Unit circle ──────────────────────────────────────────────────────
    function drawCircle() {
      p.push();
      p.noFill();
      p.stroke(...COL.circle);
      p.strokeWeight(2);
      p.ellipse(CX, CY, RADIUS * 2, RADIUS * 2);
      p.pop();
    }

    // ── cos and sin projections ───────────────────────────────────────────
    function drawProjections(cosA, sinA) {
      var pt   = toCanvas(cosA, sinA);
      var cosP = toCanvas(cosA, 0);

      // cos: horizontal line from centre to (cos, 0) — green
      p.push();
      p.stroke(...COL.cos);
      p.strokeWeight(3);
      p.line(CX, CY, cosP.x, cosP.y);

      // cos label below the line
      p.fill(...COL.cos);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text('cos \u03B8', (CX + cosP.x) / 2, CY + 6);
      p.pop();

      // sin: vertical line from (cos,0) to point — red
      p.push();
      p.stroke(...COL.sin);
      p.strokeWeight(3);
      p.line(cosP.x, cosP.y, pt.x, pt.y);

      // sin label
      p.fill(...COL.sin);
      p.noStroke();
      p.textSize(12);
      p.textAlign(cosA >= 0 ? p.LEFT : p.RIGHT, p.CENTER);
      p.text('sin \u03B8', cosP.x + (cosA >= 0 ? 6 : -6), (cosP.y + pt.y) / 2);
      p.pop();

      // Radius line from centre to point (blue dashed)
      p.push();
      p.stroke(...COL.circle);
      p.strokeWeight(1.5);
      p.drawingContext.setLineDash([5, 4]);
      p.line(CX, CY, pt.x, pt.y);
      p.drawingContext.setLineDash([]);
      p.pop();
    }

    // ── Tangent segment at (1,0) ──────────────────────────────────────────
    function drawTangentLine(cosA, sinA, tanA) {
      // The tangent line: vertical line x=1 intersected by the line from origin
      // Intersection point is (1, tan θ) in unit-circle coords
      if (Math.abs(cosA) < 0.01) return; // near 90° / 270°, skip

      var tanPt = toCanvas(1, tanA);
      var axisP = toCanvas(1, 0);

      // Clamp drawing to reasonable canvas height
      var clampedTanA = Math.max(-4, Math.min(4, tanA));
      var tanPtClamped = toCanvas(1, clampedTanA);

      p.push();
      p.stroke(...COL.tan);
      p.strokeWeight(3);
      p.line(axisP.x, axisP.y, tanPtClamped.x, tanPtClamped.y);

      // label
      p.fill(...COL.tan);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('tan \u03B8', axisP.x + 6, (axisP.y + tanPtClamped.y) / 2);
      p.pop();
    }

    // ── Draggable handle ──────────────────────────────────────────────────
    function drawHandle(cosA, sinA) {
      var pt = toCanvas(cosA, sinA);
      p.push();
      p.fill(...COL.handle);
      p.stroke(...COL.handleStk);
      p.strokeWeight(2);
      p.ellipse(pt.x, pt.y, HANDLE_R * 2, HANDLE_R * 2);
      p.pop();
    }

    // ── Values box (bottom-left) ──────────────────────────────────────────
    function drawValuesBox(cosA, sinA, tanA) {
      var bx = 10, by = CANVAS_H - 132, bw = 175, bh = 120;
      var tanStr = Math.abs(Math.cos(angle)) < 0.01 ? 'undef.' : fmt(tanA);
      var degStr = toDeg(angle);
      var radStr = (Math.round(angle * 1000) / 1000).toFixed(3);

      p.push();
      p.fill(...COL.boxFill);
      p.stroke(...COL.boxBorder);
      p.strokeWeight(1.5);
      p.rect(bx, by, bw, bh, 8);

      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      var lx = bx + 10;

      p.fill(...COL.text);
      p.text('\u03B8 = ' + degStr + '\u00B0  (' + radStr + ' rad)', lx, by + 10);

      p.fill(...COL.sin);
      p.text('sin \u03B8 = ' + fmt(sinA), lx, by + 30);

      p.fill(...COL.cos);
      p.text('cos \u03B8 = ' + fmt(cosA), lx, by + 50);

      p.fill(...COL.tan);
      p.text('tan \u03B8 = ' + tanStr, lx, by + 70);
      p.pop();
    }

    // ── Reset button ──────────────────────────────────────────────────────
    function drawResetBtn() {
      p.push();
      p.fill(...COL.resetBtn);
      p.stroke(darken(COL.resetBtn));
      p.strokeWeight(1);
      p.rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 6);
      p.fill(255);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Reset', resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2);
      p.pop();
    }

    function darken(col) {
      return [col[0] * 0.7, col[1] * 0.7, col[2] * 0.7];
    }

    // ── Interaction ───────────────────────────────────────────────────────
    function isNearHandle(mx, my) {
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);
      var pt = toCanvas(cosA, sinA);
      var dx = mx - pt.x;
      var dy = my - pt.y;
      return Math.sqrt(dx * dx + dy * dy) <= HANDLE_R + 10;
    }

    function updateAngleFromMouse(mx, my) {
      angle = Math.atan2(CY - my, mx - CX);
    }

    p.mousePressed = function () {
      var mx = p.mouseX, my = p.mouseY;
      if (btnHit(resetBtn, mx, my)) {
        angle = -Math.PI / 6;
        return false;
      }
      if (isNearHandle(mx, my)) {
        isDragging = true;
        return false;
      }
    };

    p.mouseDragged = function () {
      if (isDragging) {
        updateAngleFromMouse(p.mouseX, p.mouseY);
        return false;
      }
    };

    p.mouseReleased = function () {
      isDragging = false;
    };

    p.touchStarted = function () {
      if (p.touches.length > 0) {
        var t = p.touches[0];
        if (btnHit(resetBtn, t.x, t.y)) {
          angle = -Math.PI / 6;
        } else if (isNearHandle(t.x, t.y)) {
          isDragging = true;
        }
      }
      return false;
    };

    p.touchMoved = function () {
      if (isDragging && p.touches.length > 0) {
        updateAngleFromMouse(p.touches[0].x, p.touches[0].y);
      }
      return false;
    };

    p.touchEnded = function () {
      isDragging = false;
    };
  };

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', function () {
    new p5(sketch); // eslint-disable-line no-new
  });
})();
