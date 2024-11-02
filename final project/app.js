document.getElementById('reportForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const report = {
        id: Date.now(),
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        emergencyType: document.getElementById('emergencyType').value,
        location: document.getElementById('location').value,
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
});

const mapContainer = document.getElementById('mapid');
if (mapContainer) {
    const map = L.map('mapid').setView([49.2827, -123.1207], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    function loadReports(filterType = 'all') {
        const reports = JSON.parse(localStorage.getItem('reports')) || [];
        document.getElementById('reportList').innerHTML = '';
        reports.filter(report => filterType === 'all' || report.emergencyType === filterType).forEach(report => {
            const marker = L.marker([49.2827, -123.1207]).addTo(map); 
            marker.bindPopup(`
                <strong>${report.emergencyType}</strong><br>
                Location: ${report.location}<br>
                Status: ${report.status}
            `);

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
