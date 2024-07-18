from flask import Flask, render_template, request, jsonify
import pip._vendor.requests as requests

app = Flask(__name__)
googleAPI_KEY = 'AIzaSyDBfP1dUfUoR2G316xfHDmUTStk_FtJ53I'

@app.route('/')
def index():
    return render_template("index.html")

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

@app.route('/get-icf-details', methods=['POST'])
def get_icf_details():
    address = request.form.get('address')
    if address:
        response = long_lat(address)
        return jsonify(response)

    try:
        data = request.get_json()
        if data:
            lat = data.get('latitude')
            lon = data.get('longitude')
            maxPrice = data.get('maxprice')
            rating = data.get('rating')
            Ice_cream_type = data.get('Ice_cream_type')
            OpenNow = data.get('OpenNow')
            print(type(Ice_cream_type))

            print(lat,lon,maxPrice,rating,Ice_cream_type,OpenNow)
            # Parameters for the Google Places API request
            params = {
            'location': f'{lat},{lon}',
            'radius': 10,  # Search radius in meters
            'query': f'ice cream {Ice_cream_type}',  # Text search query including dynamic input
            'key': googleAPI_KEY,
            }

            if maxPrice:
                params['maxprice'] = int(maxPrice)
            if OpenNow:
                params['opennow'] = OpenNow
            

            # Make the request to the Google Places API
            response = requests.get('https://maps.googleapis.com/maps/api/place/textsearch/json', params=params)
                    
            if response.status_code != 200:
                return jsonify({'error': 'Failed to fetch data from Google Places API'}), 500

            # Parse the response
            data = response.json()
            ice_cream_shops = data.get('results', [])

            if rating:
                rating = float(rating)
                filtered_results = [shop for shop in ice_cream_shops if shop.get('rating', 0) >= rating]
            else:
                filtered_results = ice_cream_shops

            return jsonify({'ice_cream_shops': filtered_results})

        else:
            return jsonify({'error': 'No JSON data received'}), 400

    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
