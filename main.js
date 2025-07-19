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
  const output = `Key: ${key}\nUser: ${name}\nEmail: ${email}\nExpiry: ${expiry}`;

  document.getElementById('generatedKey').innerText = output;

  // In real version: send email here via backend API (future setup)
  alert(`Key generated:\n${output}`);
}

function updateDateTime() {
  const now = new Date();
  const display = now.toLocaleString();
  document.getElementById('dateTime').innerText = `Date & Time: ${display}`;
}
updateDateTime();
setInterval(updateDateTime, 60000);

