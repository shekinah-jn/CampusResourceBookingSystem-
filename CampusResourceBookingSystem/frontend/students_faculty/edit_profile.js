// run when page loads
window.onload = async function(){

    // get form inputs
    var usernameInput = document.getElementById("username");
    var firstNameInput = document.getElementById("first-name");
    var lastNameInput= document.getElementById("last-name");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");
    var passwordInput = document.getElementById("password");
    var confirmInput = document.getElementById("confirm-password");
    var saveLink = document.getElementById("save-profile");

    // Get current user from sessionStorage
    var currentUserStr = sessionStorage.getItem('currentUser');

    if (!currentUserStr) {
        alert("No user logged in. Redirecting to login page.");
        window.location.href = "../login_page.html";
        return;
    }

    var currentUser = JSON.parse(currentUserStr);

    // Pre-fill form with current user data
    usernameInput.value = currentUser.username || "";
    firstNameInput.value = currentUser.firstName || "";
    lastNameInput.value = currentUser.lastName || "";
    emailInput.value = currentUser.email || "";
    phoneInput.value = currentUser.phone || "";

    // Make username read-only (shouldn't be changed)
    usernameInput.setAttribute('readonly', true);
    usernameInput.style.backgroundColor = "#f0f0f0";

    // save profile on click
    saveLink.addEventListener("click", async function(event){
        // stop page from redirecting immediately
        event.preventDefault();

        // read form values
        var username = usernameInput.value;
        var firstName = firstNameInput.value;
        var lastName = lastNameInput.value;
        var email = emailInput.value;
        var phone = phoneInput.value;
        var password = passwordInput.value;
        var confirmPw = confirmInput.value;

        // make sure all required fields are filled
        if(!username|| !firstName || !lastName || !email || !phone){
            alert("Please fill in all required fields before submitting.");
            return;
        }

        // check email format
        var emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if(!emailPattern.test(email)){
            alert("Please enter a valid email address");
            return;
        }

        // check phone format
        var phonePattern = /^[0-9]{10}$/;
        if(!phonePattern.test(phone)){
            alert("Please enter a valid 10 digit phone number");
            return;
        }

        // password change is optional
        if(password || confirmPw){
            // both must be filled
            if(!password || !confirmPw){
                alert("Please fill in both password fields or leave both empty");
                return;
            }

            // check if matches
            if(password !== confirmPw){
                alert("New password and Confirmation password do not match");
                return;
            }
        }

        // Prepare updated profile
        var updatedProfile = {
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone
        };

        // Include password if user wants to change it
        if(password && confirmPw){
            updatedProfile.password = password;
        }

        // Save to users.json
        var saveSuccess = await saveProfileToJSON(updatedProfile, currentUser.userType);

        if(saveSuccess){
            // Update sessionStorage with new info
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: updatedProfile.username,
                userType: currentUser.userType,
                firstName: updatedProfile.firstName,
                lastName: updatedProfile.lastName,
                email: updatedProfile.email,
                phone: updatedProfile.phone
            }));

            alert("Profile updated successfully!");
            // go back to main page
            window.location.href = "mainPage.html";
        } else {
            alert("Failed to save profile. Please try again.");
        }
    });
};

// Function to save profile changes to users.json
async function saveProfileToJSON(profileData, userType) {
    try {
        // Call backend API to update user
        const response = await fetch(`http://localhost:8000/api/users/${profileData.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone,
                password: profileData.password, // will be undefined if not changing
                userType: userType
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('Profile updated successfully:', data);
            return true;
        } else {
            console.error('Failed to update profile:', data.error);
            return false;
        }

    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error connecting to server. Please try again later.');
        return false;
    }
}
