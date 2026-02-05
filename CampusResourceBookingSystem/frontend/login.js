// Login page 
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validate inputs
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  // Validate credentials
  const result = await validateLogin(username, password);

  if (result.isValid) {
    // Store user info in sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify({
      username: result.user.username,
      userType: 'student',
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      phone: result.user.phone
    }));

    // Redirect to main page
    window.location.href = 'mainPage.html';
  } else {
    alert('Invalid username or password. Please try again.');
    document.getElementById('password').value = '';
  }
});

// Validate login credentials 
async function validateLogin(username, password) {
  try {
    // Fetch users data from JSON file
    const response = await fetch('users.json');

    if (!response.ok) {
      throw new Error('Could not load users.json file');
    }

    const data = await response.json();

    // Check students 
    const users = data.students;
    const user = users.find(u => u.username === username && u.password === password);

    // Check if user exists and has valid student username (starts with 403)
    if (user) {
      const prefix = username.substring(0, 3);
      if (prefix === '403') {
        return { isValid: true, user: user };
      }
    }

    return { isValid: false, user: null };
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Error loading login data.');
    return { isValid: false, user: null };
  }
}
