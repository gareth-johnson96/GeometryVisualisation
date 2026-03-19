'use strict';

/**
 * Proof step definitions for all 6 circle theorems.
 *
 * Each step has:
 *   - key:  string identifier used by the p5 sketch to select which draw layer to add
 *   - text: the explanatory text shown to the student for that step
 *
 * The steps are cumulative: at step index i the sketch draws all layers 0 … i.
 *
 * @type {Object.<number, Array.<{key: string, text: string}>>}
 */
var PROOF_STEPS = {

  // ── Theorem 1: Angle at Centre = 2 × Angle at Circumference ─────────────
  1: [
    {
      key: 'base',
      text: 'Start with a circle centred at O. Place two points A and B on the circumference.'
    },
    {
      key: 'inscribed_angle',
      text: 'Add a third point C on the circumference. Lines CA and CB form the inscribed angle \u2220ACB.'
    },
    {
      key: 'radii_oa_ob',
      text: 'Draw radii OA and OB. The angle \u2220AOB at the centre subtends the same arc AB as \u2220ACB.'
    },
    {
      key: 'radius_oc',
      text: 'Draw the auxiliary radius OC. This splits \u2220ACB into two parts: \u03b1\u202f=\u202f\u2220OCA and \u03b2\u202f=\u202f\u2220OCB.'
    },
    {
      key: 'iso_oac',
      text: 'OA\u202f=\u202fOC (both radii), so \u25b3OAC is isosceles \u21d2 \u2220OAC\u202f=\u202f\u2220OCA\u202f=\u202f\u03b1. The exterior angle of \u25b3OAC at O is 2\u03b1.'
    },
    {
      key: 'iso_obc',
      text: 'OB\u202f=\u202fOC (both radii), so \u25b3OBC is isosceles \u21d2 \u2220OBC\u202f=\u202f\u2220OCB\u202f=\u202f\u03b2. The exterior angle of \u25b3OBC at O is 2\u03b2.'
    },
    {
      key: 'conclusion',
      text: 'Therefore \u2220AOB\u202f=\u202f2\u03b1\u202f+\u202f2\u03b2\u202f=\u202f2(\u03b1\u202f+\u202f\u03b2)\u202f=\u202f2\u202f\u00d7\u202f\u2220ACB. \u2713 The angle at the centre is always twice the inscribed angle subtending the same arc.'
    }
  ],

  // ── Theorem 2: Angles in the Same Segment are Equal ─────────────────────
  2: [
    {
      key: 'base',
      text: 'Draw a circle with chord AB dividing it into two segments.'
    },
    {
      key: 'point_c',
      text: 'Place point C on the major arc. Lines CA and CB form inscribed angle \u2220ACB.'
    },
    {
      key: 'central_angle',
      text: 'By Theorem 1, \u2220ACB\u202f=\u202f\u00bd\u202f\u00d7\u202f\u2220AOB (the central angle for the arc AB not containing C).'
    },
    {
      key: 'point_d',
      text: 'Place another point D on the same arc as C. Lines DA and DB form inscribed angle \u2220ADB.'
    },
    {
      key: 'conclusion',
      text: '\u2220ADB also equals \u00bd\u202f\u00d7\u202f\u2220AOB (same central angle). Therefore \u2220ACB\u202f=\u202f\u2220ADB. \u2713 All angles in the same segment subtending the same chord are equal.'
    }
  ],

  // ── Theorem 3: Angle in a Semicircle = 90° ───────────────────────────────
  3: [
    {
      key: 'base',
      text: 'Draw a circle with centre O.'
    },
    {
      key: 'diameter',
      text: 'Draw a diameter AB through the centre O. The central angle \u2220AOB\u202f=\u202f180\u00b0 (a straight line).'
    },
    {
      key: 'point_c',
      text: 'Place point C anywhere on the circumference (not on the diameter). Draw lines CA and CB.'
    },
    {
      key: 'theorem1',
      text: 'By Theorem 1, \u2220ACB\u202f=\u202f\u00bd\u202f\u00d7\u202f\u2220AOB.'
    },
    {
      key: 'conclusion',
      text: '\u2220ACB\u202f=\u202f\u00bd\u202f\u00d7\u202f180\u00b0\u202f=\u202f90\u00b0. \u2713 An angle inscribed in a semicircle is always a right angle.'
    }
  ],

  // ── Theorem 4: Opposite Angles in a Cyclic Quadrilateral Sum to 180° ────
  4: [
    {
      key: 'base',
      text: 'Draw a circle with four points A, B, C, D on the circumference, forming cyclic quadrilateral ABCD.'
    },
    {
      key: 'quad_sides',
      text: 'Draw the sides AB, BC, CD, DA of the quadrilateral.'
    },
    {
      key: 'angle_a',
      text: 'Angle \u2220DAB (at vertex A) is an inscribed angle subtending arc BCD \u2014 the arc from B to D not containing A.'
    },
    {
      key: 'angle_c',
      text: 'Angle \u2220BCD (at vertex C) is an inscribed angle subtending arc DAB \u2014 the arc not containing C.'
    },
    {
      key: 'arcs_sum',
      text: 'Arc BCD + arc DAB\u202f=\u202f360\u00b0 (they together make the full circle).'
    },
    {
      key: 'conclusion',
      text: '\u2220DAB\u202f=\u202f\u00bd\u202f\u00d7\u202farc\u202fBCD and \u2220BCD\u202f=\u202f\u00bd\u202f\u00d7\u202farc\u202fDAB. So \u2220DAB\u202f+\u202f\u2220BCD\u202f=\u202f\u00bd\u202f\u00d7\u202f360\u00b0\u202f=\u202f180\u00b0. \u2713 Opposite angles in any cyclic quadrilateral are supplementary.'
    }
  ],

  // ── Theorem 5: Tangent–Radius Angle = 90° ───────────────────────────────
  5: [
    {
      key: 'base',
      text: 'Draw a circle with centre O and a point T on the circumference.'
    },
    {
      key: 'radius',
      text: 'Draw radius OT. OT has length r (the radius of the circle).'
    },
    {
      key: 'tangent',
      text: 'Draw the tangent line at T. A tangent touches the circle at exactly one point \u2014 every other point on the tangent is outside the circle.'
    },
    {
      key: 'outside_points',
      text: 'Choose any other point F on the tangent. OF > OT = r because F is outside the circle. So OT is the shortest distance from O to the tangent.'
    },
    {
      key: 'conclusion',
      text: 'The shortest distance from a point to a line is always perpendicular to the line. Therefore OT \u22a5 tangent at T, i.e. \u2220OTT\u2032\u202f=\u202f90\u00b0. \u2713'
    }
  ],

  // ── Theorem 6: Alternate Segment Theorem ────────────────────────────────
  6: [
    {
      key: 'base',
      text: 'Draw a circle with point T on the circumference. Draw a tangent at T.'
    },
    {
      key: 'chord_ta',
      text: 'Draw chord TA to a second point A on the circumference. The tangent\u2013chord angle \u03b1 is formed between the tangent and chord TA.'
    },
    {
      key: 'radius_ot_oa',
      text: 'Draw radii OT and OA. By Theorem 5, OT \u22a5 tangent, so \u03b1\u202f=\u202f90\u00b0\u202f\u2212\u202f\u2220OTA.'
    },
    {
      key: 'isosceles',
      text: 'OT\u202f=\u202fOA (both radii), so \u25b3OTA is isosceles \u21d2 \u2220OTA\u202f=\u202f\u2220OAT.'
    },
    {
      key: 'inscribed_b',
      text: 'Place B in the alternate segment (the other side of chord TA). The inscribed angle \u2220TBA subtends arc TA. By Theorem 1, \u2220TBA\u202f=\u202f\u00bd\u202f\u00d7\u202f\u2220TOA.'
    },
    {
      key: 'conclusion',
      text: '\u03b1\u202f=\u202f90\u00b0\u202f\u2212\u202f\u2220OTA\u202f=\u202f90\u00b0\u202f\u2212\u202f\u2220OAT\u202f=\u202f\u2220TBA. \u2713 The tangent\u2013chord angle equals the inscribed angle in the alternate segment.'
    }
  ]

};

/**
 * Returns the array of proof steps for the given theorem ID.
 * @param {number} theoremId - integer 1 through 6
 * @returns {Array.<{key: string, text: string}>}
 */
function getProofSteps(theoremId) {
  return PROOF_STEPS[theoremId] || [];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getProofSteps, PROOF_STEPS };
}
