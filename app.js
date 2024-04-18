const myMap = {
    coordinates: [],
    businesses: [],
    map: null,
    markers: [],

    buildMap() {
        this.map = L.map('map').setView(this.coordinates, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(this.map);

        const marker = L.marker(this.coordinates);
        marker.addTo(this.map).bindPopup('You are here!').openPopup();
    },

    addMarkers() {
        this.markers.forEach(marker => marker.remove()); // Remove previous markers
        this.businesses.forEach(business => {
            const marker = L.marker([business.lat, business.long])
                .bindPopup(business.name);
            marker.addTo(this.map);
            this.markers.push(marker);
        });
    },
};

async function getCoords() {
    const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return [pos.coords.latitude, pos.coords.longitude];
}

async function getFoursquare(businessType) {
    // replace 'API_KEY' with actual Foursquare API key.
    const clientId = 'API_KEY';
    const limit = 5;
    const response = await fetch(`https://api.foursquare.com/v2/venues/search?client_id=${clientId}&v=20180323&limit=${limit}&ll=${myMap.coordinates.join(',')}&query=${businessType}`);
    const data = await response.json();
    return data.response.venues;
}

function processBusinesses(venues) {
    return venues.map(venue => {
        return {
            name: venue.name,
            lat: venue.location.lat,
            long: venue.location.lng
        };
    });
}

window.onload = async () => {
    myMap.coordinates = await getCoords();
    myMap.buildMap();
};

document.getElementById('business-form').addEventListener('submit', async event => {
    event.preventDefault();
    const businessType = document.getElementById('business-type').value;
    const venues = await getFoursquare(businessType);
    myMap.businesses = processBusinesses(venues);
    myMap.addMarkers();
