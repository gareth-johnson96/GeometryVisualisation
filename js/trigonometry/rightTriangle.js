/* global p5, sinDeg, cosDeg, tanDeg, rightTriangleSides */
'use strict';

/**
 * Right-Angled Triangle – Interactive p5.js sketch (instance mode).
 *
 * Features:
 *  - Draggable angle handle at vertex C (yellow circle)
 *  - Angle clamped to 1°–89°, initial 35°
 *  - Colour-coded sides: hyp=blue, opp=red, adj=green
 *  - SOH CAH TOA formula box, values box
 *  - Reset button
 */

(function () {
  // ── Constants ─────────────────────────────────────────────────────────────
  var CANVAS_W  = 560;
  var CANVAS_H  = 480;
  var ORIGIN_X  = 100;
  var ORIGIN_Y  = 360;
  var HYP_PX    = 240;
  var MIN_ANGLE = 1;
  var MAX_ANGLE = 89;
  var INIT_ANGLE = 35;
  var HANDLE_R  = 10;

  var COL = {
    bg:        [248, 249, 250],
    hyp:       [26,  115, 232],
    opp:       [234,  67,  53],
    adj:       [52,  168,  83],
    handle:    [251, 188,   4],
    handleStk: [180, 130,   0],
    text:      [32,   33,  36],
    textMuted: [95,   99, 104],
    boxFill:   [255, 255, 255],
    boxBorder: [200, 210, 230],
    resetBtn:  [26,  115, 232],
  };

  // ── State ─────────────────────────────────────────────────────────────────
  var angleDeg = INIT_ANGLE;
  var isDragging = false;

  // Button geometry (set in setup)
  var resetBtn;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmt(n) {
    return (Math.round(n * 1000) / 1000).toFixed(3);
  }

  function fmtPx(px) {
    return (Math.round(px / 100 * 100) / 100).toFixed(2);
  }

  /** Compute the three vertex positions from the current angle */
  function vertices() {
    var sides = rightTriangleSides(HYP_PX, angleDeg);
    var adj = sides.adjacent;
    var opp = sides.opposite;
    return {
      A: { x: ORIGIN_X,       y: ORIGIN_Y },           // right angle at A? No — right angle at B
      B: { x: ORIGIN_X + adj, y: ORIGIN_Y },
      C: { x: ORIGIN_X + adj, y: ORIGIN_Y - opp },
    };
  }

  /** Derive angle from mouse position relative to A */
  function angleFromMouse(mx, my) {
    var dx = mx - ORIGIN_X;
    var dy = ORIGIN_Y - my; // invert y
    if (dx <= 0) return MIN_ANGLE;
    var a = Math.atan2(dy, dx) * 180 / Math.PI;
    return Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, a));
  }

  function btnHit(btn, mx, my) {
    return mx >= btn.x && mx <= btn.x + btn.w &&
           my >= btn.y && my <= btn.y + btn.h;
  }

  // ── p5 sketch ─────────────────────────────────────────────────────────────
  var sketch = function (p) {

    p.setup = function () {
      var canvas = p.createCanvas(CANVAS_W, CANVAS_H);
      canvas.parent('canvas-container');
      canvas.elt.setAttribute('aria-label', 'Right-angled triangle trigonometry visualisation');
      p.textFont('Segoe UI, Arial, sans-serif');
      resetBtn = { x: CANVAS_W - 90, y: CANVAS_H - 40, w: 76, h: 28 };
    };

    p.draw = function () {
      p.background(...COL.bg);
      var v = vertices();
      drawTriangle(v);
      drawRightAngleMarker(v.B);
      drawAngleArc(v.A, v.B);
      drawSideLabels(v);
      drawFormulaBox();
      drawValuesBox();
      drawHandle(v.C);
      drawResetBtn();
    };

    // ── Triangle sides ──────────────────────────────────────────────────
    function drawTriangle(v) {
      // Hypotenuse: A → C (blue)
      p.push();
      p.stroke(...COL.hyp);
      p.strokeWeight(3);
      p.line(v.A.x, v.A.y, v.C.x, v.C.y);
      p.pop();

      // Opposite: B → C (red)
      p.push();
      p.stroke(...COL.opp);
      p.strokeWeight(3);
      p.line(v.B.x, v.B.y, v.C.x, v.C.y);
      p.pop();

      // Adjacent: A → B (green)
      p.push();
      p.stroke(...COL.adj);
      p.strokeWeight(3);
      p.line(v.A.x, v.A.y, v.B.x, v.B.y);
      p.pop();
    }

    // ── Right-angle square at B ─────────────────────────────────────────
    function drawRightAngleMarker(B) {
      var s = 12;
      p.push();
      p.noFill();
      p.stroke(...COL.text);
      p.strokeWeight(1.5);
      p.rect(B.x - s, B.y - s, s, s);
      p.pop();
    }

    // ── Angle arc at A ──────────────────────────────────────────────────
    function drawAngleArc(A, B) {
      var r = 40;
      p.push();
      p.noFill();
      p.stroke(...COL.hyp);
      p.strokeWeight(2);
      // Arc from 0 (adj direction = right) to -angleDeg (upward)
      p.arc(A.x, A.y, r * 2, r * 2, -angleDeg * Math.PI / 180, 0);

      // θ label
      var midA = -angleDeg / 2 * Math.PI / 180;
      p.fill(...COL.text);
      p.noStroke();
      p.textSize(14);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('\u03B8 = ' + Math.round(angleDeg) + '\u00B0',
        A.x + (r + 8) * Math.cos(midA),
        A.y + (r + 8) * Math.sin(midA));
      p.pop();
    }

    // ── Side labels ─────────────────────────────────────────────────────
    function drawSideLabels(v) {
      // Hypotenuse midpoint label
      var hypMx = (v.A.x + v.C.x) / 2;
      var hypMy = (v.A.y + v.C.y) / 2;
      var sides = rightTriangleSides(HYP_PX, angleDeg);
      p.push();
      p.textSize(13);
      p.textAlign(p.RIGHT, p.CENTER);
      p.fill(...COL.hyp);
      p.noStroke();
      p.text('hyp = ' + fmtPx(HYP_PX), hypMx - 10, hypMy);

      // Opposite midpoint label
      var oppMx = (v.B.x + v.C.x) / 2;
      var oppMy = (v.B.y + v.C.y) / 2;
      p.textAlign(p.LEFT, p.CENTER);
      p.fill(...COL.opp);
      p.text('opp = ' + fmtPx(sides.opposite), oppMx + 8, oppMy);

      // Adjacent midpoint label
      var adjMx = (v.A.x + v.B.x) / 2;
      var adjMy = v.A.y + 18;
      p.textAlign(p.CENTER, p.TOP);
      p.fill(...COL.adj);
      p.text('adj = ' + fmtPx(sides.adjacent), adjMx, adjMy);
      p.pop();
    }

    // ── SOH CAH TOA formula box (top-left) ──────────────────────────────
    function drawFormulaBox() {
      var bx = 10, by = 10, bw = 200, bh = 76;
      p.push();
      p.fill(...COL.boxFill);
      p.stroke(...COL.boxBorder);
      p.strokeWeight(1.5);
      p.rect(bx, by, bw, bh, 8);

      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);

      p.fill(...COL.opp);
      p.text('SOH:  sin \u03B8 = opp / hyp', bx + 10, by + 10);
      p.fill(...COL.adj);
      p.text('CAH:  cos \u03B8 = adj / hyp', bx + 10, by + 30);
      p.fill(...COL.hyp);
      p.text('TOA:  tan \u03B8 = opp / adj', bx + 10, by + 50);
      p.pop();
    }

    // ── Values box (top-right) ───────────────────────────────────────────
    function drawValuesBox() {
      var bw = 160, bh = 76;
      var bx = CANVAS_W - bw - 10, by = 10;
      var s = sinDeg(angleDeg);
      var c = cosDeg(angleDeg);
      var t = tanDeg(angleDeg);

      p.push();
      p.fill(...COL.boxFill);
      p.stroke(...COL.boxBorder);
      p.strokeWeight(1.5);
      p.rect(bx, by, bw, bh, 8);

      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);

      p.fill(...COL.opp);
      p.text('sin \u03B8 = ' + fmt(s), bx + 10, by + 10);
      p.fill(...COL.adj);
      p.text('cos \u03B8 = ' + fmt(c), bx + 10, by + 30);
      p.fill(...COL.hyp);
      p.text('tan \u03B8 = ' + fmt(t), bx + 10, by + 50);
      p.pop();
    }

    // ── Draggable handle at C ────────────────────────────────────────────
    function drawHandle(C) {
      p.push();
      p.fill(...COL.handle);
      p.stroke(...COL.handleStk);
      p.strokeWeight(2);
      p.ellipse(C.x, C.y, HANDLE_R * 2, HANDLE_R * 2);
      p.pop();
    }

    // ── Reset button ─────────────────────────────────────────────────────
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

    // ── Interaction ──────────────────────────────────────────────────────
    function isNearHandle(mx, my) {
      var v = vertices();
      var dx = mx - v.C.x;
      var dy = my - v.C.y;
      return Math.sqrt(dx * dx + dy * dy) <= HANDLE_R + 8;
    }

    p.mousePressed = function () {
      var mx = p.mouseX, my = p.mouseY;
      if (btnHit(resetBtn, mx, my)) {
        angleDeg = INIT_ANGLE;
        return false;
      }
      if (isNearHandle(mx, my)) {
        isDragging = true;
        return false;
      }
    };

    p.mouseDragged = function () {
      if (isDragging) {
        angleDeg = angleFromMouse(p.mouseX, p.mouseY);
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
          angleDeg = INIT_ANGLE;
        } else if (isNearHandle(t.x, t.y)) {
          isDragging = true;
        }
      }
      return false;
    };

    p.touchMoved = function () {
      if (isDragging && p.touches.length > 0) {
        angleDeg = angleFromMouse(p.touches[0].x, p.touches[0].y);
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
