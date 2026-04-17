/**
 * CrisisConnect Dashboard Logic
 * Handles Leaflet map initialization, disaster markers, and UI overlays.
 */

const DISASTERS = [
    {id:1,name:"Türkiye Earthquake",type:"Earthquake",severity:5,lat:37.5,lng:36.8,affected:2400000},
    {id:2,name:"Bangladesh Flooding",type:"Flood",severity:4,lat:23.8,lng:90.4,affected:890000},
    {id:3,name:"California Wildfire",type:"Wildfire",severity:3,lat:34.0,lng:-118.2,affected:145000},
    {id:4,name:"Mozambique Cyclone",type:"Cyclone",severity:4,lat:-19.8,lng:34.9,affected:670000},
    {id:5,name:"Pakistan Heatwave",type:"Heatwave",severity:3,lat:30.3,lng:69.3,affected:320000},
    {id:6,name:"Philippines Typhoon",type:"Typhoon",severity:5,lat:12.8,lng:122.5,affected:1200000},
    {id:7,name:"Peru Landslides",type:"Landslide",severity:2,lat:-9.2,lng:-75.0,affected:45000}
];

let map, markersLayer, heatLayer;
let heatmapActive = false;
const bounds = DISASTERS.map(d => [d.lat, d.lng]);

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateStats();
    initControls();
});

function initMap() {
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20, 0], 3);
    
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    const heatPoints = [];

    DISASTERS.forEach(d => {
        let sevClass = d.severity === 5 ? 'sev-5' : (d.severity >= 3 ? 'sev-3' : 'sev-1');
        
        const iconHtml = `
            <div class="pulse-marker ${sevClass}">
                <div class="pulse-ring"></div>
                <div class="pulse-dot"></div>
                <div class="marker-label">${d.name}</div>
            </div>
        `;
        
        const icon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([d.lat, d.lng], {icon}).addTo(markersLayer);
        marker.on('click', () => showSlidePanel(d, sevClass));

        // Heatmap Data
        const intensity = d.severity * 0.2;
        heatPoints.push([d.lat, d.lng, intensity]);
        for(let i=0; i<8; i++) {
            heatPoints.push([
                d.lat + (Math.random() - 0.5) * 5,
                d.lng + (Math.random() - 0.5) * 5,
                intensity * (0.2 + Math.random() * 0.4)
            ]);
        }
    });

    heatLayer = L.heatLayer(heatPoints, {
        radius: 40, blur: 25, maxZoom: 5,
        gradient: {0.2: '#FF5500', 0.5: '#00e676', 0.8: '#ffb340', 1.0: '#ff3b3b'}
    });

    setTimeout(() => map.fitBounds(bounds, { padding: [50, 50] }), 500);
}

function updateStats() {
    const activeEl = document.getElementById('stat-active');
    const affectedEl = document.getElementById('stat-affected');
    const critEl = document.getElementById('stat-critical');
    
    if (!activeEl) return;

    const totalAffected = DISASTERS.reduce((s, d) => s + d.affected, 0);
    const criticalCount = DISASTERS.filter(d => d.severity >= 4).length;

    activeEl.innerText = DISASTERS.length;
    affectedEl.innerText = totalAffected.toLocaleString();
    critEl.innerText = criticalCount;
    
    [activeEl, affectedEl, critEl].forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; 
        el.style.animation = 'flicker 2s';
    });
}

function initControls() {
    const btnHeatmap = document.getElementById('btn-heatmap');
    if (btnHeatmap) {
        btnHeatmap.addEventListener('click', function() {
            heatmapActive = !heatmapActive;
            if(heatmapActive) {
                this.classList.add('active');
                this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="7" stroke-opacity="0.5"/></svg> HEATMAP ON';
                map.addLayer(heatLayer);
                map.removeLayer(markersLayer);
            } else {
                this.classList.remove('active');
                this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="7" stroke-opacity="0.5"/></svg> HEATMAP OFF';
                map.removeLayer(heatLayer);
                map.addLayer(markersLayer);
            }
        });
    }

    const btnFit = document.getElementById('btn-fit');
    if (btnFit) {
        btnFit.addEventListener('click', () => map.fitBounds(bounds, { padding: [50, 50] }));
    }

    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', function() {
            const svg = this.querySelector('svg');
            if (svg) svg.style.animation = 'spin 1s linear infinite';
            updateStats();
            setTimeout(() => { if (svg) svg.style.animation = 'none'; }, 1000);
        });
    }

    const closePanel = document.getElementById('close-panel');
    if (closePanel) {
        closePanel.addEventListener('click', () => {
            document.getElementById('disaster-panel').classList.remove('show');
        });
    }
}

function showSlidePanel(d, sevClass) {
    const panel = document.getElementById('disaster-panel');
    document.getElementById('p-title').innerText = d.name;
    
    const typeBadge = document.getElementById('p-type');
    typeBadge.innerText = d.type;
    typeBadge.className = `badge-pill ${d.severity === 5 ? 'badge-red' : (d.severity >= 3 ? 'badge-amber' : 'badge-cyan')}`;
    
    const sevContainer = document.getElementById('p-severity');
    sevContainer.innerHTML = '';
    for(let i=1; i<=5; i++) {
        const block = document.createElement('div');
        block.className = 'sev-block';
        if(i <= d.severity) {
            if(d.severity === 5) block.classList.add('filled-red');
            else if(d.severity >= 3) block.classList.add('filled-amber');
            else block.classList.add('filled-cyan');
        }
        sevContainer.appendChild(block);
    }
    
    document.getElementById('p-affected').innerText = d.affected.toLocaleString();
    document.getElementById('p-btn').href = 'disaster.html?id=' + d.id;
    
    panel.classList.add('show');
}
