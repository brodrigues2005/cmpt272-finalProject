
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

        let reports = JSON.parse(localStorage.getItem('reports')) || [];
        const editReportId = localStorage.getItem('editReportId');
        
        if (editReportId) {
            const reportIndex = reports.findIndex(report => report.id === parseInt(editReportId, 10));
            if (reportIndex > -1) {
                reports[reportIndex] = {
                    ...reports[reportIndex],
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    emergencyType: document.getElementById('emergencyType').value,
                    location: locationInput,
                    latitude: latitude,
                    longitude: longitude,
                    pictureUrl: document.getElementById('pictureUrl').value,
                    comments: document.getElementById('comments').value,
                    timestamp: new Date().toLocaleString(),
                    status: 'UPDATED'
                };
                
                alert('Report updated successfully!');
                localStorage.removeItem('editReportId');
            }
        } else {
            const newReport = {
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
            reports.push(newReport);
            alert('Report submitted successfully!');
        }

        localStorage.setItem('reports', JSON.stringify(reports));
        document.getElementById('reportForm').reset();
        window.location.href = 'map.html';

    } catch (error) {
        console.error('Error fetching location:', error);
        alert('An error occurred while fetching the location.');
    }
});

const redIcon = L.icon({
    iconUrl: 'red-marker-icon.png', // Path to the red marker icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    // iconSize: [25,41],
    // iconAnchor: [12,41],
    // popupAnchor: [1,-34],
})

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

        for (let id in markers) {
            map.removeLayer(markers[id]);
        }
        markers = {};

        reports
            .filter(report => filterType === 'all' || report.emergencyType === filterType)
            .forEach(report => {
                if (report.latitude && report.longitude) {
                    const marker = L.marker([report.latitude, report.longitude]).addTo(map);
                    // marker.bindPopup(`
                    //     <strong>${report.emergencyType}</strong><br>
                    //     Location: ${report.location}<br>
                    //     Status: ${report.status}
                    // `);
                    marker.addEventListener('click',()=>{
                        displayMoreInfo(report);
                        markers[report.id].setIcon(redIcon);
                    }
                    );
                    markers[report.id] = marker;
                }

                const listItem = document.createElement('li');
                listItem.className = 'report-item';
                listItem.innerHTML = `
                    <strong>Type:</strong> ${report.emergencyType}<br>
                    <strong>Location:</strong> ${report.location}<br>
                    <strong>Status:</strong> ${report.status}
                    <input type="checkbox" class="status-checkbox" ${report.status === 'RESOLVED' ? 'checked' : ''}>
                    <br>
                    <strong>Time:</strong> ${report.timestamp}<br>
                    <button class="edit-btn">Edit Entry</button>
                    <button class="delete-btn">Delete Entry</button>
                    <button class="more-info-btn">More Info</button>
                `;

                listItem.querySelector('.status-checkbox').addEventListener('change', async (e) => {
                    if (e.target.checked) {
                        const userEntry = prompt("You are about to change the status to 'RESOLVED'. Please enter the password:");
                        const storedPasscode = localStorage.getItem("PASSCODE");

                        const isEqual = await comparePascodes(storedPasscode, userEntry, "RESOLVE");
                        if (isEqual) {
                            report.status = 'RESOLVED';
                            localStorage.setItem('reports', JSON.stringify(reports));
                            loadReports(filterType);
                            alert("Status changed to 'RESOLVED'.");
                        } else {
                            alert("Incorrect password. Status not changed.");
                            e.target.checked = false;
                        }
                    } else {
                        report.status = report.status === 'RESOLVED' ? 'UPDATED' : 'OPEN';
                        localStorage.setItem('reports', JSON.stringify(reports));
                        loadReports(filterType);
                        alert("Status reverted.");
                    }
                });

                listItem.querySelector('.edit-btn').addEventListener('click', async () => {
                    const userEntry = prompt("Please enter the password to edit this entry:");
                    const storedPasscode = localStorage.getItem("PASSCODE");

                    const isEqual = await comparePascodes(storedPasscode, userEntry, "EDIT");

                    if (isEqual) {
                        const confirmEdit = confirm("Correct! Are you sure you want to edit this entry?");
                        if (confirmEdit) {
                            localStorage.setItem('editReportId', report.id);
                            window.location.href = 'report.html';
                        }
                    } else {
                        alert("Incorrect password. Edit not allowed.");
                    }
                });

                listItem.querySelector('.delete-btn').addEventListener('click', async () => {
                    const userEntry = prompt("Please enter the password to delete this entry:");
                    const storedPasscode = localStorage.getItem("PASSCODE");

                    const isEqual = await comparePascodes(storedPasscode, userEntry, "DELETE");

                    if (isEqual) {
                        const updatedReports = reports.filter(r => r.id !== report.id);
                        localStorage.setItem('reports', JSON.stringify(updatedReports));
                        loadReports(filterType);
                        alert("Report deleted successfully.");

                        if (markers[report.id]) {
                            map.removeLayer(markers[report.id]);
                            delete markers[report.id];
                        }
                    } else {
                        alert("Incorrect password. Report not deleted.");
                    }
                });

                listItem.querySelector('.more-info-btn').addEventListener('click', () => {
                    displayMoreInfo(report);
                });

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
    let modal = document.querySelector('.info-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'info-modal';
        document.body.appendChild(modal);
    }
    
    
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

    if (markers[report.id]) {
        markers[report.id].setIcon(redIcon);
    }

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
        markers[report.id].setIcon(defaultIcon);
        
    });
}

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

