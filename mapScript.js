// Initialize the map
document.addEventListener("DOMContentLoaded", function () {
    // Set map center to Metro Vancouver and zoom level
    const map = L.map('map').setView([49.2827, -123.1207], 10);

    // Set up OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Placeholder for reported emergencies
    const emergencyReports = [
        {
            name: "Fire Incident",
            location: "Downtown Vancouver",
            coords: [49.2827, -123.1207],
            description: "Fire at a residential building."
        },
        {
            name: "Medical Emergency",
            location: "Burnaby",
            coords: [49.2488, -122.9805],
            description: "Medical assistance required."
        }
    ];

    // Add markers for each report
    emergencyReports.forEach(report => {
        const marker = L.marker(report.coords).addTo(map);
        marker.bindPopup(`<strong>${report.name}</strong><br>${report.location}<br>${report.description}`);
    });

    const form = document.getElementById("emergency-form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get values from form
        const name = document.getElementById("reporting-name").value;
        const emergencyType = document.getElementById("emergency-type").value;
        const location = document.getElementById("location").value;
        const latitude = parseFloat(document.getElementById("latitude").value);
        const longitude = parseFloat(document.getElementById("longitude").value);

        // Check if coordinates are valid
        if (!isNaN(latitude) && !isNaN(longitude)) {
            const newReport = {
                name: emergencyType,
                location: location,
                coords: [latitude, longitude],
                description: `Reported by ${name}`
            };

            const newMarker = L.marker(newReport.coords).addTo(map);
            newMarker.bindPopup(`<strong>${newReport.name}</strong><br>${newReport.location}<br>${newReport.description}`);

            form.reset();
        } else {
            alert("Please enter valid latitude and longitude coordinates.");
        }
    });
});