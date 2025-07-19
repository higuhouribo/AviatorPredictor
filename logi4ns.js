function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function toggleProfile() {
  const dropdown = document.getElementById('profileDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function showSection(id) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
  if (id === 'keyStats') renderKeyStats();
}

function generateEA() {
  const eaName = document.getElementById('eaName').value;
  if (!eaName) return alert("Enter EA name");
  const content = `// Smart-Trade EA Hosting File for ${eaName}\n// Monitors trading activity`;
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${eaName}_host.mq5`;
  link.click();
}

function generateKey() {
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const expiry = document.getElementById('keyExpiry').value;

  if (!name || !email) {
    alert('Please enter name and email');
    return;
  }

  const key = 'KEY-' + Math.random().toString(36).substr(2, 10).toUpperCase();
  const dateCreated = new Date().toLocaleString();
  const keyData = {
    key,
    name,
    email,
    expiry,
    dateCreated
  };

  const keys = JSON.parse(localStorage.getItem('keyStats') || '[]');
  keys.push(keyData);
  localStorage.setItem('keyStats', JSON.stringify(keys));

  const output = `Key: ${key}\nUser: ${name}\nEmail: ${email}\nExpiry: ${expiry}`;
  document.getElementById('generatedKey').innerText = output;
  alert(`Key generated:\n${output}`);
}

function renderKeyStats() {
  const keys = JSON.parse(localStorage.getItem('keyStats') || '[]');
  const container = document.getElementById('keyStatsContent');
  container.innerHTML = '';

  if (keys.length === 0) {
    container.innerHTML = '<p>No keys generated yet.</p>';
    return;
  }

  keys.reverse().forEach(k => {
    const block = document.createElement('div');
    block.style.marginBottom = '15px';
    block.innerHTML = `
      <strong>${k.name}</strong> (<i>${k.email}</i>)<br>
      Key: <code>${k.key}</code><br>
      Expiry: ${k.expiry}<br>
      Created on: ${k.dateCreated}<br>
      <hr style="border-color:#00ff66;">
    `;
    container.appendChild(block);
  });
}

function updateDateTime() {
  const now = new Date();
  const display = now.toLocaleString();
  document.getElementById('dateTime').innerText = `Date & Time: ${display}`;
}
updateDateTime();
setInterval(updateDateTime, 60000);

function handleSignup() {
  const email = document.getElementById('signupEmail').value;
  const name = document.getElementById('signupFullName').value;
  const password = document.getElementById('signupPassword').value;

  if (!email || !name || !password) {
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem('mentorEmail', email);
  localStorage.setItem('mentorName', name);
  localStorage.setItem('mentorPassword', password);
  alert("Signup successful. Please login.");
  switchToLogin();
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const storedEmail = localStorage.getItem('mentorEmail');
  const storedPassword = localStorage.getItem('mentorPassword');

  if (email === storedEmail && password === storedPassword) {
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';

    document.getElementById('mentorNameDisplay').innerText = localStorage.getItem('mentorName');
    document.getElementById('mentorName').innerText = localStorage.getItem('mentorName');
    document.getElementById('mentorEmail').innerText = localStorage.getItem('mentorEmail');
  } else {
    alert("Invalid credentials");
  }
}

function switchToLogin() {
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
}

function switchToSignup() {
  document.getElementById('signupSection').style.display = 'block';
  document.getElementById('loginSection').style.display = 'none';
}