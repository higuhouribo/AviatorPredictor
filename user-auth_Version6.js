// === Simple localStorage Auth Demo (Replace with backend integration in production) ===
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}
function signOutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = "login.html";
}

// Sign Up
if(document.getElementById('signup-form')) {
  document.getElementById('signup-form').onsubmit = function(e){
    e.preventDefault();
    const name = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('signup-message');
    msg.style.display = "block";
    let users = getUsers();
    if(users.find(u=>u.email===email)) {
      msg.textContent = "Sign up not successful. Email already in use.";
      msg.className = "signup-message error";
      return;
    }
    if(name && email && password.length >= 6){
      const user = {name, email, password, role: "mentor"};
      users.push(user);
      setUsers(users);
      setCurrentUser(user);
      msg.textContent = "Sign up successful! Redirecting to dashboard...";
      msg.className = "signup-message success";
      setTimeout(() => window.location.href='dashboard.html', 1200);
    } else {
      msg.textContent = "Sign up not successful. Please complete all fields and use a strong password.";
      msg.className = "signup-message error";
    }
  }
}

// Log In
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

// Auth-protected pages
if(document.body.classList.contains('dashboard-bg')) {
  if(!getCurrentUser()) window.location.href = "login.html";
  if(document.getElementById("dashboard-user")){
    document.getElementById("dashboard-user").textContent = getCurrentUser().name.split(' ')[0];
  }
}

// Profile page
if(document.getElementById("profile-form")) {
  let user = getCurrentUser();
  document.getElementById("profile-name").value = user.name;
  document.getElementById("profile-email").value = user.email;
  document.getElementById("profile-form").onsubmit = function(e){
    e.preventDefault();
    let users = getUsers();
    users = users.map(u => u.email === user.email ? {...u, name: document.getElementById("profile-name").value, email: document.getElementById("profile-email").value} : u);
    setUsers(users);
    setCurrentUser({...user, name: document.getElementById("profile-name").value, email: document.getElementById("profile-email").value});
    alert("Profile updated!");
  }
  document.getElementById("change-password-form").onsubmit = function(e){
    e.preventDefault();
    const oldp = document.getElementById("old-password").value;
    const newp = document.getElementById("new-password").value;
    const msg = document.getElementById("profile-message");
    msg.style.display = "block";
    if(oldp !== user.password) {
      msg.textContent = "Incorrect current password.";
      msg.className = "signup-message error";
      return;
    }
    if(newp.length<6) {
      msg.textContent = "New password is too weak.";
      msg.className = "signup-message error";
      return;
    }
    let users = getUsers();
    users = users.map(u => u.email === user.email ? {...u, password: newp} : u);
    setUsers(users);
    setCurrentUser({...user, password: newp});
    msg.textContent = "Password changed successfully.";
    msg.className = "signup-message success";
  }
}