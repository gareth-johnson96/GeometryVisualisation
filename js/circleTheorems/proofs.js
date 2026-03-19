/* global p5, getProofSteps */
'use strict';

/**
 * Circle Theorems – Animated Step-by-Step Visual Proofs (p5.js sketch).
 *
 * Each of the 6 circle theorems has a multi-step proof that builds up
 * incrementally.  Navigation is via "Previous Step" / "Next Step" buttons
 * and an optional "Auto-play" toggle.
 */

(function () {
  // ── Canvas & geometry constants ───────────────────────────────────────────
  var CANVAS_W = 480;
  var CANVAS_H = 480;
  var RADIUS   = 155;
  var POINT_R  = 8;
  var TWO_PI   = 2 * Math.PI;

  // ── Colour palette (matches sketch.js) ───────────────────────────────────
  var COL = {
    bg:          [248, 249, 250],
    circle:      [26,  115, 232],
    centre:      [234, 67,  53 ],
    pointA:      [52,  168, 83 ],
    pointB:      [26,  115, 232],
    pointC:      [52,  168, 83 ],
    lineMain:    [95,  99,  104],
    lineGreen:   [52,  168, 83 ],
    lineBlue:    [26,  115, 232],
    lineRed:     [234, 67,  53 ],
    lineOrange:  [251, 188, 4  ],
    tangent:     [251, 188, 4  ],
    angleRed:    [234, 67,  53 ],
    angleGreen:  [52,  168, 83 ],
    angleBlue:   [26,  115, 232],
    shadeAlpha:  [52,  168, 83,  55],
    shadeBeta:   [26,  115, 232, 55],
    text:        [32,  33,  36 ],
    textMuted:   [95,  99,  104],
    computed:    [158, 161, 167],
  };

  // ── Auto-play ─────────────────────────────────────────────────────────────
  var AUTO_STEP_MS = 2800;

  // ── State ─────────────────────────────────────────────────────────────────
  var currentTheorem = 1;
  var currentStep    = 0;
  var autoPlaying    = false;
  var lastAutoTime   = 0;
  var cx, cy;

  // ── Fixed point angles for each theorem proof (radians, p5 y-down) ────────
  //   0 = right (3 o'clock), π/2 = bottom (6 o'clock), π = left, −π/2 = top
  var PP = {
    1: { A: Math.PI / 3,          B: (2 * Math.PI) / 3, C: -Math.PI / 2 },
    2: { A: Math.PI / 4,          B: (3 * Math.PI) / 4, C: -Math.PI / 3, D: -(2 * Math.PI) / 3 },
    3: { A: 0,                    B: Math.PI,            C: -Math.PI / 2 },
    4: { A: -Math.PI / 4,         B: Math.PI / 3,        C: (2 * Math.PI) / 3, D: -(3 * Math.PI) / 4 },
    5: { P: 0 },
    6: { T: (2 * Math.PI) / 3,    A: Math.PI / 6,        B: -Math.PI / 3 },
  };

  // ── Geometry helpers ──────────────────────────────────────────────────────
  function ptX(a) { return cx + RADIUS * Math.cos(a); }
  function ptY(a) { return cy + RADIUS * Math.sin(a); }
  function pt(a)  { return { x: ptX(a), y: ptY(a) }; }

  // ── Drawing primitives ────────────────────────────────────────────────────

  function col(c) { return [c[0], c[1], c[2]]; }

  function drawCircleBase(p) {
    p.push();
    p.noFill();
    p.stroke.apply(p, COL.circle);
    p.strokeWeight(2);
    p.ellipse(cx, cy, RADIUS * 2, RADIUS * 2);
    // Centre dot
    p.fill.apply(p, COL.centre);
    p.noStroke();
    p.ellipse(cx, cy, 7, 7);
    // Label O
    p.fill.apply(p, COL.text);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.text('O', cx + 13, cy - 10);
    p.pop();
  }

  function drawPt(p, x, y, label, colour, labelOffX, labelOffY) {
    colour = colour || COL.pointA;
    p.push();
    p.fill.apply(p, colour);
    p.noStroke();
    p.ellipse(x, y, POINT_R * 2, POINT_R * 2);
    p.noFill();
    p.stroke(255, 255, 255);
    p.strokeWeight(2);
    p.ellipse(x, y, POINT_R * 2 + 3, POINT_R * 2 + 3);
    if (label) {
      var offX = labelOffX !== undefined ? labelOffX : (x - cx);
      var offY = labelOffY !== undefined ? labelOffY : (y - cy);
      var dist = Math.sqrt(offX * offX + offY * offY) || 1;
      var lx = x + (offX / dist) * 22;
      var ly = y + (offY / dist) * 22;
      p.noStroke();
      p.fill.apply(p, COL.text);
      p.textSize(15);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, lx, ly);
    }
    p.pop();
  }

  function drawLine(p, x1, y1, x2, y2, colour, weight) {
    p.push();
    p.stroke.apply(p, colour);
    p.strokeWeight(weight || 1.5);
    p.line(x1, y1, x2, y2);
    p.pop();
  }

  function drawDashedLine(p, x1, y1, x2, y2, colour, dashLen) {
    dashLen = dashLen || 8;
    var dx = x2 - x1, dy = y2 - y1;
    var total = Math.sqrt(dx * dx + dy * dy);
    if (total < 1e-6) return;
    var ux = dx / total, uy = dy / total;
    p.push();
    p.stroke.apply(p, colour);
    p.strokeWeight(1.5);
    for (var d = 0; d < total; d += dashLen * 2) {
      var end = Math.min(d + dashLen, total);
      p.line(x1 + ux * d, y1 + uy * d, x1 + ux * end, y1 + uy * end);
    }
    p.pop();
  }

  function drawArc(p, vx, vy, ax, ay, bx, by, arcR, colour) {
    var a1 = Math.atan2(ay - vy, ax - vx);
    var a2 = Math.atan2(by - vy, bx - vx);
    var diff = ((a2 - a1) + TWO_PI) % TWO_PI;
    p.push();
    p.noFill();
    p.stroke.apply(p, colour);
    p.strokeWeight(2);
    if (diff <= Math.PI) {
      p.arc(vx, vy, arcR * 2, arcR * 2, a1, a1 + diff);
    } else {
      p.arc(vx, vy, arcR * 2, arcR * 2, a2, a2 + (TWO_PI - diff));
    }
    p.pop();
  }

  function drawRightAngle(p, vx, vy, dx1, dy1, size) {
    size = size || 12;
    var len = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    var ux = (dx1 / len) * size, uy = (dy1 / len) * size;
    var px2 = -uy, py2 = ux;
    p.push();
    p.noFill();
    p.stroke.apply(p, COL.angleRed);
    p.strokeWeight(1.5);
    p.beginShape();
    p.vertex(vx + ux,        vy + uy);
    p.vertex(vx + ux + px2,  vy + uy + py2);
    p.vertex(vx + px2,       vy + py2);
    p.endShape();
    p.pop();
  }

  function drawLabel(p, text, x, y, colour, size) {
    p.push();
    p.noStroke();
    p.fill.apply(p, colour || COL.text);
    p.textSize(size || 13);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(text, x, y);
    p.pop();
  }

  function drawFilledTriangle(p, x1, y1, x2, y2, x3, y3, fillColour) {
    p.push();
    p.fill(fillColour[0], fillColour[1], fillColour[2], fillColour[3] || 50);
    p.noStroke();
    p.triangle(x1, y1, x2, y2, x3, y3);
    p.pop();
  }

  // ── Inscribed angle helper (degrees) ─────────────────────────────────────
  function inscribedAngle(ax, ay, bx, by, px, py) {
    var vax = ax - px, vay = ay - py;
    var vbx = bx - px, vby = by - py;
    var dot  = vax * vbx + vay * vby;
    var magA = Math.sqrt(vax * vax + vay * vay);
    var magB = Math.sqrt(vbx * vbx + vby * vby);
    if (magA < 1e-9 || magB < 1e-9) return 0;
    var cosA = Math.max(-1, Math.min(1, dot / (magA * magB)));
    return Math.acos(cosA) * (180 / Math.PI);
  }

  function fmt(deg) { return Math.round(Math.abs(deg)) + '\u00b0'; }

  // ── Draw layers: one function per (theorem, key) ──────────────────────────
  // Each function draws only the NEW element(s) for that step.
  // Because all layers 0…currentStep are called each frame, previous
  // elements naturally persist.

  var LAYERS = {

    // ── Theorem 1 ────────────────────────────────────────────────────────
    1: {
      base: function (p) {
        var pts = PP[1];
        drawCircleBase(p);
        drawPt(p, ptX(pts.A), ptY(pts.A), 'A', COL.pointA);
        drawPt(p, ptX(pts.B), ptY(pts.B), 'B', COL.pointB);
      },

      inscribed_angle: function (p) {
        var pts = PP[1];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        drawLine(p, C.x, C.y, A.x, A.y, COL.lineGreen, 2);
        drawLine(p, C.x, C.y, B.x, B.y, COL.lineGreen, 2);
        drawArc(p, C.x, C.y, A.x, A.y, B.x, B.y, 30, COL.angleGreen);
        drawPt(p, C.x, C.y, 'C', COL.pointA);
        var ang = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
        drawLabel(p, '\u2220ACB\u202f=\u202f' + fmt(ang), C.x, C.y - 30, COL.angleGreen, 13);
      },

      radii_oa_ob: function (p) {
        var pts = PP[1];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        drawLine(p, cx, cy, A.x, A.y, COL.lineRed, 2);
        drawLine(p, cx, cy, B.x, B.y, COL.lineRed, 2);
        // Central angle arc at O
        drawArc(p, cx, cy, A.x, A.y, B.x, B.y, 32, COL.angleRed);
        var central = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y) * 2;
        drawLabel(p, '\u2220AOB\u202f=\u202f' + fmt(central), cx + 35, cy + 35, COL.angleRed, 13);
      },

      radius_oc: function (p) {
        var pts = PP[1];
        var C = pt(pts.C);
        drawDashedLine(p, cx, cy, C.x, C.y, [251, 188, 4], 7);
        drawLabel(p, '\u03b1', cx - 12, cy + 18, COL.angleGreen, 14);
        drawLabel(p, '\u03b2', cx + 12, cy + 18, COL.angleGreen, 14);
      },

      iso_oac: function (p) {
        var pts = PP[1];
        var A = pt(pts.A), C = pt(pts.C);
        drawFilledTriangle(p, cx, cy, A.x, A.y, C.x, C.y, COL.shadeAlpha);
        var midAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
        drawLabel(p, '\u03b1', midAC.x - 18, midAC.y, COL.angleGreen, 14);
        drawLabel(p, '\u03b1', A.x + (cx - A.x) / 4 + 8, A.y + (cy - A.y) / 4, COL.angleGreen, 14);
      },

      iso_obc: function (p) {
        var pts = PP[1];
        var B = pt(pts.B), C = pt(pts.C);
        drawFilledTriangle(p, cx, cy, B.x, B.y, C.x, C.y, COL.shadeBeta);
        var midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
        drawLabel(p, '\u03b2', midBC.x + 18, midBC.y, COL.angleBlue, 14);
        drawLabel(p, '\u03b2', B.x + (cx - B.x) / 4 - 8, B.y + (cy - B.y) / 4, COL.angleBlue, 14);
      },

      conclusion: function (p) {
        var pts = PP[1];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        var inscribed = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
        var central   = inscribed * 2;
        p.push();
        p.noStroke();
        p.fill(52, 168, 83, 30);
        p.rect(6, p.height - 54, p.width - 12, 48, 6);
        p.pop();
        p.push();
        p.noStroke();
        p.fill.apply(p, COL.text);
        p.textSize(13);
        p.textAlign(p.LEFT, p.BASELINE);
        p.text('\u2220AOB\u202f=\u202f' + fmt(central) + '  =  2 \u00d7 ' + fmt(inscribed) + '\u202f=\u202f2 \u00d7 \u2220ACB  \u2713', 14, p.height - 16);
        p.pop();
      }
    },

    // ── Theorem 2 ────────────────────────────────────────────────────────
    2: {
      base: function (p) {
        var pts = PP[2];
        drawCircleBase(p);
        var A = pt(pts.A), B = pt(pts.B);
        drawLine(p, A.x, A.y, B.x, B.y, COL.lineMain, 2);
        drawPt(p, A.x, A.y, 'A', COL.pointA);
        drawPt(p, B.x, B.y, 'B', COL.pointB);
      },

      point_c: function (p) {
        var pts = PP[2];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        drawLine(p, C.x, C.y, A.x, A.y, COL.lineGreen, 2);
        drawLine(p, C.x, C.y, B.x, B.y, COL.lineGreen, 2);
        drawArc(p, C.x, C.y, A.x, A.y, B.x, B.y, 30, COL.angleGreen);
        drawPt(p, C.x, C.y, 'C', COL.pointA);
        var ang = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
        drawLabel(p, '\u2220ACB\u202f=\u202f' + fmt(ang), C.x - 14, C.y - 24, COL.angleGreen, 12);
      },

      central_angle: function (p) {
        var pts = PP[2];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        drawLine(p, cx, cy, A.x, A.y, COL.lineRed, 1.5);
        drawLine(p, cx, cy, B.x, B.y, COL.lineRed, 1.5);
        drawArc(p, cx, cy, A.x, A.y, B.x, B.y, 28, COL.angleRed);
        var central = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y) * 2;
        drawLabel(p, '\u2220AOB\u202f=\u202f' + fmt(central), cx + 30, cy + 30, COL.angleRed, 12);
      },

      point_d: function (p) {
        var pts = PP[2];
        var A = pt(pts.A), B = pt(pts.B), D = pt(pts.D);
        drawLine(p, D.x, D.y, A.x, A.y, COL.lineOrange, 2);
        drawLine(p, D.x, D.y, B.x, B.y, COL.lineOrange, 2);
        drawArc(p, D.x, D.y, A.x, A.y, B.x, B.y, 36, COL.tangent);
        drawPt(p, D.x, D.y, 'D', COL.tangent);
        var ang = inscribedAngle(A.x, A.y, B.x, B.y, D.x, D.y);
        drawLabel(p, '\u2220ADB\u202f=\u202f' + fmt(ang), D.x + 8, D.y - 24, [251, 188, 4], 12);
      },

      conclusion: function (p) {
        var pts = PP[2];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C), D = pt(pts.D);
        var angC = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
        var angD = inscribedAngle(A.x, A.y, B.x, B.y, D.x, D.y);
        p.push();
        p.noStroke();
        p.fill(52, 168, 83, 30);
        p.rect(6, p.height - 54, p.width - 12, 48, 6);
        p.pop();
        p.push();
        p.noStroke();
        p.fill.apply(p, COL.text);
        p.textSize(13);
        p.textAlign(p.LEFT, p.BASELINE);
        p.text('\u2220ACB\u202f=\u202f' + fmt(angC) + '  =  \u2220ADB\u202f=\u202f' + fmt(angD) + '  \u2713', 14, p.height - 16);
        p.pop();
      }
    },

    // ── Theorem 3 ────────────────────────────────────────────────────────
    3: {
      base: function (p) {
        drawCircleBase(p);
      },

      diameter: function (p) {
        var pts = PP[3];
        var A = pt(pts.A), B = pt(pts.B);
        drawLine(p, A.x, A.y, B.x, B.y, COL.lineMain, 2.5);
        drawLine(p, cx, cy, A.x, A.y, COL.lineRed, 1.5);
        drawLine(p, cx, cy, B.x, B.y, COL.lineRed, 1.5);
        drawPt(p, A.x, A.y, 'A', COL.pointA);
        drawPt(p, B.x, B.y, 'B', COL.pointB);
        drawLabel(p, '\u2220AOB\u202f=\u202f180\u00b0', cx, cy + 35, COL.angleRed, 13);
      },

      point_c: function (p) {
        var pts = PP[3];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        drawLine(p, C.x, C.y, A.x, A.y, COL.lineGreen, 2);
        drawLine(p, C.x, C.y, B.x, B.y, COL.lineGreen, 2);
        drawPt(p, C.x, C.y, 'C', COL.pointA);
      },

      theorem1: function (p) {
        var pts = PP[3];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        drawArc(p, C.x, C.y, A.x, A.y, B.x, B.y, 30, COL.angleGreen);
        var ang = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
        drawLabel(p, '\u2220ACB\u202f=\u202f\u00bd\u202f\u00d7\u202f180\u00b0\u202f=\u202f' + fmt(ang), C.x, C.y - 32, COL.angleGreen, 13);
      },

      conclusion: function (p) {
        var pts = PP[3];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C);
        // Right angle marker at C
        drawRightAngle(p, C.x, C.y, A.x - C.x, A.y - C.y, 12);
        p.push();
        p.noStroke();
        p.fill(52, 168, 83, 30);
        p.rect(6, p.height - 54, p.width - 12, 48, 6);
        p.pop();
        p.push();
        p.noStroke();
        p.fill.apply(p, COL.text);
        p.textSize(13);
        p.textAlign(p.LEFT, p.BASELINE);
        p.text('\u2220ACB\u202f=\u202f90\u00b0  (angle in a semicircle)  \u2713', 14, p.height - 16);
        p.pop();
      }
    },

    // ── Theorem 4 ────────────────────────────────────────────────────────
    4: {
      base: function (p) {
        var pts = PP[4];
        drawCircleBase(p);
        ['A', 'B', 'C', 'D'].forEach(function (lbl) {
          var c = lbl === 'B' ? COL.pointB : COL.pointA;
          drawPt(p, ptX(pts[lbl]), ptY(pts[lbl]), lbl, c);
        });
      },

      quad_sides: function (p) {
        var pts = PP[4];
        var order = ['A', 'B', 'C', 'D'];
        for (var i = 0; i < 4; i++) {
          var a = order[i], b = order[(i + 1) % 4];
          drawLine(p, ptX(pts[a]), ptY(pts[a]), ptX(pts[b]), ptY(pts[b]), COL.lineMain, 2);
        }
      },

      angle_a: function (p) {
        var pts = PP[4];
        var A = pt(pts.A), B = pt(pts.B), D = pt(pts.D);
        drawArc(p, A.x, A.y, D.x, D.y, B.x, B.y, 30, COL.angleRed);
        var ang = inscribedAngle(D.x, D.y, B.x, B.y, A.x, A.y);
        drawLabel(p, '\u2220DAB\u202f=\u202f' + fmt(ang), A.x - 30, A.y - 18, COL.angleRed, 12);
      },

      angle_c: function (p) {
        var pts = PP[4];
        var B = pt(pts.B), C = pt(pts.C), D = pt(pts.D);
        drawArc(p, C.x, C.y, B.x, B.y, D.x, D.y, 30, COL.angleGreen);
        var ang = inscribedAngle(B.x, B.y, D.x, D.y, C.x, C.y);
        drawLabel(p, '\u2220BCD\u202f=\u202f' + fmt(ang), C.x + 28, C.y + 14, COL.angleGreen, 12);
      },

      arcs_sum: function (p) {
        // Highlight the two arcs
        var pts = PP[4];
        var aA = pts.A, aB = pts.B, aC = pts.C, aD = pts.D;
        p.push();
        p.noFill();
        p.stroke.apply(p, COL.angleRed);
        p.strokeWeight(4);
        // Arc BCD (from B going clockwise through C to D, not passing A)
        var startAng = aB, endAng = aD;
        var span = ((endAng - startAng) + TWO_PI) % TWO_PI;
        var posA  = ((aA - startAng) + TWO_PI) % TWO_PI;
        if (posA < span) {
          p.arc(cx, cy, (RADIUS + 14) * 2, (RADIUS + 14) * 2, endAng, endAng + (TWO_PI - span));
        } else {
          p.arc(cx, cy, (RADIUS + 14) * 2, (RADIUS + 14) * 2, startAng, startAng + span);
        }
        p.stroke.apply(p, COL.angleGreen);
        // Arc DAB (the other arc)
        if (posA < span) {
          p.arc(cx, cy, (RADIUS + 14) * 2, (RADIUS + 14) * 2, startAng, startAng + span);
        } else {
          p.arc(cx, cy, (RADIUS + 14) * 2, (RADIUS + 14) * 2, endAng, endAng + (TWO_PI - span));
        }
        p.pop();
        drawLabel(p, 'arc BCD + arc DAB = 360\u00b0', cx, cy - RADIUS - 22, COL.textMuted, 12);
      },

      conclusion: function (p) {
        var pts = PP[4];
        var A = pt(pts.A), B = pt(pts.B), C = pt(pts.C), D = pt(pts.D);
        var angA = inscribedAngle(D.x, D.y, B.x, B.y, A.x, A.y);
        var angC = inscribedAngle(B.x, B.y, D.x, D.y, C.x, C.y);
        p.push();
        p.noStroke();
        p.fill(52, 168, 83, 30);
        p.rect(6, p.height - 54, p.width - 12, 48, 6);
        p.pop();
        p.push();
        p.noStroke();
        p.fill.apply(p, COL.text);
        p.textSize(13);
        p.textAlign(p.LEFT, p.BASELINE);
        p.text('\u2220DAB\u202f+\u202f\u2220BCD\u202f=\u202f' + fmt(angA) + '\u202f+\u202f' + fmt(angC) + '\u202f=\u202f' + fmt(angA + angC) + '\u202f=\u202f180\u00b0  \u2713', 14, p.height - 16);
        p.pop();
      }
    },

    // ── Theorem 5 ────────────────────────────────────────────────────────
    5: {
      base: function (p) {
        var pts = PP[5];
        drawCircleBase(p);
        drawPt(p, ptX(pts.P), ptY(pts.P), 'T', COL.pointA);
      },

      radius: function (p) {
        var pts = PP[5];
        drawLine(p, cx, cy, ptX(pts.P), ptY(pts.P), COL.lineRed, 2.5);
        drawLabel(p, 'r', (cx + ptX(pts.P)) / 2, cy - 16, COL.angleRed, 13);
      },

      tangent: function (p) {
        var pts = PP[5];
        var aP = pts.P;
        var tLen = RADIUS * 0.9;
        var tdx = -Math.sin(aP), tdy = Math.cos(aP);
        var Tx = ptX(aP), Ty = ptY(aP);
        p.push();
        p.stroke.apply(p, COL.tangent);
        p.strokeWeight(3);
        p.line(Tx - tdx * tLen, Ty - tdy * tLen, Tx + tdx * tLen, Ty + tdy * tLen);
        p.pop();
        drawLabel(p, 'tangent', Tx + tdx * (tLen - 20), Ty + tdy * (tLen - 20) - 14, COL.tangent, 12);
      },

      outside_points: function (p) {
        var pts = PP[5];
        var aP = pts.P;
        var tdx = -Math.sin(aP), tdy = Math.cos(aP);
        var Tx = ptX(aP), Ty = ptY(aP);
        var fLen = RADIUS * 0.55;
        var Fx = Tx + tdx * fLen, Fy = Ty + tdy * fLen;
        // Show point F on the tangent
        drawDashedLine(p, cx, cy, Fx, Fy, COL.textMuted, 6);
        drawPt(p, Fx, Fy, 'F', COL.computed);
        drawLabel(p, 'OF > r', (cx + Fx) / 2, (cy + Fy) / 2 - 14, COL.textMuted, 12);
      },

      conclusion: function (p) {
        var pts = PP[5];
        var aP = pts.P;
        drawRightAngle(p, ptX(aP), ptY(aP), -Math.cos(aP), -Math.sin(aP), 12);
        p.push();
        p.noStroke();
        p.fill(52, 168, 83, 30);
        p.rect(6, p.height - 54, p.width - 12, 48, 6);
        p.pop();
        p.push();
        p.noStroke();
        p.fill.apply(p, COL.text);
        p.textSize(13);
        p.textAlign(p.LEFT, p.BASELINE);
        p.text('OT \u22a5 tangent  \u21d2  \u2220OTT\u2032\u202f=\u202f90\u00b0  \u2713', 14, p.height - 16);
        p.pop();
      }
    },

    // ── Theorem 6 ────────────────────────────────────────────────────────
    6: {
      base: function (p) {
        var pts = PP[6];
        var aT = pts.T;
        var tLen = RADIUS * 0.85;
        var tdx = -Math.sin(aT), tdy = Math.cos(aT);
        var Tx = ptX(aT), Ty = ptY(aT);
        drawCircleBase(p);
        p.push();
        p.stroke.apply(p, COL.tangent);
        p.strokeWeight(3);
        p.line(Tx - tdx * tLen, Ty - tdy * tLen, Tx + tdx * tLen, Ty + tdy * tLen);
        p.pop();
        drawPt(p, Tx, Ty, 'T', COL.angleRed);
        drawLabel(p, 'tangent', Tx + tdx * (tLen - 16) + 4, Ty + tdy * (tLen - 16) - 12, COL.tangent, 12);
      },

      chord_ta: function (p) {
        var pts = PP[6];
        var aT = pts.T;
        var tdx = -Math.sin(aT), tdy = Math.cos(aT);
        var T = pt(aT), A = pt(pts.A);
        drawLine(p, T.x, T.y, A.x, A.y, COL.lineGreen, 2.5);
        drawPt(p, A.x, A.y, 'A', COL.pointA);
        // Tangent-chord angle arc at T
        var chordAngle = Math.atan2(A.y - T.y, A.x - T.x);
        var tanAngle   = Math.atan2(tdy, tdx);
        drawArc(p, T.x, T.y,
          T.x + Math.cos(tanAngle) * 32, T.y + Math.sin(tanAngle) * 32,
          A.x, A.y, 28, COL.angleRed);
        drawLabel(p, '\u03b1', T.x + Math.cos((tanAngle + chordAngle) / 2) * 38,
          T.y + Math.sin((tanAngle + chordAngle) / 2) * 38, COL.angleRed, 15);
      },

      radius_ot_oa: function (p) {
        var pts = PP[6];
        var T = pt(pts.T), A = pt(pts.A);
        drawLine(p, cx, cy, T.x, T.y, COL.lineRed, 1.5);
        drawLine(p, cx, cy, A.x, A.y, COL.lineRed, 1.5);
        // Right angle at T (OT ⊥ tangent)
        drawRightAngle(p, T.x, T.y, -Math.cos(pts.T), -Math.sin(pts.T), 11);
        drawLabel(p, '\u2220OTA', (T.x + A.x) / 2 + 14, (T.y + A.y) / 2 - 8, COL.angleRed, 12);
      },

      isosceles: function (p) {
        var pts = PP[6];
        var T = pt(pts.T), A = pt(pts.A);
        drawFilledTriangle(p, cx, cy, T.x, T.y, A.x, A.y, COL.shadeAlpha);
        var midOT = { x: (cx + T.x) / 2, y: (cy + T.y) / 2 };
        var midOA = { x: (cx + A.x) / 2, y: (cy + A.y) / 2 };
        drawLabel(p, 'r', midOT.x - 12, midOT.y, COL.angleRed, 12);
        drawLabel(p, 'r', midOA.x + 12, midOA.y, COL.angleRed, 12);
        drawLabel(p, '\u2220OTA\u202f=\u202f\u2220OAT', cx, cy + RADIUS + 24, COL.angleRed, 12);
      },

      inscribed_b: function (p) {
        var pts = PP[6];
        var T = pt(pts.T), A = pt(pts.A), B = pt(pts.B);
        drawLine(p, B.x, B.y, T.x, T.y, COL.lineBlue, 2);
        drawLine(p, B.x, B.y, A.x, A.y, COL.lineBlue, 2);
        drawArc(p, B.x, B.y, T.x, T.y, A.x, A.y, 30, COL.angleGreen);
        drawPt(p, B.x, B.y, 'B', COL.pointB);
        var ang = inscribedAngle(T.x, T.y, A.x, A.y, B.x, B.y);
        drawLabel(p, '\u2220TBA\u202f=\u202f' + fmt(ang), B.x, B.y - 30, COL.angleGreen, 12);
      },

      conclusion: function (p) {
        var pts = PP[6];
        var T = pt(pts.T), A = pt(pts.A), B = pt(pts.B);
        var angB = inscribedAngle(T.x, T.y, A.x, A.y, B.x, B.y);
        p.push();
        p.noStroke();
        p.fill(52, 168, 83, 30);
        p.rect(6, p.height - 54, p.width - 12, 48, 6);
        p.pop();
        p.push();
        p.noStroke();
        p.fill.apply(p, COL.text);
        p.textSize(13);
        p.textAlign(p.LEFT, p.BASELINE);
        p.text('\u03b1 (tangent\u2013chord)\u202f=\u202f\u2220TBA\u202f=\u202f' + fmt(angB) + '  \u2713', 14, p.height - 16);
        p.pop();
      }
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────

  function getSteps() {
    return getProofSteps(currentTheorem);
  }

  function updateStepText() {
    var steps   = getSteps();
    var el      = document.getElementById('proof-step-text');
    var stepNum = document.getElementById('proof-step-num');
    if (el)      { el.innerHTML = steps[currentStep] ? steps[currentStep].text : ''; }
    if (stepNum) { stepNum.textContent = (currentStep + 1) + '\u202f/\u202f' + steps.length; }
    var prevBtn = document.getElementById('prev-step-btn');
    var nextBtn = document.getElementById('next-step-btn');
    if (prevBtn) { prevBtn.disabled = currentStep === 0; }
    if (nextBtn) { nextBtn.disabled = currentStep >= steps.length - 1; }
  }

  function goToStep(n) {
    var steps = getSteps();
    currentStep = Math.max(0, Math.min(n, steps.length - 1));
    updateStepText();
  }

  function loadTheorem(id) {
    currentTheorem = id;
    currentStep    = 0;
    autoPlaying    = false;
    var btn = document.getElementById('autoplay-btn');
    if (btn) { btn.textContent = 'Auto-play'; btn.setAttribute('aria-pressed', 'false'); }
    updateStepText();
  }

  // ── p5 sketch ─────────────────────────────────────────────────────────────
  var sketch = function (p) {

    p.setup = function () {
      var canvas = p.createCanvas(CANVAS_W, CANVAS_H);
      canvas.parent('proof-canvas-container');
      cx = p.width  / 2;
      cy = p.height / 2;

      // Theorem selector
      var sel = document.getElementById('proof-theorem-select');
      if (sel) {
        sel.addEventListener('change', function () {
          loadTheorem(parseInt(this.value, 10));
        });
      }

      // Step buttons
      var prevBtn = document.getElementById('prev-step-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          stopAutoPlay();
          goToStep(currentStep - 1);
        });
      }
      var nextBtn = document.getElementById('next-step-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          stopAutoPlay();
          goToStep(currentStep + 1);
        });
      }

      // Auto-play toggle
      var autoBtn = document.getElementById('autoplay-btn');
      if (autoBtn) {
        autoBtn.addEventListener('click', function () {
          autoPlaying = !autoPlaying;
          autoBtn.textContent = autoPlaying ? 'Stop' : 'Auto-play';
          autoBtn.setAttribute('aria-pressed', String(autoPlaying));
          if (autoPlaying) {
            // Restart from step 0 if already on the last step
            var steps = getSteps();
            if (currentStep >= steps.length - 1) { goToStep(0); }
            lastAutoTime = p.millis();
          }
        });
      }

      // Reset / keyboard
      var resetBtn = document.getElementById('proof-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          stopAutoPlay();
          goToStep(0);
        });
      }

      updateStepText();
    };

    p.draw = function () {
      p.background(COL.bg[0], COL.bg[1], COL.bg[2]);
      p.textFont('Arial');

      var layerMap  = LAYERS[currentTheorem];
      var steps     = getSteps();

      for (var i = 0; i <= currentStep && i < steps.length; i++) {
        var fn = layerMap[steps[i].key];
        if (fn) { fn(p); }
      }

      // Auto-play advance
      if (autoPlaying) {
        var now = p.millis();
        if (now - lastAutoTime >= AUTO_STEP_MS) {
          lastAutoTime = now;
          var nextStep = currentStep + 1;
          if (nextStep >= steps.length) {
            stopAutoPlay();
          } else {
            goToStep(nextStep);
          }
        }
      }
    };

    p.keyPressed = function () {
      if (p.key === 'ArrowRight') { stopAutoPlay(); goToStep(currentStep + 1); }
      if (p.key === 'ArrowLeft')  { stopAutoPlay(); goToStep(currentStep - 1); }
    };
  };

  function stopAutoPlay() {
    autoPlaying = false;
    var btn = document.getElementById('autoplay-btn');
    if (btn) { btn.textContent = 'Auto-play'; btn.setAttribute('aria-pressed', 'false'); }
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  if (typeof p5 !== 'undefined') {
    /* eslint-disable no-new */
    new p5(sketch);
    /* eslint-enable no-new */
  }
}());
