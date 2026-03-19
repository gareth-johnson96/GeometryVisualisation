/* global p5, inscribedAngle, centralAngleForArc */
'use strict';

/**
 * Circle Theorems – Interactive p5.js sketch (instance mode).
 *
 * Theorem 1 – Angle at Centre         (points A, B, C)
 * Theorem 2 – Angles in Same Segment  (points A, B, C, D)
 * Theorem 3 – Angle in a Semicircle   (draggable: A, C; computed: B = A + π)
 * Theorem 4 – Cyclic Quadrilateral    (points A, B, C, D)
 * Theorem 5 – Tangent–Radius          (point P)
 * Theorem 6 – Alternate Segment       (points T, A, B)
 */

(function () {
  // ── Constants ─────────────────────────────────────────────────────────────
  var CANVAS_SIZE = 480;
  var RADIUS = 165;
  var POINT_R = 9;
  var HIT_RADIUS = 22;
  var ARC_R = 30;
  var ARC_R2 = 44;
  var TWO_PI = 2 * Math.PI;

  var COL = {
    bg: [248, 249, 250],
    circle: [26, 115, 232],
    centre: [234, 67, 53],
    pointA: [52, 168, 83],
    pointB: [26, 115, 232],
    lineMain: [95, 99, 104],
    lineGreen: [52, 168, 83],
    lineBlue: [26, 115, 232],
    tangent: [251, 188, 4],
    angleRed: [234, 67, 53],
    angleGreen: [52, 168, 83],
    text: [32, 33, 36],
    textMuted: [95, 99, 104],
    computed: [158, 161, 167],
  };

  // ── Theorem default point angles (radians from +x axis) ───────────────────
  var DEFAULTS = {
    1: [-0.8, 0.8, Math.PI],
    2: [-0.6, 0.6, Math.PI * 0.75, Math.PI * 1.3],
    3: [0, Math.PI * 0.7],
    4: [-Math.PI / 6, Math.PI * 0.45, Math.PI * 0.95, Math.PI * 1.55],
    5: [0],
    6: [0, Math.PI * 0.65, Math.PI * 1.38],
  };

  // ── State ─────────────────────────────────────────────────────────────────
  var currentTheorem = 1;
  var pointAngles = [];
  var draggingIdx = -1;
  var cx, cy;

  // ── Geometry helpers ──────────────────────────────────────────────────────
  function ptX(a) { return cx + RADIUS * Math.cos(a); }
  function ptY(a) { return cy + RADIUS * Math.sin(a); }
  function pt(a)  { return { x: ptX(a), y: ptY(a) }; }
  function fmt(deg) { return Math.round(Math.abs(deg)) + '\u00b0'; }

  function resetPoints() {
    pointAngles = DEFAULTS[currentTheorem].slice();
    draggingIdx = -1;
  }

  function findClosestPoint(mx, my) {
    var best = -1;
    var bestDist = HIT_RADIUS;
    for (var i = 0; i < pointAngles.length; i++) {
      var dx = mx - ptX(pointAngles[i]);
      var dy = my - ptY(pointAngles[i]);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // ── Drawing primitives ────────────────────────────────────────────────────

  /**
   * Draw the smaller angle arc at vertex (vx, vy) between directions to A and B.
   * p5.js arc draws clockwise from start to stop.
   */
  function drawAngleArc(p, vx, vy, ax, ay, bx, by, arcR, colour) {
    var a1 = Math.atan2(ay - vy, ax - vx);
    var a2 = Math.atan2(by - vy, bx - vx);
    var diff = ((a2 - a1) + TWO_PI) % TWO_PI; // clockwise span from a1 to a2
    p.push();
    p.noFill();
    p.stroke(colour[0], colour[1], colour[2]);
    p.strokeWeight(2);
    if (diff <= Math.PI) {
      p.arc(vx, vy, arcR * 2, arcR * 2, a1, a1 + diff);
    } else {
      p.arc(vx, vy, arcR * 2, arcR * 2, a2, a2 + (TWO_PI - diff));
    }
    p.pop();
  }

  /**
   * Draw the central angle arc at the circle centre for the arc NOT containing P.
   */
  function drawCentralArc(p, ax, ay, bx, by, px, py, arcR, colour) {
    var a1 = Math.atan2(ay - cy, ax - cx);
    var a2 = Math.atan2(by - cy, bx - cx);
    var aC = Math.atan2(py - cy, px - cx);
    var arcAB = ((a2 - a1) + TWO_PI) % TWO_PI;
    var posC  = ((aC - a1) + TWO_PI) % TWO_PI;
    // Arc NOT containing C
    p.push();
    p.noFill();
    p.stroke(colour[0], colour[1], colour[2]);
    p.strokeWeight(2);
    if (posC < arcAB) {
      // C is on the clockwise arc A→B; arc not containing C starts at B, clockwise to A
      var oppositeArcSpan = TWO_PI - arcAB;
      p.arc(cx, cy, arcR * 2, arcR * 2, a2, a2 + oppositeArcSpan);
    } else {
      // C is on the other arc; arc not containing C is clockwise A→B
      p.arc(cx, cy, arcR * 2, arcR * 2, a1, a1 + arcAB);
    }
    p.pop();
  }

  /** Draw a right-angle square marker at (vx, vy) oriented along direction (dx, dy). */
  function drawRightAngleMarker(p, vx, vy, dx, dy, size) {
    size = size || 13;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-9) return;
    var ux = (dx / len) * size;
    var uy = (dy / len) * size;
    var px2 = -uy, py2 = ux; // perpendicular
    p.push();
    p.noFill();
    p.stroke(COL.angleRed[0], COL.angleRed[1], COL.angleRed[2]);
    p.strokeWeight(1.5);
    p.beginShape();
    p.vertex(vx + ux, vy + uy);
    p.vertex(vx + ux + px2, vy + uy + py2);
    p.vertex(vx + px2, vy + py2);
    p.endShape();
    p.pop();
  }

  /** Draw a draggable point with an offset label. */
  function drawPoint(p, x, y, label, colour) {
    colour = colour || COL.pointA;
    p.push();
    p.fill(colour[0], colour[1], colour[2]);
    p.noStroke();
    p.ellipse(x, y, POINT_R * 2, POINT_R * 2);
    // White border ring
    p.noFill();
    p.stroke(255, 255, 255);
    p.strokeWeight(2);
    p.ellipse(x, y, POINT_R * 2 + 3, POINT_R * 2 + 3);
    // Label offset away from centre
    var dx = x - cx, dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var lx = x + (dx / dist) * 22;
    var ly = y + (dy / dist) * 22;
    p.noStroke();
    p.fill(COL.text[0], COL.text[1], COL.text[2]);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(label, lx, ly);
    p.pop();
  }

  /** Draw "O" marker at the circle centre. */
  function drawCentre(p) {
    p.push();
    p.fill(COL.centre[0], COL.centre[1], COL.centre[2]);
    p.noStroke();
    p.ellipse(cx, cy, 8, 8);
    p.fill(COL.text[0], COL.text[1], COL.text[2]);
    p.textSize(13);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('O', cx + 12, cy - 10);
    p.pop();
  }

  /** Draw the main circle. */
  function drawCircle(p) {
    p.push();
    p.noFill();
    p.stroke(COL.circle[0], COL.circle[1], COL.circle[2]);
    p.strokeWeight(2);
    p.ellipse(cx, cy, RADIUS * 2, RADIUS * 2);
    p.pop();
    drawCentre(p);
  }

  /** Draw a line between two points using a given colour array and weight. */
  function drawLine(p, x1, y1, x2, y2, colour, weight) {
    p.push();
    p.stroke(colour[0], colour[1], colour[2]);
    p.strokeWeight(weight || 1.5);
    p.line(x1, y1, x2, y2);
    p.pop();
  }

  /** Draw angle labels in the bottom-left corner. */
  function drawLabels(p, lines) {
    var yBase = p.height - 10;
    p.push();
    p.textSize(13);
    p.textAlign(p.LEFT, p.BASELINE);
    p.noStroke();
    for (var i = lines.length - 1; i >= 0; i--) {
      var line = lines[i];
      p.fill(line.colour[0], line.colour[1], line.colour[2]);
      p.text(line.text, 10, yBase);
      yBase -= 20;
    }
    p.pop();
  }

  // ── Theorem drawers ───────────────────────────────────────────────────────

  function drawTheorem1(p) {
    var aA = pointAngles[0], aB = pointAngles[1], aC = pointAngles[2];
    var A = pt(aA), B = pt(aB), C = pt(aC);

    // Radii OA, OB
    drawLine(p, cx, cy, A.x, A.y, COL.lineMain);
    drawLine(p, cx, cy, B.x, B.y, COL.lineMain);
    // Chord lines CA, CB
    drawLine(p, C.x, C.y, A.x, A.y, COL.lineGreen);
    drawLine(p, C.x, C.y, B.x, B.y, COL.lineGreen);

    // Central angle arc (arc NOT containing C, drawn at centre)
    drawCentralArc(p, A.x, A.y, B.x, B.y, C.x, C.y, ARC_R, COL.angleRed);
    // Inscribed angle arc at C
    drawAngleArc(p, C.x, C.y, A.x, A.y, B.x, B.y, ARC_R, COL.angleGreen);

    drawPoint(p, A.x, A.y, 'A');
    drawPoint(p, B.x, B.y, 'B');
    drawPoint(p, C.x, C.y, 'C');

    var inscribed = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
    var central = centralAngleForArc(cx, cy, A.x, A.y, B.x, B.y, C.x, C.y);
    drawLabels(p, [
      { text: '\u2220AOB = ' + fmt(central) + '  =  2 \u00d7 \u2220ACB', colour: COL.textMuted },
      { text: '\u2220ACB = ' + fmt(inscribed), colour: COL.angleGreen },
      { text: '\u2220AOB = ' + fmt(central), colour: COL.angleRed },
    ]);
  }

  function drawTheorem2(p) {
    var aA = pointAngles[0], aB = pointAngles[1];
    var aC = pointAngles[2], aD = pointAngles[3];
    var A = pt(aA), B = pt(aB), C = pt(aC), D = pt(aD);

    // Chord AB
    drawLine(p, A.x, A.y, B.x, B.y, COL.lineMain);
    // Lines from C
    drawLine(p, C.x, C.y, A.x, A.y, COL.lineGreen);
    drawLine(p, C.x, C.y, B.x, B.y, COL.lineGreen);
    // Lines from D
    drawLine(p, D.x, D.y, A.x, A.y, COL.angleRed);
    drawLine(p, D.x, D.y, B.x, B.y, COL.angleRed);

    drawAngleArc(p, C.x, C.y, A.x, A.y, B.x, B.y, ARC_R, COL.angleGreen);
    drawAngleArc(p, D.x, D.y, A.x, A.y, B.x, B.y, ARC_R2, COL.angleRed);

    drawPoint(p, A.x, A.y, 'A');
    drawPoint(p, B.x, B.y, 'B');
    drawPoint(p, C.x, C.y, 'C', COL.pointA);
    drawPoint(p, D.x, D.y, 'D', COL.angleRed);

    var angleC = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
    var angleD = inscribedAngle(A.x, A.y, B.x, B.y, D.x, D.y);
    drawLabels(p, [
      { text: '\u2220ACB = \u2220ADB  (same segment)', colour: COL.textMuted },
      { text: '\u2220ADB = ' + fmt(angleD), colour: COL.angleRed },
      { text: '\u2220ACB = ' + fmt(angleC), colour: COL.angleGreen },
    ]);
  }

  function drawTheorem3(p) {
    var aA = pointAngles[0];
    var aB = aA + Math.PI; // B always diametrically opposite A
    var aC = pointAngles[1];
    var A = pt(aA), B = pt(aB), C = pt(aC);

    // Diameter
    drawLine(p, A.x, A.y, B.x, B.y, COL.lineMain, 2);
    // Lines CA, CB
    drawLine(p, C.x, C.y, A.x, A.y, COL.lineGreen);
    drawLine(p, C.x, C.y, B.x, B.y, COL.lineGreen);

    // Right-angle marker at C
    drawRightAngleMarker(p, C.x, C.y, A.x - C.x, A.y - C.y, 13);

    drawPoint(p, A.x, A.y, 'A');
    // B is computed, draw it in a muted colour to signal it is not draggable
    drawPoint(p, B.x, B.y, 'B', COL.computed);
    drawPoint(p, C.x, C.y, 'C');

    var angle = inscribedAngle(A.x, A.y, B.x, B.y, C.x, C.y);
    drawLabels(p, [
      { text: 'AB is a diameter  \u21d2  \u2220ACB = 90\u00b0', colour: COL.textMuted },
      { text: '\u2220ACB = ' + fmt(angle), colour: COL.angleRed },
    ]);
  }

  function drawTheorem4(p) {
    var pts = pointAngles.map(pt);
    var A = pts[0], B = pts[1], C = pts[2], D = pts[3];

    // Quadrilateral sides
    drawLine(p, A.x, A.y, B.x, B.y, COL.lineMain);
    drawLine(p, B.x, B.y, C.x, C.y, COL.lineMain);
    drawLine(p, C.x, C.y, D.x, D.y, COL.lineMain);
    drawLine(p, D.x, D.y, A.x, A.y, COL.lineMain);

    // Interior angle arcs: for vertex A, the interior angle is ∠DAB
    drawAngleArc(p, A.x, A.y, D.x, D.y, B.x, B.y, ARC_R, COL.angleRed);
    drawAngleArc(p, C.x, C.y, B.x, B.y, D.x, D.y, ARC_R, COL.angleRed);
    drawAngleArc(p, B.x, B.y, A.x, A.y, C.x, C.y, ARC_R, COL.angleGreen);
    drawAngleArc(p, D.x, D.y, C.x, C.y, A.x, A.y, ARC_R, COL.angleGreen);

    ['A', 'B', 'C', 'D'].forEach(function (lbl, i) { drawPoint(p, pts[i].x, pts[i].y, lbl); });

    var angleA = inscribedAngle(D.x, D.y, B.x, B.y, A.x, A.y);
    var angleB = inscribedAngle(A.x, A.y, C.x, C.y, B.x, B.y);
    var angleC = inscribedAngle(B.x, B.y, D.x, D.y, C.x, C.y);
    var angleD = inscribedAngle(C.x, C.y, A.x, A.y, D.x, D.y);
    drawLabels(p, [
      { text: 'Opposite angles sum to 180\u00b0', colour: COL.textMuted },
      { text: '\u2220B + \u2220D = ' + fmt(angleB + angleD), colour: COL.angleGreen },
      { text: '\u2220A + \u2220C = ' + fmt(angleA + angleC), colour: COL.angleRed },
    ]);
  }

  function drawTheorem5(p) {
    var aP = pointAngles[0];
    var P = pt(aP);
    var tangentLen = RADIUS * 0.85;
    // Radius direction unit vector
    var rdx = Math.cos(aP), rdy = Math.sin(aP);
    // Tangent direction (perpendicular to radius, counterclockwise)
    var tdx = -rdy, tdy = rdx;

    // Radius OP
    drawLine(p, cx, cy, P.x, P.y, COL.lineMain, 2);
    // Tangent line through P
    p.push();
    p.stroke(COL.tangent[0], COL.tangent[1], COL.tangent[2]);
    p.strokeWeight(2.5);
    p.line(
      P.x - tdx * tangentLen, P.y - tdy * tangentLen,
      P.x + tdx * tangentLen, P.y + tdy * tangentLen
    );
    p.pop();

    // Right-angle marker at P between inward radius (-rdx, -rdy) and tangent
    drawRightAngleMarker(p, P.x, P.y, -rdx, -rdy, 13);

    // Label 'T' on the tangent line
    p.push();
    p.fill(COL.tangent[0], COL.tangent[1], COL.tangent[2]);
    p.textSize(13);
    p.textAlign(p.LEFT, p.BASELINE);
    p.noStroke();
    p.text('tangent', P.x + tdx * (tangentLen - 12) + 5, P.y + tdy * (tangentLen - 12) - 5);
    p.pop();

    drawPoint(p, P.x, P.y, 'P');

    drawLabels(p, [
      { text: 'Tangent \u22a5 radius at point of contact', colour: COL.textMuted },
      { text: '\u2220OPT = 90\u00b0', colour: COL.angleRed },
    ]);
  }

  function drawTheorem6(p) {
    var aT = pointAngles[0], aA = pointAngles[1], aB = pointAngles[2];
    var T = pt(aT), A = pt(aA), B = pt(aB);
    var tangentLen = RADIUS * 0.85;
    // Tangent direction at T (perpendicular to radius OT, counterclockwise)
    var tdx = -Math.sin(aT), tdy = Math.cos(aT);

    // Tangent line at T
    p.push();
    p.stroke(COL.tangent[0], COL.tangent[1], COL.tangent[2]);
    p.strokeWeight(2.5);
    p.line(
      T.x - tdx * tangentLen, T.y - tdy * tangentLen,
      T.x + tdx * tangentLen, T.y + tdy * tangentLen
    );
    p.pop();

    // Chord TA
    drawLine(p, T.x, T.y, A.x, A.y, COL.lineGreen, 2);
    // Triangle sides BT and BA (inscribed angle in alternate segment)
    drawLine(p, B.x, B.y, T.x, T.y, COL.lineMain);
    drawLine(p, B.x, B.y, A.x, A.y, COL.lineMain);

    // Tangent–chord angle at T (between tangent direction and chord TA)
    var chordDx = A.x - T.x, chordDy = A.y - T.y;
    var chordMag = Math.sqrt(chordDx * chordDx + chordDy * chordDy);
    var tanChordAngle = 0;
    if (chordMag > 1e-9) {
      var dotTC = (chordDx * tdx + chordDy * tdy) / chordMag;
      var rawAngle = Math.acos(Math.max(-1, Math.min(1, dotTC))) * (180 / Math.PI);
      tanChordAngle = rawAngle > 90 ? 180 - rawAngle : rawAngle;
    }

    // Inscribed angle ∠TBA in the alternate segment
    var inscribed = inscribedAngle(T.x, T.y, A.x, A.y, B.x, B.y);

    // Angle arc at T between tangent and chord TA
    var chordAngle = Math.atan2(A.y - T.y, A.x - T.x);
    var tanAngle = Math.atan2(tdy, tdx);
    // Draw the smaller of the two arcs between tangent and chord
    drawAngleArc(p, T.x, T.y,
      T.x + Math.cos(tanAngle) * 30, T.y + Math.sin(tanAngle) * 30,
      A.x, A.y,
      ARC_R, COL.angleRed);

    // Inscribed angle arc at B
    drawAngleArc(p, B.x, B.y, T.x, T.y, A.x, A.y, ARC_R, COL.angleGreen);

    drawPoint(p, T.x, T.y, 'T', COL.angleRed);
    drawPoint(p, A.x, A.y, 'A');
    drawPoint(p, B.x, B.y, 'B');

    drawLabels(p, [
      { text: 'Tangent\u2013chord angle = inscribed angle in alternate segment', colour: COL.textMuted },
      { text: '\u2220TBA = ' + fmt(inscribed), colour: COL.angleGreen },
      { text: 'tangent\u2013chord = ' + fmt(tanChordAngle), colour: COL.angleRed },
    ]);
  }

  // ── Main draw dispatcher ──────────────────────────────────────────────────
  function drawCurrentTheorem(p) {
    switch (currentTheorem) {
      case 1: drawTheorem1(p); break;
      case 2: drawTheorem2(p); break;
      case 3: drawTheorem3(p); break;
      case 4: drawTheorem4(p); break;
      case 5: drawTheorem5(p); break;
      case 6: drawTheorem6(p); break;
    }
  }

  // ── Cursor hint ───────────────────────────────────────────────────────────
  function updateCursor(p) {
    var idx = findClosestPoint(p.mouseX, p.mouseY);
    p.cursor(idx >= 0 ? p.HAND : p.ARROW);
  }

  // ── p5 sketch ─────────────────────────────────────────────────────────────
  var sketch = function (p) {
    p.setup = function () {
      var canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
      canvas.parent('canvas-container');
      cx = p.width / 2;
      cy = p.height / 2;
      resetPoints();

      // Wire up HTML controls
      var sel = document.getElementById('theorem-select');
      if (sel) {
        sel.addEventListener('change', function () {
          currentTheorem = parseInt(this.value, 10);
          resetPoints();
          updateDescription();
        });
      }
      var btn = document.getElementById('reset-btn');
      if (btn) {
        btn.addEventListener('click', function () { resetPoints(); });
      }
      updateDescription();
    };

    p.draw = function () {
      p.background(COL.bg[0], COL.bg[1], COL.bg[2]);
      p.textFont('Arial');
      drawCircle(p);
      drawCurrentTheorem(p);
      updateCursor(p);
    };

    // ── Mouse interaction ─────────────────────────────────────────────────
    p.mousePressed = function () {
      draggingIdx = findClosestPoint(p.mouseX, p.mouseY);
    };

    p.mouseDragged = function () {
      if (draggingIdx >= 0) {
        pointAngles[draggingIdx] = Math.atan2(p.mouseY - cy, p.mouseX - cx);
      }
    };

    p.mouseReleased = function () { draggingIdx = -1; };

    // ── Touch interaction ─────────────────────────────────────────────────
    p.touchStarted = function () {
      if (p.touches.length > 0) {
        draggingIdx = findClosestPoint(p.touches[0].x, p.touches[0].y);
      }
      return false;
    };

    p.touchMoved = function () {
      if (draggingIdx >= 0 && p.touches.length > 0) {
        pointAngles[draggingIdx] = Math.atan2(
          p.touches[0].y - cy, p.touches[0].x - cx
        );
      }
      return false;
    };

    p.touchEnded = function () { draggingIdx = -1; return false; };
  };

  // ── Theorem descriptions ──────────────────────────────────────────────────
  var DESCRIPTIONS = {
    1: 'The <strong>angle at the centre</strong> (\u2220AOB) is twice the angle at the circumference (\u2220ACB) subtending the same arc. Drag A, B or C to explore.',
    2: '<strong>Angles in the same segment</strong> are equal: \u2220ACB\u202f=\u202f\u2220ADB when C and D are on the same arc as each other. Drag any point.',
    3: 'The angle inscribed in a <strong>semicircle</strong> is always 90°. AB is a diameter; drag C around the circle and watch \u2220ACB stay at 90°.',
    4: 'In a <strong>cyclic quadrilateral</strong>, opposite angles sum to 180°. Drag A, B, C or D and verify \u2220A\u202f+\u202f\u2220C\u202f=\u202f180° and \u2220B\u202f+\u202f\u2220D\u202f=\u202f180°.',
    5: 'The <strong>tangent to a circle is perpendicular to the radius</strong> at the point of contact. Drag P around the circle to see the right angle is always preserved.',
    6: 'The <strong>alternate segment theorem</strong>: the angle between a tangent and a chord equals the inscribed angle subtending the same chord in the alternate segment. Drag T, A or B.',
  };

  function updateDescription() {
    var el = document.getElementById('theorem-description');
    if (el) { el.innerHTML = DESCRIPTIONS[currentTheorem] || ''; }
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  if (typeof p5 !== 'undefined') {
    /* eslint-disable no-new */
    new p5(sketch);
    /* eslint-enable no-new */
  }
}());
