// Configuration
const CONFIG = {
    // Replace this with your Google Sheets CSV export URL
    // Format: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=SHEET_GID
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/18kYODhewBvEQWVHSASmt7x9rQJ7lRzO_l_Ce0TBG10k/export?format=csv&gid=0',

    // Role icons mapping - Modern themed
    ROLE_ICONS: {
        'CEO': '👑',
        'COO': '💎',
        'Admin': '⚡',
        'Marketing': '🚀',
        'Production': '⚙️',
        'Warehouse': '📦',
        'Manager': '⭐',
        'Team Lead': '🎯',
        'Team Member': '💫',
        'Default': '🎮'
    },

    // Role CSS classes
    ROLE_CLASSES: {
        'CEO': 'ceo',
        'COO': 'coo',
        'Admin': 'department-head',
        'Marketing': 'department-head',
        'Production': 'department-head',
        'Warehouse': 'department-head',
        'Manager': 'manager',
        'Team Lead': 'manager',
        'Default': 'team-member'
    }
};

// Global state
let orgData = [];
let expandedNodes = new Set();
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

// Event Listeners
refreshBtn.addEventListener('click', () => loadData());
expandAllBtn.addEventListener('click', () => toggleAllNodes(true));
collapseAllBtn.addEventListener('click', () => toggleAllNodes(false));
zoomInBtn.addEventListener('click', () => zoom(0.1));
zoomOutBtn.addEventListener('click', () => zoom(-0.1));
resetZoomBtn.addEventListener('click', () => resetView());
retryBtn.addEventListener('click', () => {
    hideError();
    loadData();
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
        // Check if URL is configured
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
        if (values.length === headers.length) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index].trim();
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

// Build organizational chart
function buildOrgChart() {
    orgChart.innerHTML = '';

    // Build hierarchy
    const hierarchy = buildHierarchy(orgData);

    // Render chart
    if (hierarchy.length > 0) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';

        hierarchy.forEach(node => {
            chartContainer.appendChild(renderNode(node));
        });

        orgChart.appendChild(chartContainer);
    } else {
        orgChart.innerHTML = '<p style="text-align: center; padding: 40px; font-size: 14px; color: var(--text-secondary);">No organizational data to display</p>';
    }
}

// Build hierarchy from flat data
function buildHierarchy(data) {
    const nodeMap = new Map();
    const roots = [];

    // Create all nodes
    data.forEach(item => {
        const node = {
            id: item.Name || item.name || '',
            name: item.Name || item.name || 'Unknown',
            title: item.Title || item.title || item.Role || item.role || '',
            department: item.Department || item.department || '',
            manager: item.Manager || item.manager || item.ReportsTo || item.reportsTo || '',
            children: []
        };
        nodeMap.set(node.id, node);
    });

    // Build parent-child relationships
    nodeMap.forEach(node => {
        if (node.manager && nodeMap.has(node.manager)) {
            nodeMap.get(node.manager).children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

// Render a node and its children
function renderNode(node, level = 0) {
    const container = document.createElement('div');
    container.className = 'node-container';
    container.dataset.nodeId = node.id;

    // Create node element
    const nodeElement = document.createElement('div');
    nodeElement.className = 'node ' + getNodeClass(node);

    // Add hover effect for team highlighting
    nodeElement.addEventListener('mouseenter', () => highlightTeam(node.id, true));
    nodeElement.addEventListener('mouseleave', () => highlightTeam(node.id, false));

    // Add icon
    const icon = document.createElement('span');
    icon.className = 'node-icon';
    icon.textContent = getNodeIcon(node);
    nodeElement.appendChild(icon);

    // Add name
    const nameElement = document.createElement('div');
    nameElement.className = 'node-name';
    nameElement.textContent = node.name;
    nodeElement.appendChild(nameElement);

    // Add title
    if (node.title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'node-title';
        titleElement.textContent = node.title;
        nodeElement.appendChild(titleElement);
    }

    // Add department
    if (node.department) {
        const deptElement = document.createElement('div');
        deptElement.className = 'node-title';
        deptElement.textContent = `📍 ${node.department}`;
        nodeElement.appendChild(deptElement);
    }

    // Add expand/collapse button if has children
    if (node.children && node.children.length > 0) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = expandedNodes.has(node.id) ? '▲ Collapse' : '▼ Expand';
        expandBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNode(node.id);
        };
        nodeElement.appendChild(expandBtn);
    }

    container.appendChild(nodeElement);

    // Render children
    if (node.children && node.children.length > 0) {
        // Connection line
        const connectionLine = document.createElement('div');
        connectionLine.className = 'connection-line';
        connectionLine.style.height = '40px';
        container.appendChild(connectionLine);

        // Children container
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'children-container';
        childrenContainer.id = `children-${node.id}`;

        if (!expandedNodes.has(node.id)) {
            childrenContainer.classList.add('collapsed');
        }

        node.children.forEach(child => {
            childrenContainer.appendChild(renderNode(child, level + 1));
        });

        container.appendChild(childrenContainer);
    }

    return container;
}

// Highlight team on hover
function highlightTeam(nodeId, highlight) {
    const container = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!container) return;

    const childrenContainer = container.querySelector(`#children-${nodeId}`);
    if (childrenContainer) {
        const childNodes = childrenContainer.querySelectorAll('.node');
        childNodes.forEach(node => {
            if (highlight) {
                node.style.borderColor = 'var(--moe-cyan)';
                node.style.boxShadow = '0 0 20px var(--moe-cyan-glow)';
            } else {
                node.style.borderColor = '';
                node.style.boxShadow = '';
            }
        });
    }
}

// Get node CSS class based on role/title
function getNodeClass(node) {
    const title = node.title.toLowerCase();
    const department = node.department;

    if (title.includes('ceo') || title.includes('chief executive')) {
        return CONFIG.ROLE_CLASSES['CEO'];
    }
    if (title.includes('coo') || title.includes('chief operating')) {
        return CONFIG.ROLE_CLASSES['COO'];
    }
    if (department === 'Admin' || department === 'Ops') {
        return CONFIG.ROLE_CLASSES['Admin'];
    }
    if (department === 'Marketing') {
        return CONFIG.ROLE_CLASSES['Marketing'];
    }
    if (department === 'Production') {
        return CONFIG.ROLE_CLASSES['Production'];
    }
    if (department === 'Warehouse') {
        return CONFIG.ROLE_CLASSES['Warehouse'];
    }
    if (title.includes('manager') || title.includes('head') || title.includes('lead')) {
        return CONFIG.ROLE_CLASSES['Manager'];
    }

    return CONFIG.ROLE_CLASSES['Default'];
}

// Get node icon based on role/title
function getNodeIcon(node) {
    const title = node.title.toLowerCase();
    const department = node.department;

    if (title.includes('ceo') || title.includes('chief executive')) {
        return CONFIG.ROLE_ICONS['CEO'];
    }
    if (title.includes('coo') || title.includes('chief operating')) {
        return CONFIG.ROLE_ICONS['COO'];
    }
    if (department === 'Admin' || department === 'Ops') {
        return CONFIG.ROLE_ICONS['Admin'];
    }
    if (department === 'Marketing') {
        return CONFIG.ROLE_ICONS['Marketing'];
    }
    if (department === 'Production') {
        return CONFIG.ROLE_ICONS['Production'];
    }
    if (department === 'Warehouse') {
        return CONFIG.ROLE_ICONS['Warehouse'];
    }
    if (title.includes('manager') || title.includes('head') || title.includes('lead')) {
        return CONFIG.ROLE_ICONS['Manager'];
    }

    return CONFIG.ROLE_ICONS['Default'];
}

// Toggle node expand/collapse
function toggleNode(nodeId) {
    if (expandedNodes.has(nodeId)) {
        expandedNodes.delete(nodeId);
    } else {
        expandedNodes.add(nodeId);
    }
    buildOrgChart();
}

// Toggle all nodes
function toggleAllNodes(expand) {
    if (expand) {
        // Expand all
        orgData.forEach(item => {
            expandedNodes.add(item.Name || item.name);
        });
    } else {
        // Collapse all
        expandedNodes.clear();
    }
    buildOrgChart();
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

// Demo data fallback (used when Google Sheets URL is not configured)
function loadDemoData() {
    orgData = [
        { Name: 'Catherine', Title: 'CEO', Department: '', Manager: '' },
        { Name: 'Pauline', Title: 'COO', Department: '', Manager: 'Catherine' },

        { Name: 'Janine', Title: 'Admin Head', Department: 'Admin', Manager: 'Pauline' },
        { Name: 'Angela', Title: 'Operations Manager', Department: 'Admin', Manager: 'Janine' },
        { Name: 'Con', Title: 'Office Manager', Department: 'Admin', Manager: 'Janine' },

        { Name: 'Jeanne', Title: 'Marketing Head', Department: 'Marketing', Manager: 'Pauline' },
        { Name: 'Kriselle', Title: 'Marketing Manager', Department: 'Marketing', Manager: 'Jeanne' },
        { Name: 'Kez', Title: 'Social Media Lead', Department: 'Marketing', Manager: 'Kriselle' },
        { Name: 'Edgar', Title: 'Content Creator', Department: 'Marketing', Manager: 'Kriselle' },
        { Name: 'Franz', Title: 'Designer', Department: 'Marketing', Manager: 'Kriselle' },
        { Name: 'Kei', Title: 'Ads Specialist', Department: 'Marketing', Manager: 'Kriselle' },

        { Name: 'Gjay', Title: 'Ads Team Lead', Department: 'Marketing', Manager: 'Pauline' },
        { Name: 'Olivet', Title: 'Ads Manager', Department: 'Marketing', Manager: 'Gjay' },

        { Name: 'Sharry', Title: 'Production Head', Department: 'Production', Manager: 'Pauline' },
        { Name: 'Micah', Title: 'Production Manager', Department: 'Production', Manager: 'Sharry' },

        { Name: 'Ryan', Title: 'US Warehouse Manager', Department: 'Warehouse', Manager: 'Pauline' },
        { Name: 'Michael', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan' },
        { Name: 'Dean', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan' },
        { Name: 'Claude', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Ryan' },

        { Name: 'Robert', Title: 'China Warehouse Manager', Department: 'Warehouse', Manager: 'Pauline' },
        { Name: 'Mary', Title: 'Warehouse Staff', Department: 'Warehouse', Manager: 'Robert' }
    ];

    buildOrgChart();
    hideLoading();
}

// Use demo data if Google Sheets URL is not configured
if (!CONFIG.SHEET_URL || CONFIG.SHEET_URL === 'YOUR_GOOGLE_SHEET_CSV_URL') {
    console.log('Using demo data. Configure Google Sheets URL to use real data.');
    setTimeout(loadDemoData, 1500); // Show loading animation briefly
}
