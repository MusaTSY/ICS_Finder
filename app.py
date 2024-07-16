from flask import Flask, render_template, request, jsonify
import pip._vendor.requests as requests

app = Flask(__name__)
googleAPI_KEY = 'AIzaSyDBfP1dUfUoR2G316xfHDmUTStk_FtJ53I'

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/get-coordinates', methods=['POST'])
def get_coordinates():
    address = request.form.get('address')
    if not address:
        return jsonify({'error': 'No address provided'}), 400

    response = long_lat(address)
    return jsonify(response)

def long_lat(address):
    url = f'https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(address)}&key={googleAPI_KEY}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            location = data['results'][0]['geometry']['location']
            return {'lat': location['lat'], 'lng': location['lng']}
        else:
            return {'error': data.get('status', 'Unknown error')}
    else:
        return {'error': f'Failed to connect to Google Maps API, status code {response.status_code}'}

if __name__ == '__main__':
    app.run(debug=True)
"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geolocation Example</title>
    <!-- Include any CSS or JS files needed -->
</head>
<body>
    <h1>Geolocation Example</h1>

    <button id="getLocationBtn">Get My Location</button>
    
    <p id="locationResult"></p>

    <script>
        document.getElementById('getLocationBtn').addEventListener('click', function() {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // Display or use the coordinates
                    document.getElementById('locationResult').textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
                    
                    // Example: Send coordinates to Flask backend using fetch
                    fetch('/process-location', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ latitude: latitude, longitude: longitude })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Response from Flask:', data);
                        // Handle response from Flask if needed
                    })
                    .catch(error => {
                        console.error('Error sending location to Flask:', error);
                    });

                }, function(error) {
                    console.error("Error getting geolocation:", error);
                    document.getElementById('locationResult').textContent = 'Error getting geolocation.';
                });
            } else {
                console.log("Geolocation is not supported by this browser.");
                document.getElementById('locationResult').textContent = 'Geolocation is not supported by this browser.';
            }
        });
    </script>
</body>
</html>
"""