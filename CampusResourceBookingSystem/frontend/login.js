// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const studentRadio = document.getElementById('student');
  const adminRadio = document.getElementById('admin');

  // Remove the hardcoded links and add a submit button
  const linksDiv = form.querySelector('div:last-child');
  linksDiv.innerHTML = '<button type="submit">Log In</button>';

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const userType = studentRadio.checked ? 'student' : 'admin';

    // Validate credentials
    const result = await validateLogin(username, password, userType);

    if (result.isValid) {
      // Store current user info in sessionStorage for use across pages
      sessionStorage.setItem('currentUser', JSON.stringify({
        username: result.user.username,
        userType: userType,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        phone: result.user.phone
      }));

      // Redirect based on user type
      if (userType === 'admin') {
        window.location.href = 'administrator/dashboard.html';
      } else {
        window.location.href = 'students_faculty/mainPage.html';
      }
    } else {
      alert('Invalid username or password. Please try again.');
      passwordInput.value = ''; // Clear password field
    }
  });
});

// Function to validate login credentials
async function validateLogin(username, password, userType) {
  try {
    // Fetch users data from JSON file
    const response = await fetch('resources/users.json');
    const data = await response.json();

    // Get the appropriate user list based on type
    const users = userType === 'admin' ? data.admins : data.students;

    // Check if username and password match
    const user = users.find(u => u.username === username && u.password === password);

    // Additional validation: check username format
    if (user) {
      const prefix = username.substring(0, 3);
      if (userType === 'student' && prefix === '403') {
        return { isValid: true, user: user };
      } else if (userType === 'admin' && prefix === '503') {
        return { isValid: true, user: user };
      }
    }

    return { isValid: false, user: null };
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Error loading login data. Please try again later.');
    return { isValid: false, user: null };
  }
}
