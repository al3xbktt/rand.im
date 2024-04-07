// profileFunctions.js

function fetchUsernames() {
    $.ajax({
        url: "/api/usernames", // Endpoint to fetch usernames from the server
        type: "GET",
        success: function(response) {
            // Once usernames are fetched successfully, update the list on the webpage
            updateProfileList(response.usernames);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

function updateProfileList(usernames) {
    // Clear existing list
    $("#userList").empty();
    // Add each username to the list
    usernames.forEach(function(username, index) {
        $("#userList").append(`<li class="list-group-item border-0 rounded">${index + 1}. ${username}</li>`);
    });
}

// Call fetchUsernames function when the document is ready
$(document).ready(function() {
    fetchUsernames();
});
