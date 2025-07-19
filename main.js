// ============ Auth System ============

function showAuthTab(tab) {
  document.getElementById('loginTab').classList.remove('active');
  document.getElementById('signupTab').classList.remove('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'flex' : 'none';
  document.getElementById(tab + 'Tab').classList.add('active');
}
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
  [
    'dashboardSection', 'eaListSection', 'createEA', 'createKey', 'purchaseKeys',
    'keyStats', 'userListSection', 'exportSection', 'logsSection', 'helpSection'
  ].forEach(id => {
    let el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  let el = document.getElementById(sectionId);
  if (el) el.style.display = 'block';
  if (sectionId === 'keyStats') renderKeyStats();
  if (sectionId === 'eaListSection') renderEAList();
  if (sectionId === 'userListSection') renderUserList();
  if (sectionId === 'dashboardSection') renderDashboard();
  if (sectionId === 'logsSection') renderLogs();
}

// ============ Dashboard & Stats ============

function renderDashboard() {
  const email = localStorage.getItem('currentMentor');
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (!mentors[email]) return;
  const mentor = mentors[email];
  document.getElementById('dashboardWelcome').innerHTML = `Hello, ${mentor.name}`;
  updateDateTime();
  // Stats
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  let keyList = JSON.parse(localStorage.getItem('keys_' + email) || '[]');
  let users = {};
  let activeKeys = 0;
  keyList.forEach(k => {
    users[k.userEmail] = k.userName;
    if (k.status === 'Active') activeKeys++;
  });
  document.getElementById('statEAs').textContent = eaList.length;
  document.getElementById('statKeys').textContent = keyList.length;
  document.getElementById('statUsers').textContent = Object.keys(users).length;
  document.getElementById('statActiveKeys').textContent = activeKeys;
  // Recent actions
  renderRecentActions(email);
}
function updateDateTime() {
  const dt = new Date();
  document.getElementById('dateTime').textContent = dt.toLocaleString();
  setTimeout(updateDateTime, 1000);
}

function renderRecentActions(email) {
  let logs = JSON.parse(localStorage.getItem('logs_' + email) || '[]');
  logs = logs.slice(-7).reverse();
  let s = logs.map(l =>
    `<div><span class="log-date">${new Date(l.time).toLocaleString()}</span>: ${l.action}</div>`
  ).join('');
  document.getElementById('recentActions').innerHTML = s || "<span>No recent actions.</span>";
}

// ============ EA Management ============

function renderEAList() {
  const email = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  let el = document.getElementById('eaList');
  el.innerHTML = "";
  if (!eaList.length) {
    el.innerHTML = "<div>No EAs created yet.</div>";
    return;
  }
  eaList.forEach(ea => {
    const card = document.createElement('div');
    card.className = 'ea-card';
    card.innerHTML = `
      ${ea.logo ? `<img src="${ea.logo}" alt="EA Logo" class="ea-logo" />` : ""}
      <div class="ea-name">${ea.name}</div>
      <div class="ea-date">${new Date(ea.createdAt).toLocaleDateString()}</div>
      <div class="ea-actions">
        <button class="btn btn-secondary" onclick="editEA('${ea.id}')">Edit</button>
        <button class="btn btn-secondary" onclick="downloadEA('${ea.id}')">Download</button>
        <button class="btn btn-secondary" onclick="deleteEA('${ea.id}')">Delete</button>
      </div>
    `;
    el.appendChild(card);
  });
}
function generateEA() {
  const eaName = document.getElementById('eaName').value.trim();
  const logoInput = document.getElementById('eaLogo');
  const eaEditId = document.getElementById('eaEditId').value;
  if (!eaName) return alert("EA Name is required!");
  const email = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  let logoUrl = '';
  const done = (logoUrl) => {
    if (eaEditId) {
      // Editing
      const idx = eaList.findIndex(ea => ea.id === eaEditId);
      if (idx > -1) {
        eaList[idx].name = eaName;
        if (logoUrl) eaList[idx].logo = logoUrl;
        addLog('EA updated: ' + eaName);
      }
    } else {
      // Create new
      const newEA = {
        name: eaName,
        logo: logoUrl,
        createdAt: new Date().toISOString(),
        id: 'EA-' + (eaList.length + 1)
      };
      eaList.push(newEA);
      addLog('EA created: ' + eaName);
    }
    localStorage.setItem('eas_' + email, JSON.stringify(eaList));
    downloadEAFile(eaName);
    document.getElementById('eaName').value = '';
    document.getElementById('eaLogo').value = '';
    document.getElementById('eaEditId').value = '';
    document.getElementById('eaFormTitle').textContent = "Create New EA";
    showSection('eaListSection');
  };
  if (logoInput && logoInput.files && logoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      logoUrl = e.target.result;
      done(logoUrl);
    };
    reader.readAsDataURL(logoInput.files[0]);
  } else {
    done('');
  }
}
function downloadEA(eaId) {
  const email = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  const ea = eaList.find(ea => ea.id === eaId);
  if (!ea) return alert("EA not found.");
  downloadEAFile(ea.name);
}
function downloadEAFile(eaName) {
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
}
function deleteEA(eaId) {
  if (!confirm('Delete this EA?')) return;
  const email = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  const ea = eaList.find(ea => ea.id === eaId);
  eaList = eaList.filter(ea => ea.id !== eaId);
  localStorage.setItem('eas_' + email, JSON.stringify(eaList));
  addLog('EA deleted: ' + (ea?.name || eaId));
  renderEAList();
}
function editEA(eaId) {
  showSection('createEA');
  const email = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + email) || '[]');
  const ea = eaList.find(ea => ea.id === eaId);
  if (!ea) return;
  document.getElementById('eaName').value = ea.name;
  document.getElementById('eaEditId').value = ea.id;
  document.getElementById('eaFormTitle').textContent = "Edit EA";
}
function cancelEAEdit() {
  document.getElementById('eaName').value = '';
  document.getElementById('eaLogo').value = '';
  document.getElementById('eaEditId').value = '';
  document.getElementById('eaFormTitle').textContent = "Create New EA";
  showSection('eaListSection');
}

// ============ Key Generation & Management ============

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
  keyList.push({
    key,
    userName,
    userEmail,
    expiry,
    createdAt,
    status: 'Active'
  });
  localStorage.setItem('keys_' + mentorEmail, JSON.stringify(keyList));
  // Add to logs
  addLog('Key generated for ' + userName + ' (' + userEmail + ')');
  document.getElementById('generatedKey').textContent = `Key: ${key}`;
  // Simulate email sending
  alert(`Key generated and will be sent to ${userEmail} (simulated)!`);
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('keyExpiry').value = '3d';
  renderKeyStats();
  renderUserList();
}
function renderKeyStats() {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  const search = (document.getElementById('keySearch')?.value || '').toLowerCase();
  const filter = document.getElementById('keyStatusFilter')?.value || '';
  let tbody = document.querySelector('#keyStatsTable tbody');
  tbody.innerHTML = '';
  keyList.forEach((k, idx) => {
    let expired = false;
    if (k.status === 'Active') {
      // Check expiry
      let dt = new Date(k.createdAt);
      let expireDate = getExpiryDate(dt, k.expiry);
      if (expireDate < new Date()) {
        k.status = 'Expired';
        expired = true;
      }
    }
    // Filtering
    if (search && ![k.key, k.userName, k.userEmail].some(f => f.toLowerCase().includes(search))) return;
    if (filter && k.status !== filter) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${k.key}</td>
      <td>${k.userName}</td>
      <td>${k.userEmail}</td>
      <td>${new Date(k.createdAt).toLocaleString()}</td>
      <td>${expiryLabel(k.expiry)}</td>
      <td>${k.status}</td>
      <td>
        ${k.status === 'Active' ? `<button class="key-action-btn" onclick="deactivateKey(${idx})">Deactivate</button>` : ''}
        ${k.status === 'Inactive' ? `<button class="key-action-btn" onclick="activateKey(${idx})">Activate</button>` : ''}
        <button class="key-action-btn" onclick="updateKeyExpiry(${idx})">Update Expiry</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  localStorage.setItem('keys_' + mentorEmail, JSON.stringify(keyList)); // Save status changes
}
function deactivateKey(idx) {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  if (keyList[idx]) {
    keyList[idx].status = 'Inactive';
    addLog('Key deactivated: ' + keyList[idx].key);
    localStorage.setItem('keys_' + mentorEmail, JSON.stringify(keyList));
    renderKeyStats();
  }
}
function activateKey(idx) {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  if (keyList[idx]) {
    keyList[idx].status = 'Active';
    addLog('Key activated: ' + keyList[idx].key);
    localStorage.setItem('keys_' + mentorEmail, JSON.stringify(keyList));
    renderKeyStats();
  }
}
function updateKeyExpiry(idx) {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  if (!keyList[idx]) return;
  let exp = prompt("Enter new expiry for this key (3d, 1m, 2m, 6m, 1y):", keyList[idx].expiry);
  if (!exp || !['3d','1m','2m','6m','1y'].includes(exp)) return;
  keyList[idx].expiry = exp;
  keyList[idx].createdAt = new Date().toISOString(); // Reset createdAt for new expiry
  keyList[idx].status = 'Active';
  addLog('Key expiry updated: ' + keyList[idx].key + ' -> ' + expiryLabel(exp));
  localStorage.setItem('keys_' + mentorEmail, JSON.stringify(keyList));
  renderKeyStats();
}
function getExpiryDate(start, expiry) {
  let end = new Date(start);
  switch (expiry) {
    case '3d': end.setDate(end.getDate() + 3); break;
    case '1m': end.setMonth(end.getMonth() + 1); break;
    case '2m': end.setMonth(end.getMonth() + 2); break;
    case '6m': end.setMonth(end.getMonth() + 6); break;
    case '1y': end.setFullYear(end.getFullYear() + 1); break;
  }
  return end;
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

// ============ User Management ============

function renderUserList() {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  let users = {};
  keyList.forEach(k => {
    if (!users[k.userEmail]) {
      users[k.userEmail] = {
        userName: k.userName,
        userEmail: k.userEmail,
        keys: [],
        status: k.status
      };
    }
    users[k.userEmail].keys.push(k.key);
    if (k.status === 'Active') users[k.userEmail].status = 'Active';
  });
  let el = document.getElementById('userList');
  el.innerHTML = '';
  let arr = Object.values(users);
  if (!arr.length) {
    el.innerHTML = '<div>No users yet.</div>';
    return;
  }
  let table = `<table class="user-table"><thead>
    <tr><th>Name</th><th>Email</th><th>Keys</th><th>Status</th></tr>
    </thead><tbody>`;
  arr.forEach(u => {
    table += `<tr>
      <td>${u.userName}</td>
      <td>${u.userEmail}</td>
      <td>${u.keys.join(', ')}</td>
      <td>${u.status}</td>
    </tr>`;
  });
  table += '</tbody></table>';
  el.innerHTML = table;
}

// ============ Logs ============

function addLog(action) {
  const email = localStorage.getItem('currentMentor');
  let logs = JSON.parse(localStorage.getItem('logs_' + email) || '[]');
  logs.push({ action, time: new Date().toISOString() });
  localStorage.setItem('logs_' + email, JSON.stringify(logs));
}
function renderLogs() {
  const email = localStorage.getItem('currentMentor');
  let logs = JSON.parse(localStorage.getItem('logs_' + email) || '[]').reverse();
  let el = document.getElementById('logsList');
  el.innerHTML = logs.map(
    l => `<div><span class="log-date">${new Date(l.time).toLocaleString()}</span>: ${l.action}</div>`
  ).join('') || "<span>No logs yet.</span>";
}

// ============ Export/Backup ============

function exportKeys() {
  const mentorEmail = localStorage.getItem('currentMentor');
  let keyList = JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]');
  let csv = 'Key,User Name,User Email,Created At,Expiry,Status\n';
  keyList.forEach(k => {
    csv += `"${k.key}","${k.userName}","${k.userEmail}","${new Date(k.createdAt).toLocaleString()}","${expiryLabel(k.expiry)}","${k.status}"\n`;
  });
  downloadFile(csv, `keys_export_${Date.now()}.csv`);
}
function exportEAs() {
  const mentorEmail = localStorage.getItem('currentMentor');
  let eaList = JSON.parse(localStorage.getItem('eas_' + mentorEmail) || '[]');
  let csv = 'EA Name,Created At\n';
  eaList.forEach(ea => {
    csv += `"${ea.name}","${new Date(ea.createdAt).toLocaleString()}"\n`;
  });
  downloadFile(csv, `eas_export_${Date.now()}.csv`);
}
function backupData() {
  const mentorEmail = localStorage.getItem('currentMentor');
  let data = {
    eas: JSON.parse(localStorage.getItem('eas_' + mentorEmail) || '[]'),
    keys: JSON.parse(localStorage.getItem('keys_' + mentorEmail) || '[]'),
    logs: JSON.parse(localStorage.getItem('logs_' + mentorEmail) || '[]')
  };
  let json = JSON.stringify(data, null, 2);
  downloadFile(json, `backup_${Date.now()}.json`);
}
function downloadFile(content, filename) {
  let blob = new Blob([content], { type: "text/plain" });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  document.getElementById('exportStatus').innerHTML = 'Downloaded: ' + filename;
}
function importBackup(e) {
  const mentorEmail = localStorage.getItem('currentMentor');
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function (event) {
    try {
      let data = JSON.parse(event.target.result);
      if (data.eas) localStorage.setItem('eas_' + mentorEmail, JSON.stringify(data.eas));
      if (data.keys) localStorage.setItem('keys_' + mentorEmail, JSON.stringify(data.keys));
      if (data.logs) localStorage.setItem('logs_' + mentorEmail, JSON.stringify(data.logs));
      alert('Backup imported!');
      renderEAList();
      renderKeyStats();
      renderLogs();
    } catch (ex) {
      alert('Invalid backup file!');
    }
  };
  reader.readAsText(file);
}

// ============ Profile & Security ============

function loadDashboard() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('dashboardContainer').style.display = 'block';
  const email = localStorage.getItem('currentMentor');
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (!mentors[email]) return;
  const mentor = mentors[email];
  document.getElementById('profileIcon').textContent = mentor.name[0]?.toUpperCase() || '?';
  document.getElementById('profileDropdown').innerHTML = `
    <p><strong>Mentor:</strong> <span id="profileName">${mentor.name}</span></p>
    <p><strong>Email:</strong> <span id="profileEmail">${mentor.email}</span></p>
    <p><strong>ID:</strong> ${mentor.id}</p>
    <hr>
    <button class="btn" onclick="showProfileEdit()" style="width:100%;">Edit Profile</button>
    <button class="btn" onclick="showChangePassword()" style="width:100%;">Change Password</button>
    <button class="btn" onclick="logout()" style="width:100%;margin-top:6px;">Logout</button>
    <div id="profileEditFields" style="display:none;">
      <input type="text" id="editProfileName" placeholder="New Name" />
      <input type="email" id="editProfileEmail" placeholder="New Email" />
      <button class="btn" onclick="saveProfileEdit()" style="width:100%;">Save</button>
    </div>
    <div id="changePasswordFields" style="display:none;">
      <input type="password" id="oldPassword" placeholder="Current Password" />
      <input type="password" id="newPassword" placeholder="New Password" />
      <button class="btn" onclick="saveNewPassword()" style="width:100%;">Update</button>
    </div>
  `;
  showSection('dashboardSection');
  renderDashboard();
}
function showProfileEdit() {
  document.getElementById('profileEditFields').style.display = 'block';
  document.getElementById('changePasswordFields').style.display = 'none';
}
function saveProfileEdit() {
  const newName = document.getElementById('editProfileName').value.trim();
  const newEmail = document.getElementById('editProfileEmail').value.trim().toLowerCase();
  const email = localStorage.getItem('currentMentor');
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (!mentors[email]) return;
  if (newName) mentors[email].name = newName;
  if (newEmail && newEmail !== email) {
    if (mentors[newEmail]) {
      alert('Email already exists!');
      return;
    }
    mentors[newEmail] = mentors[email];
    delete mentors[email];
    localStorage.setItem('mentors', JSON.stringify(mentors));
    localStorage.setItem('currentMentor', newEmail);
    // Move mentor data
    ['eas_', 'keys_', 'logs_'].forEach(prefix => {
      let d = localStorage.getItem(prefix + email);
      if (d) {
        localStorage.setItem(prefix + newEmail, d);
        localStorage.removeItem(prefix + email);
      }
    });
  } else {
    localStorage.setItem('mentors', JSON.stringify(mentors));
  }
  alert('Profile updated!');
  document.getElementById('profileEditFields').style.display = 'none';
  loadDashboard();
}
function showChangePassword() {
  document.getElementById('changePasswordFields').style.display = 'block';
  document.getElementById('profileEditFields').style.display = 'none';
}
function saveNewPassword() {
  const oldP = document.getElementById('oldPassword').value;
  const newP = document.getElementById('newPassword').value;
  const email = localStorage.getItem('currentMentor');
  let mentors = JSON.parse(localStorage.getItem('mentors') || '{}');
  if (!mentors[email]) return;
  if (mentors[email].password !== oldP) {
    alert('Current password incorrect!');
    return;
  }
  if (!newP) {
    alert('New password required!');
    return;
  }
  mentors[email].password = newP;
  localStorage.setItem('mentors', JSON.stringify(mentors));
  alert('Password updated!');
  document.getElementById('changePasswordFields').style.display = 'none';
}

// ============ On Load ============
window.onload = function () {
  checkAuth();
  document.getElementById('sidebar').classList.remove('active');
};
window.onresize = function () {
  document.getElementById('profileDropdown').style.display = 'none';
};