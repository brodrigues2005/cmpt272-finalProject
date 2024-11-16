
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
        document.getElementById('reportForm').reset();
        window.location.href = 'map.html'; // Redirect to map after editing or adding

    } catch (error) {
        console.error('Error fetching location:', error);
        alert('An error occurred while fetching the location.');
    }
});

const mapContainer = document.getElementById('mapid');
let markers = {}; // To store markers by report ID
if (mapContainer) {
    var map = L.map('mapid').setView([49.2, -122.8], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

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


function displayMoreInfo(report) {
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
        <div class="info-modal-content">
            <span class="close-modal">&times;</span>
            <h3>Report Details</h3>
            <p><strong>Name:</strong> ${report.name}</p>
            <p><strong>Phone:</strong> ${report.phone}</p>
            <p><strong>Type:</strong> ${report.emergencyType}</p>
            <p><strong>Location:</strong> ${report.location}</p>
            <p><strong>Status:</strong> ${report.status}</p>
            <p><strong>Time:</strong> ${report.timestamp}</p>
            <p><strong>Comments:</strong> ${report.comments || "N/A"}</p>
            ${report.pictureUrl ? `<img src="${report.pictureUrl}" alt="Report Image" class="report-image">` : ''}
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal on click
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
}

// Load existing report data for editing
window.addEventListener('load', () => {
    const editReportId = localStorage.getItem('editReportId');
    if (editReportId) {
        const reports = JSON.parse(localStorage.getItem('reports'));
        const reportToEdit = reports.find(report => report.id === parseInt(editReportId, 10));

        if (reportToEdit) {
            document.getElementById('name').value = reportToEdit.name;
            document.getElementById('phone').value = reportToEdit.phone;
            document.getElementById('emergencyType').value = reportToEdit.emergencyType;
            document.getElementById('location').value = reportToEdit.location;
            document.getElementById('pictureUrl').value = reportToEdit.pictureUrl;
            document.getElementById('comments').value = reportToEdit.comments;
        }
    }
});
