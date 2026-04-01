/* global p5, interiorAngle, exteriorAngle, polygonVertices, polygonName */
'use strict';

/**
 * Regular Polygon Angles – Interactive p5.js sketch (instance mode).
 *
 * Features:
 *  - Slider (3–20 sides) redraws the polygon live
 *  - Interior and exterior angles highlighted and labelled
 *  - "Walk the perimeter" animation proving exterior angles sum to 360°
 *  - Polygon name displayed (KS2/KS3)
 *  - Algebraic formulae displayed (KS4/KS5)
 */

(function () {
  // ── Constants ─────────────────────────────────────────────────────────────
  var CANVAS_W = 560;
  var CANVAS_H = 520;
  var RADIUS = 170;
  var MIN_SIDES = 3;
  var MAX_SIDES = 20;

  var COL = {
    bg: [248, 249, 250],
    polygon: [26, 115, 232],
    polygonFill: [230, 240, 255],
    interior: [234, 67, 53],
    exterior: [52, 168, 83],
    walker: [251, 188, 4],
    walkerStroke: [180, 130, 0],
    text: [32, 33, 36],
    textMuted: [95, 99, 104],
    formulaBox: [255, 255, 255],
    formulaBorder: [200, 210, 230],
  };

  // ── State ─────────────────────────────────────────────────────────────────
  var sides = 6;
  var cx, cy;

  // Slider geometry
  var sliderX, sliderY, sliderW;
  var isDraggingSlider = false;

  // Walk animation
  var isWalking = false;
  var walkStep = 0;       // current vertex index (0 … sides)
  var walkProgress = 0;   // 0 → 1 within current rotation step
  var walkBaseAngle = 0;  // accumulated heading angle (radians)
  var WALK_SPEED = 0.025; // fraction of step per frame

  // Button geometry
  var walkBtn, resetBtn;

  // ── Helper ────────────────────────────────────────────────────────────────
  function fmtDeg(deg) {
    return Math.round(deg * 10) / 10 + '\u00b0';
  }

  // ── p5 sketch ─────────────────────────────────────────────────────────────
  var sketch = function (p) {

    p.setup = function () {
      var canvas = p.createCanvas(CANVAS_W, CANVAS_H);
      canvas.parent('canvas-container');
      canvas.elt.setAttribute('aria-label', 'Regular polygon angles visualisation');
      p.textFont('Segoe UI, Arial, sans-serif');
      cx = CANVAS_W / 2;
      cy = CANVAS_H / 2 - 10;

      sliderW = 220;
      sliderX = cx - sliderW / 2;
      sliderY = CANVAS_H - 68;

      walkBtn  = { x: cx - 110, y: CANVAS_H - 42, w: 160, h: 30 };
      resetBtn = { x: cx + 60,  y: CANVAS_H - 42, w: 80,  h: 30 };
    };

    p.draw = function () {
      p.background(...COL.bg);

      var verts = polygonVertices(cx, cy, RADIUS, sides);
      var intAngle = interiorAngle(sides);
      var extAngle = exteriorAngle(sides);

      drawPolygon(verts);
      drawInteriorAngle(verts, intAngle);
      drawExteriorAngle(verts, extAngle);
      drawFormulas(intAngle, extAngle);
      drawSliderControl();
      drawButtons();
      drawPolygonLabel(verts);

      if (isWalking) {
        advanceWalk();
        drawWalker(verts);
      }
    };

    // ── Draw polygon ─────────────────────────────────────────────────────
    function drawPolygon(verts) {
      p.push();
      p.fill(...COL.polygonFill);
      p.stroke(...COL.polygon);
      p.strokeWeight(2.5);
      p.beginShape();
      verts.forEach(function (v) { p.vertex(v.x, v.y); });
      p.endShape(p.CLOSE);
      p.pop();
    }

    // ── Interior angle arc (at vertex 0) ────────────────────────────────
    function drawInteriorAngle(verts, intAngle) {
      var v  = verts[0];
      var vP = verts[verts.length - 1]; // previous vertex
      var vN = verts[1];                // next vertex

      var a1 = Math.atan2(vP.y - v.y, vP.x - v.x);
      var a2 = Math.atan2(vN.y - v.y, vN.x - v.x);

      p.push();
      p.noFill();
      p.stroke(...COL.interior);
      p.strokeWeight(2.5);
      var arcR = 40;
      // Ensure arc goes the short way (interior)
      p.arc(v.x, v.y, arcR * 2, arcR * 2, a1, a2);

      // Label
      var midA = (a1 + a2) / 2;
      var lx = v.x + (arcR + 16) * Math.cos(midA);
      var ly = v.y + (arcR + 16) * Math.sin(midA);
      p.fill(...COL.interior);
      p.noStroke();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(fmtDeg(intAngle), lx, ly);
      p.pop();
    }

    // ── Exterior angle arc (at vertex 1) ────────────────────────────────
    function drawExteriorAngle(verts, extAngle) {
      var n  = verts.length;
      var v  = verts[1];
      var vP = verts[0];
      var vN = verts[2];

      // Direction of incoming edge (from vP to v) extended
      var inDirAngle = Math.atan2(v.y - vP.y, v.x - vP.x);
      var outDirAngle = Math.atan2(vN.y - v.y, vN.x - v.x);

      // Exterior angle is the supplement of the turn
      // Draw a small arc from the extension of the incoming edge to the outgoing edge
      p.push();
      p.noFill();
      p.stroke(...COL.exterior);
      p.strokeWeight(2.5);

      // Extend the incoming edge
      var extLen = 45;
      var extX = v.x + extLen * Math.cos(inDirAngle);
      var extY = v.y + extLen * Math.sin(inDirAngle);
      p.line(v.x, v.y, extX, extY);

      // Arc from extension direction (inDirAngle) to outgoing direction
      var arcR = 36;
      p.arc(v.x, v.y, arcR * 2, arcR * 2, inDirAngle, outDirAngle);

      // Label
      var midA = (inDirAngle + outDirAngle) / 2;
      var lx = v.x + (arcR + 18) * Math.cos(midA);
      var ly = v.y + (arcR + 18) * Math.sin(midA);
      p.fill(...COL.exterior);
      p.noStroke();
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(fmtDeg(extAngle), lx, ly);
      p.pop();
    }

    // ── Formula box ──────────────────────────────────────────────────────
    function drawFormulas(intAngle, extAngle) {
      var bx = 10, by = 10, bw = 215, bh = 76;
      p.push();
      p.fill(...COL.formulaBox);
      p.stroke(...COL.formulaBorder);
      p.strokeWeight(1.5);
      p.rect(bx, by, bw, bh, 8);

      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);

      // Interior
      p.fill(...COL.interior);
      p.text('\u25A0 Interior angle = (n \u2212 2) \u00D7 180\u00B0 / n', bx + 10, by + 10);
      p.text('  = ' + fmtDeg(intAngle) + '  (n = ' + sides + ')', bx + 10, by + 27);

      // Exterior
      p.fill(...COL.exterior);
      p.text('\u25A0 Exterior angle = 360\u00B0 / n', bx + 10, by + 46);
      p.text('  = ' + fmtDeg(extAngle) + '  (n = ' + sides + ')', bx + 10, by + 63);
      p.pop();
    }

    // ── Polygon name label ───────────────────────────────────────────────
    function drawPolygonLabel(verts) {
      p.push();
      p.fill(...COL.textMuted);
      p.noStroke();
      p.textSize(15);
      p.textAlign(p.RIGHT, p.TOP);
      p.text('Regular ' + polygonName(sides), CANVAS_W - 10, 10);
      p.pop();
    }

    // ── Slider control ───────────────────────────────────────────────────
    function drawSliderControl() {
      p.push();
      // Track
      p.stroke(200);
      p.strokeWeight(4);
      p.line(sliderX, sliderY, sliderX + sliderW, sliderY);

      // Filled portion
      var t = (sides - MIN_SIDES) / (MAX_SIDES - MIN_SIDES);
      p.stroke(...COL.polygon);
      p.strokeWeight(4);
      p.line(sliderX, sliderY, sliderX + t * sliderW, sliderY);

      // Handle
      var hx = sliderX + t * sliderW;
      p.fill(...COL.polygon);
      p.noStroke();
      p.ellipse(hx, sliderY, 18, 18);

      // Tick marks for min and max
      p.stroke(160);
      p.strokeWeight(1);
      p.line(sliderX, sliderY - 6, sliderX, sliderY + 6);
      p.line(sliderX + sliderW, sliderY - 6, sliderX + sliderW, sliderY + 6);

      // Labels
      p.fill(...COL.textMuted);
      p.noStroke();
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(MIN_SIDES, sliderX, sliderY + 16);
      p.text(MAX_SIDES, sliderX + sliderW, sliderY + 16);

      p.textSize(13);
      p.fill(...COL.text);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text('Sides: ' + sides, cx, sliderY - 12);
      p.pop();
    }

    // ── Walk the perimeter animation ─────────────────────────────────────
    function advanceWalk() {
      walkProgress += WALK_SPEED;
      if (walkProgress >= 1) {
        walkProgress = 0;
        walkStep++;
        if (walkStep >= sides) {
          // Animation complete
          isWalking = false;
          walkStep = 0;
          walkProgress = 0;
          walkBaseAngle = 0;
        } else {
          // Turn by exterior angle at each vertex
          walkBaseAngle += (2 * Math.PI) / sides;
        }
      }
    }

    function drawWalker(verts) {
      if (walkStep >= verts.length) return;
      var from = verts[walkStep];
      var to   = verts[(walkStep + 1) % verts.length];

      // Current position along the edge
      var wx = p.lerp(from.x, to.x, walkProgress);
      var wy = p.lerp(from.y, to.y, walkProgress);

      // Direction arrow
      var headingAngle = Math.atan2(to.y - from.y, to.x - from.x);

      p.push();
      p.translate(wx, wy);
      p.rotate(headingAngle);

      // Body
      p.fill(...COL.walker);
      p.stroke(...COL.walkerStroke);
      p.strokeWeight(1.5);
      p.ellipse(0, 0, 20, 20);

      // Arrow
      p.stroke(...COL.walkerStroke);
      p.strokeWeight(2);
      p.line(0, 0, 14, 0);
      p.fill(...COL.walkerStroke);
      p.noStroke();
      p.triangle(14, 0, 8, -4, 8, 4);
      p.pop();

      // Progress label
      var stepsLeft = sides - walkStep;
      p.push();
      p.fill(...COL.walker);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.RIGHT, p.TOP);
      p.text(
        'Turning ' + walkStep + '\u00D7' + fmtDeg(exteriorAngle(sides)) +
        ' = ' + fmtDeg(walkStep * exteriorAngle(sides)),
        CANVAS_W - 10, CANVAS_H - 90
      );
      p.pop();
    }

    // ── Buttons ──────────────────────────────────────────────────────────
    function drawButtons() {
      drawBtn(walkBtn,  isWalking ? 'Walking\u2026' : 'Walk the perimeter', COL.exterior);
      drawBtn(resetBtn, 'Reset',                                              COL.polygon);
    }

    function drawBtn(btn, label, col) {
      p.push();
      p.fill(...col);
      p.stroke(darken(col));
      p.strokeWeight(1);
      p.rect(btn.x, btn.y, btn.w, btn.h, 6);
      p.fill(255);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, btn.x + btn.w / 2, btn.y + btn.h / 2);
      p.pop();
    }

    function darken(col) {
      return [col[0] * 0.7, col[1] * 0.7, col[2] * 0.7];
    }

    // ── Slider interaction ───────────────────────────────────────────────
    function sliderHitTest(mx, my) {
      return my > sliderY - 14 && my < sliderY + 14 &&
             mx > sliderX - 14 && mx < sliderX + sliderW + 14;
    }

    function updateSidesFromMouse(mx) {
      var t = p.constrain((mx - sliderX) / sliderW, 0, 1);
      sides = Math.round(MIN_SIDES + t * (MAX_SIDES - MIN_SIDES));
      stopWalk();
    }

    function stopWalk() {
      isWalking = false;
      walkStep = 0;
      walkProgress = 0;
      walkBaseAngle = 0;
    }

    function btnHit(btn, mx, my) {
      return mx >= btn.x && mx <= btn.x + btn.w &&
             my >= btn.y && my <= btn.y + btn.h;
    }

    p.mousePressed = function () {
      var mx = p.mouseX, my = p.mouseY;
      if (sliderHitTest(mx, my)) {
        isDraggingSlider = true;
        updateSidesFromMouse(mx);
        return false;
      }
      if (btnHit(walkBtn, mx, my)) {
        if (!isWalking) {
          isWalking = true;
          walkStep = 0;
          walkProgress = 0;
          walkBaseAngle = 0;
        }
        return false;
      }
      if (btnHit(resetBtn, mx, my)) {
        sides = 6;
        stopWalk();
        return false;
      }
    };

    p.mouseDragged = function () {
      if (isDraggingSlider) {
        updateSidesFromMouse(p.mouseX);
        return false;
      }
    };

    p.mouseReleased = function () {
      isDraggingSlider = false;
    };

    p.touchStarted = function () {
      if (p.touches.length > 0) {
        var t = p.touches[0];
        if (sliderHitTest(t.x, t.y)) {
          isDraggingSlider = true;
          updateSidesFromMouse(t.x);
        } else if (btnHit(walkBtn, t.x, t.y)) {
          if (!isWalking) {
            isWalking = true;
            walkStep = 0;
            walkProgress = 0;
            walkBaseAngle = 0;
          }
        } else if (btnHit(resetBtn, t.x, t.y)) {
          sides = 6;
          stopWalk();
        }
      }
      return false;
    };

    p.touchMoved = function () {
      if (isDraggingSlider && p.touches.length > 0) {
        updateSidesFromMouse(p.touches[0].x);
      }
      return false;
    };

    p.touchEnded = function () {
      isDraggingSlider = false;
    };
  };

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', function () {
    new p5(sketch); // eslint-disable-line no-new
  });
})();
