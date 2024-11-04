document.getElementById('reportForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const locationInput = document.getElementById('location').value.trim();
    if (!locationInput) {
        alert('Please enter a location.');
        return;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`);
        const data = await response.json();

        if (data.length === 0) {
            alert('Location not found. Please enter a valid location.');
            return;
        }

        // Get latitude and longitude from the API response
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);

        const report = {
            id: Date.now(),
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            emergencyType: document.getElementById('emergencyType').value,
            location: locationInput,
            latitude: latitude,
            longitude: longitude,
            pictureUrl: document.getElementById('pictureUrl').value,
            comments: document.getElementById('comments').value,
            timestamp: new Date().toLocaleString(),
            status: 'OPEN'
        };

        let reports = JSON.parse(localStorage.getItem('reports')) || [];
        reports.push(report);
        localStorage.setItem('reports', JSON.stringify(reports));

        alert('Report submitted successfully!');
        document.getElementById('reportForm').reset();

        // Add a marker to the map
        if (mapContainer) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`
                <strong>${report.emergencyType}</strong><br>
                Location: ${report.location}<br>
                Status: ${report.status}
            `);
            map.setView([latitude, longitude], 13); // Center the map on the new location
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        alert('An error occurred while fetching the location.');
    }
});

const mapContainer = document.getElementById('mapid');
if (mapContainer) {
    var map = L.map('mapid').setView([49.2, -122.8], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Locate and center map on the user's current location
   

    // Event handler for successful location detection
    map.on('locationfound', function (e) {
        const radius = e.accuracy / 2; // The accuracy of the location in meters

        // Add a marker at the user's location
        L.marker(e.latlng).addTo(map)
            .bindPopup(`You are within ${radius.toFixed(0)} meters from this point.`)
            .openPopup();

        // Add a circle around the location to show accuracy
        L.circle(e.latlng, radius).addTo(map);
    });

    // Event handler for location errors
    map.on('locationerror', function (e) {
        alert('Location access denied or unavailable.');
    });

    function loadReports(filterType = 'all') {
        const reports = JSON.parse(localStorage.getItem('reports')) || [];
        document.getElementById('reportList').innerHTML = '';
        reports.filter(report => filterType === 'all' || report.emergencyType === filterType).forEach(report => {
            if (report.latitude && report.longitude) {
                const marker = L.marker([report.latitude, report.longitude]).addTo(map);
                marker.bindPopup(`
                    <strong>${report.emergencyType}</strong><br>
                    Location: ${report.location}<br>
                    Status: ${report.status}
                `);
            }

            const listItem = document.createElement('li');
            listItem.className = 'report-item';
            listItem.innerHTML = `
                <strong>Type:</strong> ${report.emergencyType}<br>
                <strong>Location:</strong> ${report.location}<br>
                <strong>Status:</strong> ${report.status}<br>
                <strong>Time:</strong> ${report.timestamp}<br>
            `;
            document.getElementById('reportList').appendChild(listItem);
        });
    }

    function filterReports() {
        const filterType = document.getElementById('filterType').value;
        loadReports(filterType);
    }

    loadReports();
}
//localStorage.clear(); use this to clear the location from the storage