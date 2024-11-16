
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
            // Update the existing report by ID
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
            // Add a new report if not in edit mode
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

        // Clear existing markers on the map
        for (let id in markers) {
            map.removeLayer(markers[id]);
        }
        markers = {}; // Reset markers object
        
        reports
            .filter(report => filterType === 'all' || report.emergencyType === filterType)
            .forEach(report => {
                if (report.latitude && report.longitude) {
                    const marker = L.marker([report.latitude, report.longitude]).addTo(map);
                    marker.bindPopup(`
                        <strong>${report.emergencyType}</strong><br>
                        Location: ${report.location}<br>
                        Status: ${report.status}
                    `);
                    markers[report.id] = marker; // Store marker by report ID
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

                // Status checkbox functionality
                listItem.querySelector('.status-checkbox').addEventListener('change', async (e) => {
                    if (e.target.checked) {
                        const userEntry = prompt("You are about to change the status to 'RESOLVED'. Please enter the password:");
                        const storedPasscode = localStorage.getItem("PASSCODE");

                        const isEqual = await comparePascodes(storedPasscode, userEntry, "RESOLVE");
                        if (isEqual) {
                            report.status = 'RESOLVED';
                            localStorage.setItem('reports', JSON.stringify(reports));
                            loadReports(filterType); // Refresh the list
                            alert("Status changed to 'RESOLVED'.");
                        } else {
                            alert("Incorrect password. Status not changed.");
                            e.target.checked = false;
                        }
                    } else {
                        // Revert status to original on uncheck
                        report.status = report.status === 'RESOLVED' ? 'UPDATED' : 'OPEN';
                        localStorage.setItem('reports', JSON.stringify(reports));
                        loadReports(filterType); // Refresh the list
                        alert("Status reverted.");
                    }
                });

                // Edit functionality with password confirmation
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
    
                // Delete functionality with password prompt
                listItem.querySelector('.delete-btn').addEventListener('click', async () => {
                    const userEntry = prompt("Please enter the password to delete this entry:");
                    const storedPasscode = localStorage.getItem("PASSCODE");

                    const isEqual = await comparePascodes(storedPasscode, userEntry, "DELETE");

                    if (isEqual) {
                        const updatedReports = reports.filter(r => r.id !== report.id);
                        localStorage.setItem('reports', JSON.stringify(updatedReports));
                        loadReports(filterType); // Refresh the list
                        alert("Report deleted successfully.");

                        // Remove the marker from the map
                        if (markers[report.id]) {
                            map.removeLayer(markers[report.id]);
                            delete markers[report.id];
                        }
                    } else {
                        alert("Incorrect password. Report not deleted.");
                    }
                });

                // More Info functionality
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