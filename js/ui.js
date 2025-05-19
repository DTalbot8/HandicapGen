// js/ui.js

// Course data for each club/tee/holes
export const clubs = {
    farnham: {
        silver: { name: 'Silver', '18': { slope: 136, cr: 72.5, par: 72 }, F9: { slope: 131, cr: 35.3, par: 35 }, B9: { slope: 140, cr: 37.2, par: 37 } },
        purple: { name: 'Purple', '18': { slope: 130, cr: 70.8, par: 72 }, F9: { slope: 128, cr: 34.8, par: 35 }, B9: { slope: 132, cr: 36, par: 37 } }
    },
    hindhead: {
        navy: { name: 'Navy', '18': { slope: 125, cr: 71.3, par: 70 }, F9: { slope: 126, cr: 35.6, par: 35 }, B9: { slope: 125, cr: 35.6, par: 35 } },
        silver: { name: 'Silver', '18': { slope: 121, cr: 69.9, par: 70 }, F9: { slope: 119, cr: 34.7, par: 35 }, B9: { slope: 123, cr: 35.2, par: 35 } },
    }

};

export function populateTees() {
    const clubKey = document.getElementById('club').value;
    const options = Object.entries(clubs[clubKey])
        .map(([key, data]) => `<option value="${key}">${data.name}</option>`)
        .join('');
    ['tee1', 'tee2', 'tee3', 'tee4'].forEach(id =>
        document.getElementById(id).innerHTML = options
    );
}

export function togglePlayers() {
    const show = document.getElementById('format').value !== 'matchplay';
    ['player3', 'player4'].forEach(id =>
        document.getElementById(id).style.display = show ? 'flex' : 'none'
    );
}



window.populateTees = populateTees;
window.togglePlayers = togglePlayers;

window.addEventListener('DOMContentLoaded', () => {
    populateTees();
    togglePlayers();


    document.getElementById('club')
        .addEventListener('change', populateTees);

    document.getElementById('format')
        .addEventListener('change', togglePlayers);
});

