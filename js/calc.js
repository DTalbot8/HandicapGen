// js/calc.js
import { clubs } from './ui.js';

function calculateCourseHandicap(handicap, clubKey, teeKey, holeKey) {
    const data = clubs[clubKey][teeKey][holeKey];
    const raw = handicap * (data.slope / 113) + (data.cr - data.par);
    return holeKey !== '18' ? raw / 2 : raw;
}

export function calculate() {
    const clubKey = document.getElementById('club').value;
    const holeKey = document.getElementById('holes').value;
    const format = document.getElementById('format').value;
    const isSingles = format === 'matchplay';

    const handicaps = [
        parseFloat(document.getElementById('p1').value),
        parseFloat(document.getElementById('p2').value),
        isSingles ? null : parseFloat(document.getElementById('p3').value),
        isSingles ? null : parseFloat(document.getElementById('p4').value)
    ];
    const tees = ['tee1', 'tee2', 'tee3', 'tee4'].map(id => document.getElementById(id).value);
    const activeCount = isSingles ? 2 : 4;

    // basic validation
    if (handicaps.slice(0, activeCount).some(h => isNaN(h))) {
        alert('Please fill all handicaps.');
        return;
    }

    document.getElementById('input-section').classList.add('hidden');

    // compute course handicaps
    const courseHcp = handicaps.map((h, i) =>
        h !== null ? Math.round(calculateCourseHandicap(h, clubKey, tees[i], holeKey)) : null
    );

    let html = '<table>';
    html += '<tr><th>Metric</th>' +
        courseHcp.filter(x => x !== null).map((_, i) => `<th>Player ${i + 1}</th>`).join('') +
        '</tr>';
    html += '<tr><td>Course Handicap</td>' +
        courseHcp.map(x => x !== null ? `<td>${x}</td>` : '').join('') +
        '</tr>';

    if (format === 'fourball') {
        const playHcp = courseHcp.map(x => x !== null ? Math.round(x * 0.9) : null);
        const minH = Math.min(...playHcp.filter(x => x !== null));
        const strokes = playHcp.map(x => x !== null ? x - minH : null);
        html += '<tr><td>Playing Handicap (90%)</td>' +
            playHcp.map(x => x !== null ? `<td>${x}</td>` : '').join('') +
            '</tr>';
        html += '<tr><td>Strokes Received</td>' +
            strokes.map(x => x !== null ? `<td>${x}</td>` : '').join('') +
            '</tr>';
    }
    else if (format === 'foursomes' || format === 'greensomes') {
        const factorA = format === 'greensomes' ? 0.6 : 0.5;
        const factorB = format === 'greensomes' ? 0.4 : 0.5;
        const teamA = Math.round(courseHcp[0] * factorA + courseHcp[1] * factorB);
        const teamB = Math.round(courseHcp[2] * factorA + courseHcp[3] * factorB);
        const low = Math.min(teamA, teamB);
        html += `<tr><td>Team A</td><td colspan="${activeCount - 1}">${teamA}</td></tr>`;
        html += `<tr><td>Team B</td><td colspan="${activeCount - 1}">${teamB}</td></tr>`;
        html += `<tr><td>Strokes Received</td><td colspan="${activeCount - 1}">A ${teamA - low}, B ${teamB - low}</td></tr>`;
    }
    else { // matchplay
        const min2 = Math.min(courseHcp[0], courseHcp[1]);
        const strokes2 = [courseHcp[0] - min2, courseHcp[1] - min2];
        html += '<tr><td>Playing Handicap (100%)</td>' +
            [courseHcp[0], courseHcp[1]].map(x => `<td>${x}</td>`).join('') +
            '</tr>';
        html += '<tr><td>Strokes Received</td>' +
            strokes2.map(x => `<td>${x}</td>`).join('') +
            '</tr>';
    }

    html += '</table>';
    html += `<button onclick="
     document.getElementById('input-section').classList.remove('hidden');
     document.getElementById('result').classList.add('hidden');
     document.getElementById('result').innerHTML='';
  ">Edit Inputs</button>`;

    const resultEl = document.getElementById('result');
    resultEl.innerHTML = html;
    resultEl.classList.remove('hidden');
}

// expose calculate to global scope
window.calculate = calculate;
