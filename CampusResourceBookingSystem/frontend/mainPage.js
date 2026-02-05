// store bookings in Local Storage
var BOOKINGS_KEY = "studentBookings";

// base URL for backend API
var API_BASE = "http://localhost:8000";

// array that will hold all bookings in memory
var bookings = [];

// load existing bookings from local storage
function loadBookings(){
    var stored = localStorage.getItem(BOOKINGS_KEY);

    if(stored){
        // convert JSON string to JavaScript array
        bookings = JSON.parse(stored);
    }
    else{
        // if nothing saved yet, return empty list
        bookings =[];
    }
}

// saved updated booking list into local Storage
function saveBookings(){
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

//  function chekcs if booking date is in the past
function isPastBooking(booking){
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth()+1// 1-12
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

    var todayString = year + "-"+ month + "-" + day;

    // if booking date before today, set to past
    if(booking.date < todayString){
        return true;
    }

    // if booking date is today, check end time
    if(booking.date ===todayString){
        var currentHour = today.getHours();
        var currentMinute = today.getMinutes();
        var currentTimeInMinutes = currentHour*60 + currentMinute;

        var endParts = booking.end.split(":");
        var endHour = parseInt(endParts[0]);
        var endMinutes = parseInt(endParts[1]);
        var endTimeInMinutes = endHour*60 + endMinutes;

        // if end time has passed, booking is past 
        if(endTimeInMinutes < currentTimeInMinutes){
            return true;
        }
    }
    return false;
}

// display all bookings as rows inside table body
function renderBookings(){
    var tbody = document.getElementById("booking-body");

    // remove any old rows from table
    tbody.innerHTML = "";

    // update status past future for each booking
    for(let k=0; k< bookings.length; k++){
        if(isPastBooking(bookings[k])){
            bookings[k].status = "Past";
        }
        else{
            bookings[k].status = "Future";
        }
    }

    // save updated status 
    saveBookings();

    //if no bookings 
    if(bookings.length ===0){
        var emptyRow = document.createElement("tr");
        emptyRow.innerHTML = '<td colspan=5> No Bookings yet</td>';
        tbody.appendChild(emptyRow);
        return
    }

    // loop through each booking, create row for each one
    for(let i = 0; i< bookings.length; i++){
        let b = bookings[i];
        let row = document.createElement("tr");

        // build HTML for the row
        var html = "";

        // resource column
        html += "<td>" + b.resource + "</td>";

        // date column 
        html += "<td>" + b.date + "</td>";

        // time column
        html += "<td>" + b.start + " - " + b.end + "</td>";

        // status column
        html += "<td>" + b.status + "</td>";

        // disable checkbox for past bookings
        if(b.status ==="Past"){
            html += '<td> <input type="checkbox" disabled> </td>';
        }
        else{// can be selected for cancel
            html += '<td> <input type = "checkbox" class="select-booking" data-id="' + b.id + '"></td>';
        }

        // put html in row and add it to table
        row.innerHTML = html;
        tbody.appendChild(row);
    }
}

// remove bookings function
function setupCancelButton(){
    var btn = document.getElementById("cancel-selected");

    // when button clicked
    btn.addEventListener("click", function(){
        // confirm before cancelling
        var confirmDelete = confirm("Are you sure you want to cancel the selected bookings?");
        if(!confirmDelete){
            return;// user clicked cance;
        }


        // get all checkboxes
        var checkboxes = document.getElementsByClassName("select-booking");
        var idsToRemove = [];
        var bookingsToCancel = [];

        // go through all checkboxes and collect ids
        for(let i=0; i< checkboxes.length; i++){
            if(checkboxes[i].checked){
                let idStr = checkboxes[i].getAttribute("data-id");
                let idNum = parseInt(idStr);
                idsToRemove.push(idNum);

                // find booking object
                for(let j=0; j< bookings.length; j++){
                    if(bookings[j].id ===idNum){
                        bookingsToCancel.push(bookings[j]);
                        break;
                    }
                }
            }
        }

        // if nothing selected
        if(idsToRemove.length===0){
            alert("Please select at least one booking to cancel.");
            return;
        }

        // send cancellation to backend for each booking
        // collect server-side operations (resource PUT, request DELETE) then apply local changes
        var serverPromises = [];
        for(let m=0; m< bookingsToCancel.length; m++){
            (function(booking){
                 var resource = booking.resource;
                 var endpoint = "";

                // figure out which endpoint based on resource type
                if(resource.includes("Lab")){
                    endpoint = "/admin/labs";
                }
                else if(resource.includes("Room")){
                    endpoint = "/admin/rooms";
                }
                else if(resource.includes("Equipment")){
                    endpoint = "/admin/equipment";
                }

                // send PUT request to mark resource as available again
                var putPromise = fetch(API_BASE + endpoint, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: booking.resourceId,
                        available: true
                    })
                }).then(function(res){ return res.json(); })
                .then(function(data){
                    console.log("Resource marked available:", data);
                }).catch(function(err){
                    console.error("Error marking resource available:", err);
                });

                serverPromises.push(putPromise);

                // if we have a backend request id, delete the request from the server
                if(booking.requestId && !isNaN(Number(booking.requestId))){
                    var delPromise = fetch(API_BASE + "/api/requests", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: Number(booking.requestId) })
                    }).then(function(res){ return res.json(); })
                    .then(function(data){
                        console.log("Request deleted on server:", data);
                    }).catch(function(err){
                        console.error("Error deleting request on server:", err);
                    });

                    serverPromises.push(delPromise);
                } else {
                    // no requestId available; log that server-side delete cannot be performed
                    console.warn('No server requestId for booking, skipping server delete for', booking);
                }
            })(bookingsToCancel[m]);
        }

        // wait for all server operations to finish (best-effort) before updating local UI
        Promise.all(serverPromises).then(function(){
            // build new list of bookings without ones we want to remove
            let newList = [];
            for(let j=0; j< bookings.length; j++){
                let currentBooking = bookings[j];

                // never cancel past bookings
                if(currentBooking.status === "Past"){
                    newList.push(currentBooking);
                    continue;
                }

                let keep = true;
                // check if this booking's id is in idsToRemove
                for(let k=0; k< idsToRemove.length; k++){
                    if(currentBooking.id === idsToRemove[k]){
                        keep = false; // do not keep
                    }
                }

                // if we can keep booking, send to new List
                if(keep) {
                    newList.push(currentBooking);
                }
            }

            // replace old bookings list with new one
            bookings = newList;

            // save updated list to local storage
            saveBookings();

            // refresh tablle to show changes
            renderBookings();
        }).catch(function(err){
            console.error('Error during server cancellation operations:', err);
            // Even if server ops failed, still update local UI to remove cancelled items to keep UX responsive
            let fallbackList = [];
            for(let j=0; j< bookings.length; j++){
                let currentBooking = bookings[j];
                if(currentBooking.status === "Past"){
                    fallbackList.push(currentBooking);
                    continue;
                }
                let keep = true;
                for(let k=0; k< idsToRemove.length; k++){
                    if(currentBooking.id === idsToRemove[k]){
                        keep = false;
                    }
                }
                if(keep) fallbackList.push(currentBooking);
            }
            bookings = fallbackList;
            saveBookings();
            renderBookings();
            alert('Some server-side cancellations failed. Check console for details.');
        });
    })
}

// function to load user's name
function loadUserName(){
    var currentUserStr = sessionStorage.getItem('currentUser');

    var currentUser = JSON.parse(currentUserStr);
    var username = currentUser.username;

    fetch(API_BASE + "/api/users/" + username)
    .then(function(res){ return res.json();})
    .then(function(userData){
        // update header with users first name
        var header = document.querySelector("header h1");
        header.textContent = "Welcome " + userData.firstName + "!";

        // update session storage with fresh data in case name was edited
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
    })
    .catch(function(err){
        console.error("Error loading user data:", err);
        // fallback to whatever name we have
        var header = document.querySelector("header h1");
            header.textContent = "Welcome " + currentUser.firstName + "!"; 
    });
}

// run when page loads
window.onload = function(){
    loadUserName();
    loadBookings();
    renderBookings();
    setupCancelButton();
}