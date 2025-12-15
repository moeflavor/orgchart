// Configuration
const CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/18kYODhewBvEQWVHSASmt7x9rQJ7lRzO_l_Ce0TBG10k/export?format=csv&gid=0',
};

// Global state
let orgData = [];
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const errorMessage = document.getElementById('errorMessage');
const orgChart = document.getElementById('orgChart');
const refreshBtn = document.getElementById('refreshBtn');
const expandAllBtn = document.getElementById('expandAllBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');
const retryBtn = document.getElementById('retryBtn');
const employeeModal = document.getElementById('employeeModal');
const modalClose = document.getElementById('modalClose');

// Event Listeners
refreshBtn.addEventListener('click', () => loadData());
expandAllBtn.addEventListener('click', () => showAllDepartmentsModal());
collapseAllBtn.addEventListener('click', () => closeModal());
zoomInBtn.addEventListener('click', () => zoom(0.1));
zoomOutBtn.addEventListener('click', () => zoom(-0.1));
resetZoomBtn.addEventListener('click', () => resetView());
retryBtn.addEventListener('click', () => {
    hideError();
    loadData();
});

// Modal controls
modalClose.addEventListener('click', () => closeModal());
employeeModal.addEventListener('click', (e) => {
    if (e.target === employeeModal) closeModal();
});

// Zoom and Pan functionality
function zoom(delta) {
    zoomLevel = Math.max(0.5, Math.min(2, zoomLevel + delta));
    applyTransform();
}

function resetView() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    applyTransform();
}

function applyTransform() {
    orgChart.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

// Mouse wheel zoom
orgChart.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    zoom(delta);
});

// Pan functionality
orgChart.addEventListener('mousedown', (e) => {
    if (e.target.closest('.node') || e.target.closest('.expand-btn')) return;
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    orgChart.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
});

document.addEventListener('mouseup', () => {
    isPanning = false;
    orgChart.style.cursor = 'grab';
});

// Touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

orgChart.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX - panX;
        touchStartY = e.touches[0].clientY - panY;
    }
});

orgChart.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        e.preventDefault();
        panX = e.touches[0].clientX - touchStartX;
        panY = e.touches[0].clientY - touchStartY;
        applyTransform();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    orgChart.style.cursor = 'grab';
});

// Load data from Google Sheets
async function loadData() {
    showLoading();

    try {
        if (!CONFIG.SHEET_URL || CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEET_CSV_URL') {
            throw new Error('Please configure your Google Sheets URL in script.js');
        }

        const response = await fetch(CONFIG.SHEET_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        orgData = parseCSV(csvText);

        if (orgData.length === 0) {
            throw new Error('No data found in the spreadsheet');
        }

        buildOrgChart();
        hideLoading();

    } catch (error) {
        console.error('Error loading data:', error);
        showError(error.message);
    }
}

// Parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] ? values[index].trim() : '';
            });
            data.push(entry);
        }
    }

    return data;
}

// Parse CSV line (handles quoted values)
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

// Fix Imgur URLs - convert album links to direct image links
function fixImgurUrl(url) {
    if (!url || !url.includes('imgur.com')) return url;

    // If it's an album link like https://imgur.com/a/yAU0LAM
    if (url.includes('/a/')) {
        const albumId = url.split('/a/')[1].split(/[/?#]/)[0];
        // We can't get the direct image from album without API
        // User needs to open the album and get the direct image link
        console.warn('Album link detected. Please use direct image link instead:', url);
        return url;
    }

    // If it's like https://imgur.com/abc123, convert to https://i.imgur.com/abc123.png
    if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
        const imageId = url.split('imgur.com/')[1].split(/[/?#]/)[0];
        return `https://i.imgur.com/${imageId}.png`;
    }

    return url;
}

// Build organizational chart with new hierarchy: CEO → OBM → Departments
function buildOrgChart() {
    orgChart.innerHTML = '';

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    // Find CEO (Catherine)
    const ceo = orgData.find(p => p.Name === 'Catherine' || p.Title.toLowerCase().includes('ceo'));

    // Find OBM (Pauline)
    const obm = orgData.find(p => p.Name === 'Pauline' || p.Title.toLowerCase().includes('obm') || p.Title.toLowerCase().includes('coo'));

    // Get all departments
    const departments = [...new Set(orgData
        .map(p => p.Department)
        .filter(d => d && d.trim()))];

    // Render CEO
    if (ceo) {
        chartContainer.appendChild(renderPerson(ceo, 'ceo'));
    }

    // Connection line
    const ceoLine = document.createElement('div');
    ceoLine.className = 'connection-line';
    ceoLine.style.height = '40px';
    chartContainer.appendChild(ceoLine);

    // Render OBM
    if (obm) {
        chartContainer.appendChild(renderPerson(obm, 'obm'));
    }

    // Connection line
    const obmLine = document.createElement('div');
    obmLine.className = 'connection-line';
    obmLine.style.height = '40px';
    chartContainer.appendChild(obmLine);

    // Render Departments Grid
    const deptGrid = document.createElement('div');
    deptGrid.className = 'departments-grid';

    departments.forEach(dept => {
        const deptNode = renderDepartmentCard(dept);
        deptGrid.appendChild(deptNode);
    });

    chartContainer.appendChild(deptGrid);
    orgChart.appendChild(chartContainer);
}

// Render a person card
function renderPerson(person, roleClass = 'team-member') {
    const node = document.createElement('div');
    node.className = `node ${roleClass}`;
    node.onclick = () => showEmployeeModal(person);

    const nameEl = document.createElement('div');
    nameEl.className = 'node-name';
    nameEl.textContent = person.Name;
    node.appendChild(nameEl);

    if (person.Title) {
        const titleEl = document.createElement('div');
        titleEl.className = 'node-title';
        titleEl.textContent = person.Title;
        node.appendChild(titleEl);
    }

    return node;
}

// Render a department card (just the card, click opens modal)
function renderDepartmentCard(departmentName) {
    const deptNode = document.createElement('div');
    deptNode.className = 'node department';
    deptNode.onclick = () => showDepartmentModal(departmentName);

    const deptNameEl = document.createElement('div');
    deptNameEl.className = 'node-name';
    deptNameEl.textContent = departmentName;
    deptNode.appendChild(deptNameEl);

    // Count team members
    const deptPeople = orgData.filter(p => p.Department === departmentName);

    if (deptPeople.length > 0) {
        const countEl = document.createElement('div');
        countEl.className = 'node-title';
        countEl.textContent = `${deptPeople.length} ${deptPeople.length === 1 ? 'Person' : 'People'}`;
        deptNode.appendChild(countEl);
    }

    return deptNode;
}

// Show department modal with all team members
function showDepartmentModal(departmentName) {
    const deptPeople = orgData.filter(p => p.Department === departmentName);

    if (deptPeople.length === 0) {
        return;
    }

    // Build modal content for department
    const modalContent = `
        <button class="modal-close" onclick="closeModal()">×</button>
        <div class="modal-header">
            <div class="modal-info" style="width: 100%;">
                <h2 class="modal-name">${departmentName} Department</h2>
                <div class="modal-title">${deptPeople.length} Team ${deptPeople.length === 1 ? 'Member' : 'Members'}</div>
            </div>
        </div>
        <div class="modal-details">
            <div class="department-team-grid">
                ${deptPeople.map(person => `
                    <div class="team-member-card" onclick="event.stopPropagation(); showEmployeeModal(${JSON.stringify(person).replace(/"/g, '&quot;')})">
                        <div class="team-member-name">${person.Name}</div>
                        <div class="team-member-title">${person.Title || ''}</div>
                        ${person.Manager ? `<div class="team-member-reports">Reports to: ${person.Manager}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const modalElement = document.querySelector('.modal-content');
    modalElement.innerHTML = modalContent;
    employeeModal.classList.add('active');
}

// Show all departments in one modal
function showAllDepartmentsModal() {
    const departments = [...new Set(orgData
        .map(p => p.Department)
        .filter(d => d && d.trim()))];

    let departmentsHtml = '';
    departments.forEach(dept => {
        const deptPeople = orgData.filter(p => p.Department === dept);
        departmentsHtml += `
            <div class="department-section">
                <h3 class="department-section-title">${dept} (${deptPeople.length})</h3>
                <div class="department-team-grid">
                    ${deptPeople.map(person => `
                        <div class="team-member-card" onclick="event.stopPropagation(); closeModal(); setTimeout(() => showEmployeeModal(${JSON.stringify(person).replace(/"/g, '&quot;')}), 100)">
                            <div class="team-member-name">${person.Name}</div>
                            <div class="team-member-title">${person.Title || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    const modalContent = `
        <button class="modal-close" onclick="closeModal()">×</button>
        <div class="modal-header">
            <div class="modal-info" style="width: 100%;">
                <h2 class="modal-name">All Departments</h2>
            </div>
        </div>
        <div class="modal-details" style="max-height: 70vh; overflow-y: auto;">
            ${departmentsHtml}
        </div>
    `;

    const modalElement = document.querySelector('.modal-content');
    modalElement.innerHTML = modalContent;
    employeeModal.classList.add('active');
}

// Show employee modal with details
function showEmployeeModal(person) {
    // If person is a string, parse it (from onclick JSON)
    if (typeof person === 'string') {
        person = JSON.parse(person);
    }

    // Handle image - fix Imgur URLs
    let imageUrl = person.ImageURL || person.Image || person.Photo || '';
    imageUrl = fixImgurUrl(imageUrl);

    const imageHtml = imageUrl && imageUrl.trim() ?
        `<img id="modalImage" class="modal-image" src="${imageUrl}" alt="${person.Name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="modal-image placeholder" style="display: none;">${person.Name.charAt(0)}</div>` :
        `<div class="modal-image placeholder">${person.Name.charAt(0)}</div>`;

    // Handle details/fun facts
    const details = person.Details || person.FunFacts || person.Bio || '';
    const detailsHtml = details && details.trim() ?
        `<div class="modal-details">
            <h3>Fun Facts</h3>
            <p>${details}</p>
        </div>` : '';

    const modalContent = `
        <button class="modal-close" onclick="closeModal()">×</button>
        <div class="modal-header">
            ${imageHtml}
            <div class="modal-info">
                <h2 class="modal-name">${person.Name}</h2>
                <div class="modal-title">${person.Title}</div>
                <div class="modal-department">${person.Department || 'Executive'}</div>
                ${person.Manager ? `<div class="modal-department" style="margin-top: 8px;">Reports to: ${person.Manager}</div>` : ''}
            </div>
        </div>
        ${detailsHtml}
    `;

    const modalElement = document.querySelector('.modal-content');
    modalElement.innerHTML = modalContent;
    employeeModal.classList.add('active');
}

// Close modal
function closeModal() {
    employeeModal.classList.remove('active');
}

// Make closeModal global for onclick handlers
window.closeModal = closeModal;
window.showEmployeeModal = showEmployeeModal;

// UI Helper Functions
function showLoading() {
    loadingScreen.classList.remove('hidden');
    errorScreen.classList.add('hidden');
    orgChart.innerHTML = '';
}

function hideLoading() {
    loadingScreen.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    errorScreen.classList.remove('hidden');
}

function hideError() {
    errorScreen.classList.add('hidden');
}

// Demo data fallback
function loadDemoData() {
    orgData = [
        { Name: 'Catherine', Title: 'CEO', Department: '', Manager: '', Details: 'Founder and visionary leader of Moeflavor. Loves strategy and growth.', ImageURL: '' },
        { Name: 'Pauline', Title: 'OBM', Department: '', Manager: 'Catherine', Details: 'Operations mastermind. Keeps everything running smoothly.', ImageURL: '' },

        { Name: 'Janine', Title: 'Admin Head', Department: 'Admin', Manager: 'Pauline', Details: '', ImageURL: '' },
        { Name: 'Angela', Title: 'Operations Manager', Department: 'Admin', Manager: 'Janine', Details: '', ImageURL: '' },
        { Name: 'Con', Title: 'Office Manager', Department: 'Admin', Manager: 'Janine', Details: '', ImageURL: '' },

        { Name: 'Jeanne', Title: 'Marketing Head', Department: 'Marketing', Manager: 'Pauline', Details: '', ImageURL: '' },
        { Name: 'Marielet', Title: 'Marketing Manager', Department: 'Marketing', Manager: 'Jeanne', Details: '', ImageURL: '' },
        { Name: 'Kez', Title: 'Social Media Lead', Department: 'Marketing', Manager: 'Marielet', Details: '', ImageURL: '' },
        { Name: 'Edgar', Title: 'Content Creator', Department: 'Marketing', Manager: 'Marielet', Details: '', ImageURL: '' },
        { Name: 'Franz', Title: 'Designer', Department: 'Marketing', Manager: 'Marielet', Details: '', ImageURL: '' },
        { Name: 'Kei', Title: 'Ads Specialist', Department: 'Marketing', Manager: 'Marielet', Details: '', ImageURL: '' },

        { Name: 'Gjay', Title: 'Ads Team Lead', Department: 'Marketing', Manager: 'Pauline', Details: '', ImageURL: '' },
        { Name: 'Olivet', Title: 'Ads Manager', Department: 'Marketing', Manager: 'Gjay', Details: '', ImageURL: '' },

        { Name: 'Sharry', Title: 'Production Head', Department: 'Production', Manager: 'Pauline', Details: '', ImageURL: '' },
        { Name: 'Micah', Title: 'Production Manager', Department: 'Production', Manager: 'Sharry', Details: '', ImageURL: '' },

        { Name: 'Ryan', Title: 'US Warehouse Manager', Department: 'Warehouse', Manager: 'Pauline', Details: '', ImageURL: '' },
        { Name: 'Michael', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan', Details: '', ImageURL: '' },
        { Name: 'Dean', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan', Details: '', ImageURL: '' },
        { Name: 'Claude', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan', Details: '', ImageURL: '' },

        { Name: 'Robert', Title: 'China Warehouse Manager', Department: 'Warehouse', Manager: 'Pauline', Details: '', ImageURL: '' },
        { Name: 'Mary', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Robert', Details: '', ImageURL: '' }
    ];

    buildOrgChart();
    hideLoading();
}

// Use demo data if Google Sheets URL is not configured
if (!CONFIG.SHEET_URL || CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEET_CSV_URL') {
    console.log('Using demo data. Configure Google Sheets URL to use real data.');
    setTimeout(loadDemoData, 1500);
}
