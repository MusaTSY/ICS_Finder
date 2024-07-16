//document.getElementById('address-form'): This retrieves the HTML element with the id 'address-form'. It's assuming there's an HTML form element in the document with this id.//
//.addEventListener('submit', function(event) {: This attaches an event listener to the form element for the 'submit' event. When the form is submitted, the function specified as the second argument will be executed. The event parameter represents the event object.

document.getElementById('address-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const address = document.getElementById('address').value;// This retrieves the value entered in an input field with the id 'address' and assigns it to the variable address.
    fetch('/get-coordinates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'address': address
        })
    })
//headers: { 'Content-Type': 'application/x-www-form-urlencoded' }: Sets the request header to indicate that the request body contains URL-encoded form data.
//body: new URLSearchParams({ 'address': address }): Converts the address value into a URL-encoded form and sends it as the body of the request
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('result').textContent = data.error;
        } else {
            document.getElementById('result').textContent = `Latitude: ${data.lat}, Longitude: ${data.lng}`;
            initMap(data.lat, data.lng); // Update the map with the new coordinates
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function initMap(lat = 40.7127753, lng= -74.0059728) {
    // Create a map object and specify the DOM element for display.
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: lng }, // Center the map with the provided coordinates
        zoom: 13, // The initial zoom level
        mapId: '4fceef255fc1a774'
    });

    // Add a marker to the map.
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng }, // The latitude and longitude for the marker
        map: map, // The map object to add the marker to
        title: "Location", // Tooltip text
    });
}
document.getElementById('getLocationBtn').addEventListener('click', function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // Display or use the coordinates
            document.getElementById('result').textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
            initMap(latitude, longitude); 
            
        }, function(error) {
            console.error("Error getting geolocation:", error);
            document.getElementById('result').textContent = 'Error getting geolocation.';
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        document.getElementById('result').textContent = 'Geolocation is not supported by this browser.';
    }
});