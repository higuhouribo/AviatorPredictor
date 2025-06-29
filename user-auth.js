// LocalStorage-based simple user and EA license management

function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function setUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
function setCurrentUser(user) { localStorage.setItem('currentUser', JSON.stringify(user)); }
function signOutUser() { localStorage.removeItem('currentUser'); window.location.href = "login.html"; }
function genLicenseKey() { return 'EA-' + Math.random().toString(36).substring(2,10).toUpperCase(); }
function getEAKeys(email) { return JSON.parse(localStorage.getItem('ea_keys_' + email) || '[]'); }
function setEAKeys(email, keys) { localStorage.setItem('ea_keys_' + email, JSON.stringify(keys)); }

// Signup
if(document.getElementById('signup-form')) {
  document.getElementById('signup-form').onsubmit = function(e){
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const trading = document.getElementById('signup-trading').value.trim();
    const fullname = document.getElementById('signup-fullname').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const msg = document.getElementById('signup-message');
    msg.style.display = "block";
    let users = getUsers();
    if(users.find(u=>u.email===email)) {
      msg.textContent = "Sign up not successful. Email already in use.";
      msg.className = "signup-message error";
      return;
    }
    if(email && trading && fullname && phone && password.length >= 6){
      const user = {email, trading, fullname, phone, password};
      users.push(user);
      setUsers(users);
      msg.textContent = "Sign up successful! Redirecting to login...";
      msg.className = "signup-message success";
      setTimeout(() => window.location.href='login.html', 1200);
    } else {
      msg.textContent = "Sign up not successful. Please complete all fields and use a strong password.";
      msg.className = "signup-message error";
    }
  }
}

// Login
if(document.getElementById('login-form')) {
  document.getElementById('login-form').onsubmit = function(e){
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-message');
    msg.style.display = "block";
    let users = getUsers();
    let user = users.find(u=>u.email===email && u.password===password);
    if(user){
      setCurrentUser(user);
      msg.textContent = "Login successful! Redirecting to dashboard...";
      msg.className = "signup-message success";
      setTimeout(() => window.location.href='dashboard.html', 1200);
    } else {
      msg.textContent = "Login failed. Please check your credentials.";
      msg.className = "signup-message error";
    }
  }
}

// Logout
if(document.getElementById('logout-link')){
  document.getElementById('logout-link').onclick = function(e){
    e.preventDefault();
    signOutUser();
  }
}

// Dashboard Auth
if(document.body && window.location.pathname.indexOf('dashboard') > -1) {
  if(!getCurrentUser()) window.location.href = "login.html";
  if(document.getElementById("dashboard-user")){
    document.getElementById("dashboard-user").textContent = getCurrentUser().fullname.split(' ')[0];
  }
}

// Account Management in Dashboard
if(document.getElementById('account-form')) {
  let user = getCurrentUser();
  document.getElementById("account-name").value = user.fullname;
  document.getElementById("account-trading").value = user.trading;
  document.getElementById("account-email").value = user.email;
  document.getElementById("account-phone").value = user.phone;
  document.getElementById('account-form').onsubmit = function(e){
    e.preventDefault();
    let users = getUsers();
    let idx = users.findIndex(u => u.email === user.email);
    if(idx === -1) return;
    let newFullname = document.getElementById("account-name").value;
    let newTrading = document.getElementById("account-trading").value;
    let newEmail = document.getElementById("account-email").value;
    let newPhone = document.getElementById("account-phone").value;
    let newPassword = document.getElementById("account-password").value;

    // If email is changed, update EA keys association
    if(users[idx].email !== newEmail) {
      let eaKeysOld = getEAKeys(users[idx].email);
      setEAKeys(newEmail, eaKeysOld);
      localStorage.removeItem('ea_keys_' + users[idx].email);
    }

    users[idx].fullname = newFullname;
    users[idx].trading = newTrading;
    users[idx].email = newEmail;
    users[idx].phone = newPhone;
    if(newPassword.length >= 6) users[idx].password = newPassword;
    setUsers(users);
    setCurrentUser(users[idx]);
    document.getElementById("account-update-message").textContent = "Account details updated!";
    document.getElementById("account-update-message").className = "signup-message success";
    setTimeout(()=>{document.getElementById("account-update-message").textContent='';}, 2000);
  };
}

// EA License Key Management
if(document.getElementById('ea-keys-section')) {
  function renderEAKeys() {
    let email = getCurrentUser().email;
    let keys = getEAKeys(email);
    let html = "";
    if(keys.length === 0) {
      html = "<div class='info-text'>No EAs added yet.</div>";
    } else {
      html = "<table class='ea-table'><thead><tr><th>Logo</th><th>EA Name</th><th>Key</th><th>Expiration</th><th>Status</th><th>Action</th></tr></thead><tbody>";
      for(let k of keys) {
        html += `<tr>
          <td><img src="${k.logo}" class="ea-logo" alt="EA Logo"/></td>
          <td>${k.name}</td>
          <td class="ea-key">${k.key}</td>
          <td>${k.expiry}</td>
          <td class="${k.stopped ? 'stopped' : 'active'}">${k.stopped ? 'Stopped' : 'Active'}</td>
          <td>
            <button class="btn ea-btn-stop" data-key="${k.key}">${k.stopped ? 'Start' : 'Stop'}</button>
            <button class="btn ea-btn-delete" data-key="${k.key}">Delete</button>
          </td>
        </tr>`;
      }
      html += "</tbody></table>";
    }
    document.getElementById('ea-keys-section').innerHTML = html;

    // Attach event listeners
    document.querySelectorAll('.ea-btn-delete').forEach(btn=>{
      btn.onclick = function(){
        let key = this.getAttribute('data-key');
        let keys = getEAKeys(getCurrentUser().email);
        keys = keys.filter(k=>k.key!==key);
        setEAKeys(getCurrentUser().email, keys);
        renderEAKeys();
      }
    });
    document.querySelectorAll('.ea-btn-stop').forEach(btn=>{
      btn.onclick = function(){
        let key = this.getAttribute('data-key');
        let keys = getEAKeys(getCurrentUser().email);
        keys = keys.map(k=>{
          if(k.key===key) k.stopped=!k.stopped;
          return k;
        });
        setEAKeys(getCurrentUser().email, keys);
        renderEAKeys();
      }
    });
  }
  renderEAKeys();

  // Add New EA
  document.getElementById('add-ea-toggle').onclick = function() {
    document.getElementById('add-ea-form-container').style.display='block';
    this.style.display='none';
  };
  document.getElementById('cancel-add-ea').onclick = function() {
    document.getElementById('add-ea-form-container').style.display='none';
    document.getElementById('add-ea-toggle').style.display='inline-block';
  };
  document.getElementById('add-ea-form').onsubmit = function(e){
    e.preventDefault();
    let name = document.getElementById('ea-name').value.trim();
    let logo = document.getElementById('ea-logo').value.trim();
    let key = genLicenseKey();
    let expiry = new Date(Date.now()+1000*60*60*24*30).toISOString().slice(0,10); // 30 days
    let obj = {name, logo, key, expiry, stopped: false};
    let keys = getEAKeys(getCurrentUser().email);
    keys.push(obj);
    setEAKeys(getCurrentUser().email, keys);
    renderEAKeys();
    document.getElementById('add-ea-form').reset();
    document.getElementById('add-ea-form-container').style.display='none';
    document.getElementById('add-ea-toggle').style.display='inline-block';
  }
}

// Hosting files download
if(document.getElementById("download-mt5")){
  document.getElementById("download-mt5").onclick = function() {
    // replace with your real hosting file URL
    window.open("https://example.com/mt5-hosting.zip", "_blank");
  }
}