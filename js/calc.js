// js/calc.js
import { clubs } from './ui.js';

// Stroke index arrays for each course (holes 1–18)
const strokeIndices = {
    farnham: [10, 4, 12, 18, 2, 8, 16, 14, 6,
        9, 1, 7, 17, 5, 15, 13, 3, 11],
    hindhead: [11, 17, 7, 13, 1, 15, 5, 9, 3,
        12, 4, 8, 18, 2, 16, 14, 10, 6]
};

/**
 * Calculate a player's course handicap for the selected holes.
 */
function calculateCourseHandicap(handicap, clubKey, teeKey, holeKey) {
    const data = clubs[clubKey][teeKey][holeKey];
    const raw = handicap * (data.slope / 113) + (data.cr - data.par);
    // half for 9-hole rounds
    return holeKey !== '18' ? raw / 2 : raw;
}

/**
 * Main entrypoint for the Calculate button.
 */
export function calculate() {
    const clubKey = document.getElementById('club').value;
    const holeKey = document.getElementById('holes').value;
    const format = document.getElementById('format').value;
    const isSingles = format === 'matchplay';

    // Parse player indices
    const handicaps = [
        parseFloat(document.getElementById('p1').value),
        parseFloat(document.getElementById('p2').value),
        isSingles ? null : parseFloat(document.getElementById('p3').value),
        isSingles ? null : parseFloat(document.getElementById('p4').value)
    ];
    const tees = ['tee1', 'tee2', 'tee3', 'tee4'].map(id =>
        document.getElementById(id).value
    );
    const activeCount = isSingles ? 2 : 4;

    // Validate
    if (handicaps.slice(0, activeCount).some(h => isNaN(h))) {
        alert('Please fill all handicaps.');
        return;
    }

    // Hide input section
    document.getElementById('input-section').classList.add('hidden');

    // Compute each player's course handicap (rounded)
    const courseHcp = handicaps.map((h, i) =>
        h !== null ? Math.round(calculateCourseHandicap(h, clubKey, tees[i], holeKey)) : null
    );

    // Determine strokes received per player (based on format)
    let strokesReceived;
    if (format === 'fourball') {
        const playHcp = courseHcp.map(x => x !== null ? Math.round(x * 0.9) : null);
        const minH = Math.min(...playHcp.filter(x => x !== null));
        strokesReceived = playHcp.map(x => x !== null ? x - minH : 0);
    } else if (format === 'matchplay') {
        const min2 = Math.min(courseHcp[0], courseHcp[1]);
        strokesReceived = [
            courseHcp[0] - min2,
            courseHcp[1] - min2,
            0,
            0
        ];
    } else { // foursomes or greensomes
        const factorA = format === 'greensomes' ? 0.6 : 0.5;
        const factorB = format === 'greensomes' ? 0.4 : 0.5;
        const teamA = Math.round(courseHcp[0] * factorA + courseHcp[1] * factorB);
        const teamB = Math.round(courseHcp[2] * factorA + courseHcp[3] * factorB);
        const low = Math.min(teamA, teamB);
        strokesReceived = [teamA - low, teamB - low, 0, 0];
    }

    // Select correct stroke-index list and slice for 9-hole if needed
    let si = strokeIndices[clubKey];
    if (holeKey === 'F9') si = si.slice(0, 9);
    else if (holeKey === 'B9') si = si.slice(9, 18);
    const holeCount = si.length;

    // Build the main results table
    let html = '<table>';
    html += '<tr><th>Metric</th>' +
        courseHcp.filter(x => x !== null)
            .map((_, i) => `<th>Player ${i + 1}</th>`)
            .join('') +
        '</tr>';
    html += '<tr><td>Course Handicap</td>' +
        courseHcp.map(x => x !== null ? `<td>${x}</td>` : '')
            .join('') +
        '</tr>';

    if (format === 'fourball') {
        const playHcp = courseHcp.map(x => x !== null ? Math.round(x * 0.9) : null);
        const minH = Math.min(...playHcp.filter(x => x !== null));
        const strokes = playHcp.map(x => x !== null ? x - minH : 0);
        html += '<tr><td>Playing Handicap (90%)</td>' +
            playHcp.map(x => x !== null ? `<td>${x}</td>` : '')
                .join('') +
            '</tr>';
        html += '<tr><td>Strokes Received</td>' +
            strokes.map(x => `<td>${x}</td>`)
                .join('') +
            '</tr>';
    } else if (format === 'matchplay') {
        html += '<tr><td>Playing Handicap (100%)</td>' +
            [courseHcp[0], courseHcp[1]].map(x => `<td>${x}</td>`).join('') +
            '</tr>';
        html += '<tr><td>Strokes Received</td>' +
            strokesReceived.slice(0, 2).map(x => `<td>${x}</td>`).join('') +
            '</tr>';
    } else { // foursomes or greensomes
        const teamA = strokesReceived[0] + Math.min(courseHcp[0], courseHcp[1]);
        const teamB = strokesReceived[1] + Math.min(courseHcp[2], courseHcp[3]);
        html += `<tr><td>Team A</td><td colspan="3">${teamA}</td></tr>`;
        html += `<tr><td>Team B</td><td colspan="3">${teamB}</td></tr>`;
        html += `<tr><td>Strokes Received</td><td colspan="3">A ${strokesReceived[0]}, B ${strokesReceived[1]}</td></tr>`;
    }

    html += '</table>';

    // Build the strokes-per-hole table for selected holes
    let shotTable = '<h3>Strokes per Hole</h3>';
    shotTable += '<table class="shots-per-hole"><tr><th>Hole</th>' +
        courseHcp.filter(x => x !== null).map((_, i) => `<th>Player ${i + 1}</th>`).join('') +
        '</tr>';

    let baseSets, extraSets;
    if (holeCount < 18) {
        // Determine holes order by ascending stroke-index
        const order = si.map((idx, i) => ({ idx, i }))
            .sort((a, b) => a.idx - b.idx)
            .map(e => e.i);
        // Base single strokes on lowest SI holes
        baseSets = strokesReceived.map(sr => new Set(order.slice(0, Math.min(sr, holeCount))));
        // Extra strokes (sr over holeCount) on lowest SI holes
        extraSets = strokesReceived.map(sr => new Set(order.slice(0, Math.max(0, sr - holeCount))));
    }

    si.forEach((idx, h0) => {
        shotTable += `<tr><td>${h0 + 1}</td>`;
        strokesReceived.forEach((sr, pi) => {
            let strokes = 0;
            if (holeCount < 18) {
                if (baseSets[pi].has(h0)) strokes++;
                if (extraSets[pi].has(h0)) strokes++;
            } else {
                if (sr >= idx) strokes++;
                if (sr > holeCount && (sr - holeCount) >= idx) strokes++;
            }
            const cls = strokes > 0 ? ' class="has-stroke"' : '';
            shotTable += `<td${cls}>${strokes}</td>`;
        });
        shotTable += '</tr>';
    });
    shotTable += '</table>';

    const editBtn = '<button onclick="document.getElementById(\'input-section\').classList.remove(\'hidden\'); document.getElementById(\'result\').classList.add(\'hidden\'); document.getElementById(\'result\').innerHTML=\'\';">Edit Inputs</button>';


    // Append both tables and show
    const resultEl = document.getElementById('result');
    resultEl.innerHTML = html + shotTable + editBtn;
    resultEl.classList.remove('hidden');
}

// Expose for the Calculate button
window.calculate = calculate;
