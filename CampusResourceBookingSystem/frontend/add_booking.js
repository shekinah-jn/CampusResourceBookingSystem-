// store bookings in Local Storage
var BOOKINGS_KEY = "studentBookings";

// base URL for backend API
var API_BASE = "http://localhost:8000";

// load existing bookings from local storage
function loadBookingForAdd(){
    var stored = localStorage.getItem(BOOKINGS_KEY);

    if(stored){
        // convert JSON string to JavaScript array
        return JSON.parse(stored); 
    } 
    else{
        // if nothing saved yet, return empty list
        return [];
    }
}

// saved updated booking list into local Storage
function saveBookingForAdd(arr){
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(arr));
}

// helper method to avoid end time being before start time
function timeToMinutes(timeStr){
    var parts = timeStr.split(":");// will split between hours and minutes ["hour", "minutes"]
    var hours = parseInt(parts[0]); // string to int
    var minutes = parseInt(parts[1]); // string to int
    return hours*60 + minutes // convert to minutes 
}

// load available resources based on selected category
function loadResourcesByCategory(category){
    var resourceSelect = document.getElementById("resource");

    // keep default option
    resourceSelect.innerHTML = '<option value="" disabled selected> Select a resource</option>';

    var endpoint = "";

    // figure out which endpoint to 
    if(category ==="labs"){
        endpoint = "/admin/labs";
    }
    else if(category ==="rooms"){
        endpoint = "/admin/rooms";
    }
    else if(category ==="equipment"){
        endpoint="/admin/equipment";
    }


    // fetch from backend
    fetch(API_BASE + endpoint)
    .then(function(res){return res.json();})// convert backend response into JS array
    .then(function(items){
        // reset dropdown
        resourceSelect.innerHTML = '<option value="" disabled selected>Select a resource</option>';
        // loop through all items and add all of them
        for(var i = 0; i< items.length; i++){
            var item = items[i];
            var opt = document.createElement("option");// create option tag for each
           
            // format value and text
            if(category === "labs"){
                opt.value = "Lab: " + item.name;
                opt.textContent = item.name + " (" + item.location + ")";
                opt.setAttribute("data-id", item.id);
            }
            else if (category === "rooms"){
                opt.value = "Room: " + item.name;
                opt.textContent = item.name + " (" + item.location + ")";
                opt.setAttribute("data-id", item.id);
            }
            else if(category === "equipment"){
                opt.value = "Equipment: " + item.name;
                opt.textContent = item.name + " (" + item.location + ")";
                opt.setAttribute("data-id", item.id);
            }

            // if not available, disable
            if(item.available === 0 || item.available === false){
                opt.disabled = true;
                opt.className = "unavailable";
                opt.textContent = opt.textContent + " - UNAVAILABLE";
            }

            resourceSelect.appendChild(opt);
        }

        // if no items found at all 
        if(resourceSelect.options.length ===1){
            resourceSelect.innerHTML = '<option value"" disabled selected> No resources found</option>';
        }
    })// handle error 
    .catch(function(err){
        console.error("Error loading labs:", err);
        resourceSelect.innerHTML = '<option value"" disabled selected> Error loading resources </option>';
    });
}

// runs after page is fully loaded
window.onload = function() {

    // set minimum date to today
    var dateInput = document.getElementById("date");
    var today = new Date();

    var year = today.getFullYear();
    var month = today.getMonth() + 1;// 1-12
    var day = today.getDate();
    
    // format date and month to always have 2 digits
    if(month <10){
        month ="0" + month;
    }
    else{
        month = "" + month // turn nbr into string
    }

    if(day<10){
        day = "0" + day;
    }
    else{
        day = "" + day// turn nbr into string
    }
    var todayString = year + "-" + month + "-" + day; // final string
    dateInput.min = todayString; //set min allowed to current date


    // when category changes, load resources for that category
    var categorySelect = document.getElementById("category");
    categorySelect.onchange =function(){
        var category = categorySelect.value;
        loadResourcesByCategory(category);
    }

    // get submit button
    var submitLink = document.getElementById("submit-booking");

    // add click event to submit button
    submitLink.addEventListener("click", function(event){
        event.preventDefault();// stop browser from going to main page directly, save data first
    
        // read values from form
        var category = document.getElementById("category").value;
        var resource = document.getElementById("resource").value;
        var date = document.getElementById("date").value;
        var start = document.getElementById("start").value;
        var end = document.getElementById("end").value;
    
        // simple validation to make sure fields are not empty
        if(!category || !resource || !date || !start || !end){
            alert("Please fill in all fields before submitting.");
            return;
        }

        // extra check user can;t chose date before today
        if(date < todayString){
            alert("You cannot select a date in the past.")
            return;
        }

        // check if booking time is in the past when tade it today
        if(date === todayString){
            var now = new Date();
            var currentHour = now.getHours();
            var currentMinutes = now.getMinutes();
            var currentTimeInMinutes = currentHour *60 + currentMinutes;

            var startMinutesToday = timeToMinutes(start);

            if(startMinutesToday <= currentTimeInMinutes){
                alert("You cannot book a time that has already passed today");
                return;
            }
        }

        // convert start and end time string
        var startMinutesVal = timeToMinutes(start);
        var endMinutes = timeToMinutes(end);

        if(endMinutes <= startMinutesVal){
            alert("End time must be after start time");
            return;
        }

        var resourceSelect = document.getElementById("resource");
        var selectedOption = resourceSelect.options[resourceSelect.selectedIndex];
        var resourceId = selectedOption.getAttribute("data-id");

        // validate resourceId
        if(!resourceId || isNaN(Number(resourceId))){
            alert('Selected resource is invalid. Please choose a different resource.');
            return;
        }

        // load existing bookings
        var bookings = loadBookingForAdd();

        // get current logged-in user from sessionStorage
        var storedUser = sessionStorage.getItem('currentUser');
        if(!storedUser){
            alert('You must be logged in to make a booking. Please log in first.');
            window.location.href = '../login_page.html';
            return;
        }
        var currentUser = JSON.parse(storedUser);
        var username = currentUser.username;

        // create new booking object for local UI storage
        var newBooking = {
            id: new Date().getTime(),
            resource: resource,
            date: date,
            start: start, 
            end: end,
            status: "Future", // new bookings are future
            resourceId: resourceId,
            username: username
        };

        // POST a booking request to the server for all resource types
        fetch(API_BASE + "/api/requests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                resource_id: Number(resourceId),
                username: username
            })
        })
        .then(function(res){
            if(!res.ok){
                return res.json().then(function(err){ throw err; });
            }
            return res.json();
        })
        .then(function(data){
            console.log("Request created:", data);

            // attach backend request id to local booking (if provided)
            if (data && data.id) {
                newBooking.requestId = data.id;
            } else {
                // server didn't return insert id; still proceed but cancellation will not remove server-side request
                newBooking.requestId = null;
            }
+
            // add new booking to the list (local UI storage)
            bookings.push(newBooking);
            saveBookingForAdd(bookings);

            alert("Booking request submitted!");
            window.location.href = "mainPage.html";
        })
        .catch(function(err){
            console.error("Error creating booking request:", err);
            alert("Failed to submit booking request. Please try again.");
        });


    });
};