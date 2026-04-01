/* global p5, sinDeg, cosDeg, angleFromSides, sideFromCosineRule, dist2D */
'use strict';

/**
 * Triangle Rules – Interactive p5.js sketch (instance mode).
 *
 * Features:
 *  - General triangle with 3 draggable vertices
 *  - Shows side lengths a, b, c and angles A, B, C
 *  - Toggle between Sine Rule and Cosine Rule formula box
 *  - Reset button
 */

(function () {
  // ── Constants ─────────────────────────────────────────────────────────────
  var CANVAS_W   = 560;
  var CANVAS_H   = 520;
  var VERTEX_R   = 10;
  var SCALE      = 80;   // divide px by SCALE to get labelled lengths
  var MIN_AREA   = 200;  // minimum triangle area (px²) to avoid degenerate display

  var DEFAULT_A = { x: 140, y: 380 };
  var DEFAULT_B = { x: 420, y: 380 };
  var DEFAULT_C = { x: 280, y: 140 };

  var COL = {
    bg:          [248, 249, 250],
    side:        [60,   60,  60],
    vertex:      [26,  115, 232],
    vertexFill:  [200, 220, 255],
    label:       [32,   33,  36],
    textMuted:   [95,   99, 104],
    boxFill:     [255, 255, 255],
    boxBorder:   [200, 210, 230],
    resetBtn:    [26,  115, 232],
    toggleBtn:   [52,  168,  83],
    sine:        [234,  67,  53],   // red for sine rule highlights
    cosine:      [26,  115, 232],   // blue for cosine rule highlights
  };

  // ── State ─────────────────────────────────────────────────────────────────
  var vA, vB, vC;
  var dragging = null; // 'A', 'B', 'C', or null
  var showSine = true; // toggle between Sine and Cosine rule

  // Buttons
  var resetBtn, toggleBtn;

  function resetVertices() {
    vA = { x: DEFAULT_A.x, y: DEFAULT_A.y };
    vB = { x: DEFAULT_B.x, y: DEFAULT_B.y };
    vC = { x: DEFAULT_C.x, y: DEFAULT_C.y };
  }

  resetVertices();

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmt2(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function fmtDeg(n) {
    return (Math.round(n * 10) / 10).toFixed(1) + '\u00B0';
  }

  function btnHit(btn, mx, my) {
    return mx >= btn.x && mx <= btn.x + btn.w &&
           my >= btn.y && my <= btn.y + btn.h;
  }

  /** Clamp a vertex inside the canvas with some margin */
  function clamp(v) {
    return {
      x: Math.max(VERTEX_R + 5, Math.min(CANVAS_W - VERTEX_R - 5, v.x)),
      y: Math.max(VERTEX_R + 5, Math.min(CANVAS_H - 80, v.y)),
    };
  }

  /** Return side lengths a=BC, b=CA, c=AB */
  function sides() {
    return {
      a: dist2D(vB, vC),
      b: dist2D(vC, vA),
      c: dist2D(vA, vB),
    };
  }

  /** Return angles A, B, C in degrees */
  function angles(s) {
    var angA = angleFromSides(s.a, s.b, s.c);
    var angB = angleFromSides(s.b, s.a, s.c);
    var angC = angleFromSides(s.c, s.a, s.b);
    return { A: angA, B: angB, C: angC };
  }

  // ── p5 sketch ─────────────────────────────────────────────────────────────
  var sketch = function (p) {

    p.setup = function () {
      var canvas = p.createCanvas(CANVAS_W, CANVAS_H);
      canvas.parent('canvas-container');
      canvas.elt.setAttribute('aria-label', 'Sine and cosine rules triangle visualisation');
      p.textFont('Segoe UI, Arial, sans-serif');
      resetBtn  = { x: CANVAS_W - 90,  y: CANVAS_H - 40, w: 76, h: 28 };
      toggleBtn = { x: CANVAS_W - 220, y: CANVAS_H - 40, w: 120, h: 28 };
    };

    p.draw = function () {
      p.background(...COL.bg);

      var s = sides();
      var ang = angles(s);

      drawSides(s, ang);
      drawVertices(ang);
      drawFormulaBox(s, ang);
      drawButtons();
    };

    // ── Draw sides ────────────────────────────────────────────────────────
    function drawSides(s) {
      p.push();
      p.stroke(...COL.side);
      p.strokeWeight(2.5);
      p.line(vA.x, vA.y, vB.x, vB.y); // c
      p.line(vB.x, vB.y, vC.x, vC.y); // a
      p.line(vC.x, vC.y, vA.x, vA.y); // b
      p.pop();

      // Side labels at midpoints
      p.push();
      p.fill(...COL.label);
      p.noStroke();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);

      // a = BC
      labelSide(vB, vC, 'a = ' + fmt2(s.a / SCALE));
      // b = CA
      labelSide(vC, vA, 'b = ' + fmt2(s.b / SCALE));
      // c = AB
      labelSide(vA, vB, 'c = ' + fmt2(s.c / SCALE));
      p.pop();
    }

    function labelSide(p1, p2, txt) {
      var mx = (p1.x + p2.x) / 2;
      var my = (p1.y + p2.y) / 2;
      // Offset perpendicular to the side
      var dx = p2.x - p1.x;
      var dy = p2.y - p1.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len * 14;
      var ny =  dx / len * 14;
      p.text(txt, mx + nx, my + ny);
    }

    // ── Draw vertices ─────────────────────────────────────────────────────
    function drawVertices(ang) {
      drawVertex(vA, 'A', fmtDeg(ang.A));
      drawVertex(vB, 'B', fmtDeg(ang.B));
      drawVertex(vC, 'C', fmtDeg(ang.C));
    }

    function drawVertex(v, name, angleStr) {
      p.push();
      p.fill(...COL.vertexFill);
      p.stroke(...COL.vertex);
      p.strokeWeight(2);
      p.ellipse(v.x, v.y, VERTEX_R * 2, VERTEX_R * 2);

      // Name + angle label
      p.fill(...COL.vertex);
      p.noStroke();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(name + ' (' + angleStr + ')', v.x, v.y - VERTEX_R - 12);
      p.pop();
    }

    // ── Formula box ───────────────────────────────────────────────────────
    function drawFormulaBox(s, ang) {
      var bx = 10, by = 10, bw = 300, bh = showSine ? 80 : 96;
      p.push();
      p.fill(...COL.boxFill);
      p.stroke(...COL.boxBorder);
      p.strokeWeight(1.5);
      p.rect(bx, by, bw, bh, 8);

      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      var lx = bx + 10;

      if (showSine) {
        p.fill(...COL.sine);
        p.text('Sine Rule:  a / sin A = b / sin B = c / sin C', lx, by + 10);
        var ratio = s.a > 0 ? fmt2(s.a / sinDeg(ang.A)) : '—';
        p.fill(...COL.label);
        p.text(
          fmt2(s.a / SCALE) + ' / sin ' + fmtDeg(ang.A) +
          ' = ' + fmt2(s.b / SCALE) + ' / sin ' + fmtDeg(ang.B) +
          ' \u2248 ' + fmt2(ratio / SCALE),
          lx, by + 30
        );
        p.fill(...COL.textMuted);
        p.text('Common ratio \u2248 ' + fmt2(ratio / SCALE), lx, by + 52);
      } else {
        p.fill(...COL.cosine);
        p.text('Cosine Rule:  a\u00B2 = b\u00B2 + c\u00B2 \u2212 2bc\u00B7cos A', lx, by + 10);
        var a2 = s.a * s.a;
        var rhs = s.b * s.b + s.c * s.c - 2 * s.b * s.c * cosDeg(ang.A);
        p.fill(...COL.label);
        p.text(
          'a\u00B2 = ' + fmt2(a2 / (SCALE * SCALE)) +
          ',  b\u00B2+c\u00B2\u22122bc\u00B7cos A = ' + fmt2(rhs / (SCALE * SCALE)),
          lx, by + 30
        );
        p.fill(...COL.textMuted);
        p.text(
          'a = ' + fmt2(s.a / SCALE) +
          ',  b = ' + fmt2(s.b / SCALE) +
          ',  c = ' + fmt2(s.c / SCALE) +
          ',  A = ' + fmtDeg(ang.A),
          lx, by + 52
        );
        p.fill(...COL.textMuted);
        p.text(
          'Check: \u221A(b\u00B2+c\u00B2\u22122bc\u00B7cos A) = ' +
          fmt2(sideFromCosineRule(s.b, s.c, ang.A) / SCALE),
          lx, by + 72
        );
      }
      p.pop();
    }

    // ── Buttons ───────────────────────────────────────────────────────────
    function drawButtons() {
      // Toggle button
      p.push();
      p.fill(...COL.toggleBtn);
      p.stroke(darken(COL.toggleBtn));
      p.strokeWeight(1);
      p.rect(toggleBtn.x, toggleBtn.y, toggleBtn.w, toggleBtn.h, 6);
      p.fill(255);
      p.noStroke();
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(showSine ? 'Show Cosine Rule' : 'Show Sine Rule',
        toggleBtn.x + toggleBtn.w / 2, toggleBtn.y + toggleBtn.h / 2);
      p.pop();

      // Reset button
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
    function nearVertex(mx, my) {
      var candidates = [
        { name: 'A', v: vA },
        { name: 'B', v: vB },
        { name: 'C', v: vC },
      ];
      for (var i = 0; i < candidates.length; i++) {
        var c = candidates[i];
        var dx = mx - c.v.x;
        var dy = my - c.v.y;
        if (Math.sqrt(dx * dx + dy * dy) <= VERTEX_R + 10) {
          return c.name;
        }
      }
      return null;
    }

    function moveVertex(name, mx, my) {
      var v = clamp({ x: mx, y: my });
      if (name === 'A') vA = v;
      else if (name === 'B') vB = v;
      else if (name === 'C') vC = v;
    }

    p.mousePressed = function () {
      var mx = p.mouseX, my = p.mouseY;
      if (btnHit(resetBtn, mx, my)) {
        resetVertices();
        return false;
      }
      if (btnHit(toggleBtn, mx, my)) {
        showSine = !showSine;
        return false;
      }
      dragging = nearVertex(mx, my);
      return false;
    };

    p.mouseDragged = function () {
      if (dragging) {
        moveVertex(dragging, p.mouseX, p.mouseY);
        return false;
      }
    };

    p.mouseReleased = function () {
      dragging = null;
    };

    p.touchStarted = function () {
      if (p.touches.length > 0) {
        var t = p.touches[0];
        if (btnHit(resetBtn, t.x, t.y)) {
          resetVertices();
        } else if (btnHit(toggleBtn, t.x, t.y)) {
          showSine = !showSine;
        } else {
          dragging = nearVertex(t.x, t.y);
        }
      }
      return false;
    };

    p.touchMoved = function () {
      if (dragging && p.touches.length > 0) {
        moveVertex(dragging, p.touches[0].x, p.touches[0].y);
      }
      return false;
    };

    p.touchEnded = function () {
      dragging = null;
    };
  };

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', function () {
    new p5(sketch); // eslint-disable-line no-new
  });
})();
