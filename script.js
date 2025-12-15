// Configuration
const CONFIG = {
    SHEET_URL: 'https://docs.google.com/spreadsheets/d/18kYODhewBvEQWVHSASmt7x9rQJ7lRzO_l_Ce0TBG10k/export?format=csv&gid=0',
};

// Global state
let orgData = [];

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const errorMessage = document.getElementById('errorMessage');
const orgChart = document.getElementById('orgChart');
const refreshBtn = document.getElementById('refreshBtn');
const retryBtn = document.getElementById('retryBtn');
const employeeModal = document.getElementById('employeeModal');
const modalClose = document.getElementById('modalClose');

// Event Listeners
refreshBtn.addEventListener('click', () => loadData());
retryBtn.addEventListener('click', () => {
    hideError();
    loadData();
});

modalClose.addEventListener('click', () => closeModal());
employeeModal.addEventListener('click', (e) => {
    if (e.target === employeeModal) closeModal();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
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

// Fix Imgur URLs
function fixImgurUrl(url) {
    if (!url || !url.includes('imgur.com')) return url;

    if (url.includes('/a/')) {
        console.warn('Album link detected. Please use direct image link instead:', url);
        return url;
    }

    if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
        const imageId = url.split('imgur.com/')[1].split(/[/?#]/)[0];
        return `https://i.imgur.com/${imageId}.png`;
    }

    return url;
}

// Build organizational chart as a tree
function buildOrgChart() {
    orgChart.innerHTML = '';

    const tree = document.createElement('div');
    tree.className = 'tree';

    // Find CEO
    const ceo = orgData.find(p => p.Name === 'Catherine' || p.Title.toLowerCase().includes('ceo'));

    if (ceo) {
        tree.appendChild(buildTreeNode(ceo));
    }

    orgChart.appendChild(tree);
}

// Build a tree node recursively
function buildTreeNode(person) {
    const nodeContainer = document.createElement('div');
    nodeContainer.className = 'tree-node';

    // Create the person's card
    const node = document.createElement('div');
    node.className = `node ${getNodeClass(person)}`;
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

    if (person.Location) {
        const locationEl = document.createElement('div');
        locationEl.className = 'node-location';
        locationEl.textContent = person.Location;
        node.appendChild(locationEl);
    }

    nodeContainer.appendChild(node);

    // Find direct reports
    const directReports = orgData.filter(p => p.Manager === person.Name);

    // Special handling for Marketing - split into sub-departments
    if (person.Department === 'Marketing' && !person.SubDepartment && directReports.length > 0) {
        // Group by SubDepartment
        const organicTeam = directReports.filter(p => p.SubDepartment === 'Organic Team');
        const adsTeam = directReports.filter(p => p.SubDepartment === 'Ads Team');
        const noSubDept = directReports.filter(p => !p.SubDepartment);

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';

        // Render Organic Team
        if (organicTeam.length > 0) {
            const organicNode = createSubDepartmentNode('Organic Team', organicTeam);
            childrenContainer.appendChild(organicNode);
        }

        // Render Ads Team
        if (adsTeam.length > 0) {
            const adsNode = createSubDepartmentNode('Ads Team', adsTeam);
            childrenContainer.appendChild(adsNode);
        }

        // Render people without sub-department
        noSubDept.forEach(report => {
            childrenContainer.appendChild(buildTreeNode(report));
        });

        if (childrenContainer.children.length > 0) {
            nodeContainer.appendChild(childrenContainer);
        }
    } else if (directReports.length > 0) {
        // Normal rendering for other departments
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';

        directReports.forEach(report => {
            childrenContainer.appendChild(buildTreeNode(report));
        });

        nodeContainer.appendChild(childrenContainer);
    }

    return nodeContainer;
}

// Create a sub-department node
function createSubDepartmentNode(subDeptName, team) {
    const subDeptContainer = document.createElement('div');
    subDeptContainer.className = 'tree-node';

    // Sub-department header
    const subDeptNode = document.createElement('div');
    subDeptNode.className = 'node department';

    const nameEl = document.createElement('div');
    nameEl.className = 'node-name';
    nameEl.textContent = subDeptName;
    subDeptNode.appendChild(nameEl);

    subDeptContainer.appendChild(subDeptNode);

    // Team members under this sub-department
    if (team.length > 0) {
        const teamContainer = document.createElement('div');
        teamContainer.className = 'tree-children';

        team.forEach(member => {
            teamContainer.appendChild(buildTreeNode(member));
        });

        subDeptContainer.appendChild(teamContainer);
    }

    return subDeptContainer;
}

// Get node class based on role
function getNodeClass(person) {
    const title = person.Title.toLowerCase();

    if (title.includes('ceo')) return 'ceo';
    if (title.includes('obm') || title.includes('coo')) return 'obm';
    if (title.includes('head') || title.includes('director')) return 'department-head';
    if (title.includes('manager') || title.includes('lead')) return 'department-head';

    return 'team-member';
}

// Show employee modal
function showEmployeeModal(person) {
    if (typeof person === 'string') {
        person = JSON.parse(person);
    }

    let imageUrl = person.ImageURL || person.Image || person.Photo || '';
    imageUrl = fixImgurUrl(imageUrl);

    const imageHtml = imageUrl && imageUrl.trim() ?
        `<img id="modalImage" class="modal-image" src="${imageUrl}" alt="${person.Name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="modal-image placeholder" style="display: none;">${person.Name.charAt(0)}</div>` :
        `<div class="modal-image placeholder">${person.Name.charAt(0)}</div>`;

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
                ${person.Department ? `<div class="modal-department">${person.Department}</div>` : ''}
                ${person.SubDepartment ? `<div class="modal-department">${person.SubDepartment}</div>` : ''}
                ${person.Manager ? `<div class="modal-department" style="margin-top: 8px;">Reports to: ${person.Manager}</div>` : ''}
                ${person.Location ? `<div class="modal-department" style="margin-top: 4px;">📍 ${person.Location}</div>` : ''}
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

window.closeModal = closeModal;
window.showEmployeeModal = showEmployeeModal;

// UI Helpers
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
