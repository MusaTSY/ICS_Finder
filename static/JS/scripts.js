let map;
let markers = [];
let currentLocationMarker;
let currentInfoWindow = null;
let currentLocationImage="static/Image/map_marker_2.png"


// Function to initialize the map with provided coordinates
function initMap(lat =40.709343434451945, lng = -74.00235215927385) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: lng },
        zoom: 15,
        mapId: '4fceef255fc1a774',
        fullscreenControl: false
    });

    //Only for Current Location 
    currentLocationMarker = new google.maps.Marker({
        map: map,
        icon: {
            url: currentLocationImage, // Customize the icon for current location
            scaledSize: new google.maps.Size(38, 38)
        },
        animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
        content: "You're Here"
    });

    currentLocationMarker.addListener("click", () => {

        if (currentInfoWindow) {
            currentInfoWindow.close();
        }
        infoWindow.open(currentLocationMarker.getMap(), currentLocationMarker);
        currentInfoWindow = infoWindow;
    });
    
    // this is for Default 
    addMarker({ lat: lat, lng: lng }, "New York", currentLocationImage);
    
}
// Function to update the marker for current location
function updateCurrentLocationMarker(lat, lng) {
    currentLocationMarker.setPosition({ lat: lat, lng: lng });
    currentLocationMarker.setVisible(true); 
}

// Function to add a marker for the IceCreamShops
function addMarker(position, title, iconUrl) {
        const marker = new google.maps.Marker({
        position: position, // via lon_lat
        map: map,
        title: title,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(38, 31)
        },
        animation: google.maps.Animation.DROP
    });
    

    const infoWindow = new google.maps.InfoWindow({
        content: title
    });

    marker.addListener("click", () => {
        if (currentInfoWindow) {
            currentInfoWindow.close();
        }
        // Open the new infoWindow
        infoWindow.open(marker.getMap(), marker);
        // Update the currentInfoWindow to the newly opened infoWindow
        currentInfoWindow = infoWindow;
    });

    markers.push(marker); // Push marker to array to keep track

  
}

// Function to clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => {
        marker.setMap(null); // Remove marker from map
    });
    markers = []; 
}

// Event listener for geolocation form submission
document.getElementById('ICF-details-form').addEventListener('submit', function(event) {
    event.preventDefault();
    //used by specified address and non specified address
    const maxPrice = document.getElementById('budget').value;
    const OpenNow = document.getElementById('OpenNow').checked;
    const ratings = document.getElementById('rating').value;
    const Ice_cream_type = document.getElementById('icecreamflavor').value.trim();

    const address = document.getElementById('address').value;
    if (address){
        fetch('/get-icf-details', { //fetching /get-coord from flask 
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ 'address': address })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('result').textContent = data.error;
            } else {
                document.getElementById('result').textContent = `Latitude: ${data.lat}, Longitude: ${data.lng}`; //Not Needed in final 
                initMap(data.lat, data.lng);
                updateCurrentLocationMarker(data.lat, data.lng); 
                fetchIceCreamShops(data.lat, data.lng, maxPrice, OpenNow,ratings,Ice_cream_type); 
                
                
            }
        });}
    else{
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
            

                document.getElementById('result').textContent = `Latitude: ${latitude}, Longitude: ${longitude}, Maxprice: ${maxPrice}`;//Not Needed in final 
                initMap(latitude, longitude);
                updateCurrentLocationMarker(latitude, longitude);
                fetchIceCreamShops(latitude, longitude, maxPrice,OpenNow,ratings,Ice_cream_type)//fetchesthe information from the flask backend
                console.log(ratings,"    ",OpenNow,"    ",Ice_cream_type)

            }, function(error) {
                console.error("Error getting geolocation:", error);
                document.getElementById('result').textContent = 'Error getting geolocation.';
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            document.getElementById('result').textContent = 'Geolocation is not supported by this browser.';
        }
}
    
});

// Function to fetch ice cream shops from backend
function fetchIceCreamShops(latitude, longitude, maxPrice, OpenNow, ratings, Ice_cream_type) {

    OpenNow = OpenNow ? true : false;

    console.log(ratings,"    ",OpenNow,"    ",Ice_cream_type)
    fetch('/get-icf-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            latitude: latitude, 
            longitude: longitude,
            maxprice: maxPrice, 
            rating: ratings, OpenNow: OpenNow,
            Ice_cream_type: Ice_cream_type 
        })
    })
    .then(response => response.json())
    .then(data => { 
        if (data.error) {
            document.getElementById('result').textContent = data.error;
        } else {
            const iceCreamShops = data.ice_cream_shops; // returns an array ice_cream_shops
            document.getElementById('result').textContent = `Found ${iceCreamShops.length} ice cream shops`;
            console.log(iceCreamShops);
            clearMarkers(); // Clear existing markers

            iceCreamShops.forEach(shop => {
                const shopLatLng = { lat: shop.geometry.location.lat, lng: shop.geometry.location.lng };
                addMarker(shopLatLng, shop.name, 'static/Image/ice_cream.png'); // this gets called after the addmaker in initmap making that one redundant and it's only for for intial 
            });
        }
    })
    .catch(error => {
        console.error('Error fetching ice cream shops:', error);
        document.getElementById('result').textContent = 'Error fetching ice cream shops';
    });
}
