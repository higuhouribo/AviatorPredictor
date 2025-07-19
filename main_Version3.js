// ============ Auth System ============
function showAuthTab(tab) {
  document.getElementById('loginTab').classList.remove('active');
  document.getElementById('signupTab').classList.remove('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'flex' : 'none';
  document.getElementById(tab + 'Tab').classList.add('active');
}

// Save mentors in localStorage as: mentors = { email: { name, email, password, id } }
function signup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  if (!name || !email || !password) return false;
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (mentors[email]) {
    alert('Account already exists!');
    return false;
  }
  // Generate mentor ID
  const id = 'MNT-' + String(Object.keys(mentors).length + 1).padStart(5, '0');
  mentors[email] = { name, email, password, id };
  localStorage.setItem('mentors', JSON.stringify(mentors));
  alert('Signup successful! Please login.');
  showAuthTab('login');
  return false;
}

function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (!mentors[email] || mentors[email].password !== password) {
    alert('Invalid email or password!');
    return false;
  }
  localStorage.setItem('currentMentor', email);
  loadDashboard();
  return false;
}

function loadDashboard() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('dashboardContainer').style.display = 'block';
  // Load profile & dashboard
  const email = localStorage.getItem('currentMentor');
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (!mentors[email]) return;
  const mentor = mentors[email];
  // Welcome box
  document.getElementById('dashboardWelcome').innerHTML = `Hello, ${mentor.name}`;
  // Profile icon
  document.getElementById('profileIcon').textContent = mentor.name[0]?.toUpperCase() || '?';
  // Profile dropdown
  document.getElementById('profileDropdown').innerHTML = `
    <p><strong>Mentor:</strong> ${mentor.name}</p>
    <p><strong>Email:</strong> ${mentor.email}</p>
    <p><strong>ID:</strong> ${mentor.id}</p>
    <button class="btn" onclick="logout()" style="width:100%;margin-top:6px;">Logout</button>
  `;
  showSection('welcomeBox');
  updateDateTime();
  renderKeyStats();
}

function logout() {
  localStorage.removeItem('currentMentor');
  location.reload();
}

function checkAuth() {
  const email = localStorage.getItem('currentMentor');
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (email && mentors[email]) {
    loadDashboard();
  }
}
// ============ Sidebar & UI ============

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
}

function toggleProfile() {
  const dropdown = document.getElementById('profileDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  // Hide dropdown when clicking outside
  if (dropdown.style.display === 'block') {
    setTimeout(() => {
      document.addEventListener('mousedown', hideProfileDropdownOnClick, { once: true });
    }, 10);
  }
}
function hideProfileDropdownOnClick(e) {
  const dropdown = document.getElementById('profileDropdown');
  if (!dropdown.contains(e.target) && e.target.id !== 'profileIcon') {
    dropdown.style.display = 'none';
  }
}

function showSection(sectionId) {
  // Hide all sections
  ['welcomeBox', 'createEA', 'createKey', 'purchaseKeys', 'keyStats'].forEach(id => {
    let el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Show selected section
  let el = document.getElementById(sectionId);
  if (el) el.style.display = 'block';
  if (sectionId === 'keyStats') renderKeyStats();
}

// ============ DateTime ============

function updateDateTime() {
  const dt = new Date();
  const str = dt.toLocaleString();
  document.getElementById('dateTime').textContent = str;
  setTimeout(updateDateTime, 1000);
}

// ============ EA Creation ============

function generateEA() {
  const eaName = document.getElementById('eaName').value.trim();
  const logoInput = document.getElementById('eaLogo');
  if (!eaName) return alert("EA Name is required!");
  // Save EA info for mentor in localStorage (future: show in stats)
  const email = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  let logoUrl = '';
  if (logoInput && logoInput.files && logoInput.files[0]) {
    // Save logo as dataURL for display in app
    const reader = new FileReader();
    reader.onload = function (e) {
      logoUrl = e.target.result;
      saveEAEntry(eaName, logoUrl, eaList, email);
    };
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    saveEAEntry(eaName, '', eaList, email);
  }
}

function saveEAEntry(eaName, logoUrl, eaList, email) {
  const newEA = {
    name: eaName,
    logo: logoUrl,
    createdAt: new Date().toISOString(),
    id: 'EA-' + (eaList.length + 1)
  };
  eaList.push(newEA);
  localStorage.setItem('eas_' + email, JSON.stringify(eaList));
  // Download dummy .mq5 file (simulate)
  const fileContent = `// Smart-Trade EA Hosting File
// EA: ${eaName}
// Created: ${new Date().toLocaleString()}
#property copyright "Smart-Trade EA"
#property version   "1.00"
input string EA_Name = "${eaName}";
// ... EA logic for monitoring orders goes here ...
`;
  const blob = new Blob([fileContent], { type: "text/plain" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${eaName.replace(/[^a-zA-Z0-9_\-]/g, "_")}_Hosting.mq5`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  alert("EA Created & Hosting File Downloaded!");
  document.getElementById('eaName').value = '';
  document.getElementById('eaLogo').value = '';
}

// ============ Key Generation ============

function generateKey() {
  const userName = document.getElementById('userName').value.trim();
  const userEmail = document.getElementById('userEmail').value.trim().toLowerCase();
  const expiry = document.getElementById('keyExpiry').value;
  if (!userName || !userEmail) {
    alert("Please enter all key user details!");
    return;
  }
  const key = 'KEY-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const createdAt = new Date().toISOString();
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  // Save key
  keyList.push({
    key,
    userName,
    userEmail,
    expiry,
    createdAt,
    status: 'Active'
  });
  localStorage.setItem('keys_' + mentorEmail, JSON.stringify(keyList));
  // Display key
  document.getElementById('generatedKey').textContent = `Key: ${key}`;
  // Simulate email sending
  alert(`Key generated and will be sent to ${userEmail} (simulated)!`);
  // Clear form
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('keyExpiry').value = '3d';
  renderKeyStats();
}

// ============ Key Stats ============

function renderKeyStats() {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  let tbody = document.querySelector('#keyStatsTable tbody');
  tbody.innerHTML = '';
  for (let k of keyList) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${k.key}</td>
      <td>${k.userName}</td>
      <td>${k.userEmail}</td>
      <td>${new Date(k.createdAt).toLocaleString()}</td>
      <td>${expiryLabel(k.expiry)}</td>
      <td>${k.status}</td>
    `;
    tbody.appendChild(tr);
  }
}

function expiryLabel(exp) {
  switch (exp) {
    case '3d': return '3 Days';
    case '1m': return '1 Month';
    case '2m': return '2 Months';
    case '6m': return '6 Months';
    case '1y': return '1 Year';
    default: return exp;
  }
}

// ============ On Load ============
window.onload = function () {
  checkAuth();
  // Hide sidebar on mobile by default
  document.getElementById('sidebar').classList.remove('active');
};
// Hide dropdown if window resizes
window.onresize = function () {
  document.getElementById('profileDropdown').style.display = 'none';
};