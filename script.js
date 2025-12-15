// Configuration
const CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/18kYODhewBvEQWVHSASmt7x9rQJ7lRzO_l_Ce0TBG10k/export?format=csv&gid=0',
};

// Global state
let orgData = [];
let expandedDepartments = new Set();
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
expandAllBtn.addEventListener('click', () => toggleAllDepartments(true));
collapseAllBtn.addEventListener('click', () => toggleAllDepartments(false));
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
        const deptNode = renderDepartment(dept);
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

// Render a department with its team
function renderDepartment(departmentName) {
    const container = document.createElement('div');
    container.className = 'node-container';

    // Department header
    const deptNode = document.createElement('div');
    deptNode.className = 'node department';

    const deptNameEl = document.createElement('div');
    deptNameEl.className = 'node-name';
    deptNameEl.textContent = departmentName;
    deptNode.appendChild(deptNameEl);

    // Get all people in this department
    const deptPeople = orgData.filter(p => p.Department === departmentName);

    if (deptPeople.length > 0) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = expandedDepartments.has(departmentName) ? 'Collapse' : 'Expand';
        expandBtn.onclick = (e) => {
            e.stopPropagation();
            toggleDepartment(departmentName);
        };
        deptNode.appendChild(expandBtn);
    }

    container.appendChild(deptNode);

    // Render team members
    if (deptPeople.length > 0) {
        const teamContainer = document.createElement('div');
        teamContainer.className = 'children-container';
        teamContainer.id = `dept-${departmentName}`;

        if (!expandedDepartments.has(departmentName)) {
            teamContainer.classList.add('collapsed');
        }

        // Organize by hierarchy within department
        const heads = deptPeople.filter(p =>
            p.Title.toLowerCase().includes('head') ||
            p.Title.toLowerCase().includes('manager') && !p.Manager
        );

        const others = deptPeople.filter(p => !heads.includes(p));

        heads.forEach(head => {
            const headContainer = document.createElement('div');
            headContainer.className = 'node-container';
            headContainer.appendChild(renderPerson(head, 'department-head'));

            // Find people reporting to this head
            const reports = others.filter(p => p.Manager === head.Name);

            if (reports.length > 0) {
                const reportsContainer = document.createElement('div');
                reportsContainer.className = 'children-container';

                reports.forEach(report => {
                    reportsContainer.appendChild(renderPerson(report, 'team-member'));
                });

                headContainer.appendChild(reportsContainer);
            }

            teamContainer.appendChild(headContainer);
        });

        // Add people without a manager in this dept
        others.filter(p => !p.Manager || !deptPeople.find(h => h.Name === p.Manager))
            .forEach(person => {
                teamContainer.appendChild(renderPerson(person, 'team-member'));
            });

        container.appendChild(teamContainer);
    }

    return container;
}

// Toggle department expand/collapse
function toggleDepartment(deptName) {
    if (expandedDepartments.has(deptName)) {
        expandedDepartments.delete(deptName);
    } else {
        expandedDepartments.add(deptName);
    }
    buildOrgChart();
}

// Toggle all departments
function toggleAllDepartments(expand) {
    if (expand) {
        const departments = [...new Set(orgData
            .map(p => p.Department)
            .filter(d => d && d.trim()))];
        departments.forEach(d => expandedDepartments.add(d));
    } else {
        expandedDepartments.clear();
    }
    buildOrgChart();
}

// Show employee modal with details
function showEmployeeModal(person) {
    document.getElementById('modalName').textContent = person.Name;
    document.getElementById('modalTitle').textContent = person.Title;
    document.getElementById('modalDepartment').textContent = person.Department || 'Executive';

    // Handle image
    const modalImage = document.getElementById('modalImage');
    const imageUrl = person.ImageURL || person.Image || person.Photo;

    if (imageUrl && imageUrl.trim()) {
        modalImage.src = imageUrl;
        modalImage.alt = person.Name;
        modalImage.classList.remove('placeholder');
    } else {
        modalImage.src = '';
        modalImage.alt = '';
        modalImage.classList.add('placeholder');
        modalImage.textContent = person.Name.charAt(0);
    }

    // Handle details/fun facts
    const details = person.Details || person.FunFacts || person.Bio;
    const detailsSection = document.getElementById('modalDetailsSection');

    if (details && details.trim()) {
        document.getElementById('modalDetails').textContent = details;
        detailsSection.style.display = 'block';
    } else {
        detailsSection.style.display = 'none';
    }

    employeeModal.classList.add('active');
}

// Close modal
function closeModal() {
    employeeModal.classList.remove('active');
}

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
        { Name: 'Catherine', Title: 'CEO', Department: '', Manager: '', Details: 'Founder and visionary leader of Moeflavor. Loves strategy and growth.' },
        { Name: 'Pauline', Title: 'OBM', Department: '', Manager: 'Catherine', Details: 'Operations mastermind. Keeps everything running smoothly.' },

        { Name: 'Janine', Title: 'Admin Head', Department: 'Admin', Manager: 'Pauline', Details: '' },
        { Name: 'Angela', Title: 'Operations Manager', Department: 'Admin', Manager: 'Janine', Details: '' },
        { Name: 'Con', Title: 'Office Manager', Department: 'Admin', Manager: 'Janine', Details: '' },

        { Name: 'Jeanne', Title: 'Marketing Head', Department: 'Marketing', Manager: 'Pauline', Details: '' },
        { Name: 'Kriselle', Title: 'Marketing Manager', Department: 'Marketing', Manager: 'Jeanne', Details: '' },
        { Name: 'Kez', Title: 'Social Media Lead', Department: 'Marketing', Manager: 'Kriselle', Details: '' },
        { Name: 'Edgar', Title: 'Content Creator', Department: 'Marketing', Manager: 'Kriselle', Details: '' },
        { Name: 'Franz', Title: 'Designer', Department: 'Marketing', Manager: 'Kriselle', Details: '' },
        { Name: 'Kei', Title: 'Ads Specialist', Department: 'Marketing', Manager: 'Kriselle', Details: '' },

        { Name: 'Gjay', Title: 'Ads Team Lead', Department: 'Marketing', Manager: 'Pauline', Details: '' },
        { Name: 'Olivet', Title: 'Ads Manager', Department: 'Marketing', Manager: 'Gjay', Details: '' },

        { Name: 'Sharry', Title: 'Production Head', Department: 'Production', Manager: 'Pauline', Details: '' },
        { Name: 'Micah', Title: 'Production Manager', Department: 'Production', Manager: 'Sharry', Details: '' },

        { Name: 'Ryan', Title: 'US Warehouse Manager', Department: 'Warehouse', Manager: 'Pauline', Details: '' },
        { Name: 'Michael', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan', Details: '' },
        { Name: 'Dean', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan', Details: '' },
        { Name: 'Claude', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan', Details: '' },

        { Name: 'Robert', Title: 'China Warehouse Manager', Department: 'Warehouse', Manager: 'Pauline', Details: '' },
        { Name: 'Mary', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Robert', Details: '' }
    ];

    buildOrgChart();
    hideLoading();
}

// Use demo data if Google Sheets URL is not configured
if (!CONFIG.SHEET_URL || CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEET_CSV_URL') {
    console.log('Using demo data. Configure Google Sheets URL to use real data.');
    setTimeout(loadDemoData, 1500);
}
