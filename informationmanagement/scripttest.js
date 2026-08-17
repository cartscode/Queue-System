 // =========================================================
        // PURE JAVASCRIPT IN-MEMORY DEMO LOGIC (No Database)
        // =========================================================

        // --- GLOBAL STATE ---
        window.patientsData = [
            
        ];
        
        // --- UTILITY FUNCTIONS ---
        function showStatus(message) {
            document.getElementById('modal-message').textContent = message;
            document.getElementById('status-modal').classList.remove('hidden');
        }

        function formatTime(minutes) {
            if (minutes < 1) return '< 1 min';
            return `${Math.round(minutes)} min`;
        }

        function formatWaitTime(checkInTime) {
            const now = Date.now();
            // Wait time calculation only relevant if patient is still waiting
            if (now < checkInTime) return '0 min'; 
            const elapsedMinutes = (now - checkInTime) / 60000;
            return formatTime(elapsedMinutes);
        }

        function generateUniqueId() {
            return 'p' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        }

        // --- METRICS CALCULATION & RENDERING ---
        let currentMetrics = {};

        function calculateMetrics() {
            const counts = { total: 0, waiting: 0, inprogress: 0, completed: 0 };
            const priorityCounts = { emergency: 0, urgent: 0, normal: 0, low: 0 };
            let totalWaitTime = 0;
            let waitingCount = 0;
            
            const now = Date.now();

            patientsData.forEach(p => {
                counts.total++;
                priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1;
                
                if (p.status === 'waiting') {
                    counts.waiting++;
                    waitingCount++;
                    totalWaitTime += (now - p.checkInTime) / 60000; // time in minutes
                } else if (p.status === 'inprogress') {
                    counts.inprogress++;
                } else if (p.status === 'completed') {
                    counts.completed++;
                }
            });

            currentMetrics = {
                ...counts,
                priorityCounts,
                avgWaitTime: waitingCount > 0 ? totalWaitTime / waitingCount : 0,
                emergency: priorityCounts.emergency
            };
        }

        function renderMetrics() {
            const m = currentMetrics;

            // 1. Status Indicators
            const indicatorsHTML = `
                <div class="indicator total">Total: <span id="total-count">${m.total}</span></div>
                <div class="indicator waiting">Waiting: <span id="waiting-count">${m.waiting}</span></div>
                <div class="indicator in-progress">In Progress: <span id="inprogress-count">${m.inprogress}</span></div>
                <div class="indicator completed">Completed: <span id="completed-count">${m.completed}</span></div>
                <div class="indicator emergency">${m.emergency} Emergency</div>
            `;
            document.getElementById('status-indicators').innerHTML = indicatorsHTML;

            // 2. Metrics Grid
            const metricsGridHTML = `
                <div class="card metric-box">
                    <div class="metric-icon-bg total"><i class="fas fa-users"></i></div>
                    <div class="metric-title">Total Patients</div>
                    <div class="metric-value">${m.total}</div>
                </div>
                <div class="card metric-box">
                    <div class="metric-icon-bg waiting"><i class="fas fa-hourglass-start"></i></div>
                    <div class="metric-title">Currently Waiting</div>
                    <div class="metric-value">${m.waiting}</div>
                </div>
                <div class="card metric-box">
                    <div class="metric-icon-bg in-progress"><i class="fas fa-stethoscope"></i></div>
                    <div class="metric-title">In Progress</div>
                    <div class="metric-value">${m.inprogress}</div>
                </div>
                <div class="card metric-box">
                    <div class="metric-icon-bg completed"><i class="fas fa-clock"></i></div>
                    <div class="metric-title">Avg Wait Time</div>
                    <div class="metric-value">${formatTime(m.avgWaitTime)}</div>
                </div>
            `;
            document.getElementById('metrics-grid').innerHTML = metricsGridHTML;
        }

        function renderQueueTable() {
            const tableBody = document.getElementById('queue-table-body');
            const queueTitle = document.getElementById('queue-title');
            
            // Filtering logic
            const search = document.getElementById('queue-search').value.toLowerCase();
            const filterPriority = document.getElementById('queue-filter-priority').value;
            const filterStatus = document.getElementById('queue-filter-status').value;
            
            let filteredPatients = patientsData.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(search);
                const priorityMatch = !filterPriority || p.priority === filterPriority;
                const statusMatch = !filterStatus || p.status === filterStatus;
                return nameMatch && priorityMatch && statusMatch;
            });

            // Sorting logic (Priority descending, then CheckInTime ascending)
            const priorityOrder = { 'emergency': 4, 'urgent': 3, 'normal': 2, 'low': 1 };
            filteredPatients.sort((a, b) => {
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return a.checkInTime - b.checkInTime;
            });

            queueTitle.innerHTML = `<i class="fas fa-list-alt icon"></i>Patient Queue (${filteredPatients.length} patients)`;

            let tableHTML = '';
            if (filteredPatients.length === 0) {
                tableHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-light);">No patients match the current filters.</td></tr>`;
            } else {
                filteredPatients.forEach((p, index) => {
                    const checkInDate = new Date(p.checkInTime);
                    const formattedTime = checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    // Wait time is only dynamically calculated if status is 'waiting'
                    const waitTime = p.status === 'waiting' ? formatWaitTime(p.checkInTime) : '--';
                    
                    tableHTML += `
                        <tr data-id="${p.id}">
                            <td>${index + 1}</td>
                            <td>${p.name}</td>
                            <td>${p.age}</td>
                            <td>${p.condition}</td>
                            <td><span class="tag ${p.priority}">${p.priority.toUpperCase()}</span></td>
                            <td><span class="tag status-${p.status}">${p.status.toUpperCase()}</span></td>
                            <td>${formattedTime}</td>
                            <td>${waitTime}</td>
                            <td class="action-btns">
                                ${p.status === 'waiting' ? `<button onclick="updatePatientStatus('${p.id}', 'inprogress')" title="Start Consultation"><i class="fas fa-user-md"></i></button>` : ''}
                                ${p.status !== 'completed' ? `<button onclick="updatePatientStatus('${p.id}', 'completed')" title="Mark Completed"><i class="fas fa-check-circle"></i></button>` : ''}
                                <button onclick="deletePatient('${p.id}')" title="Remove"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }
            
            tableBody.innerHTML = tableHTML;
        }

        // --- CRUD OPERATIONS (In-Memory Array Manipulation) ---
        
        function renderAll() {
            calculateMetrics();
            renderMetrics();
            renderQueueTable();
        }

        window.addPatient = function(event) {
            event.preventDefault();
            
            const name = document.getElementById('patient-name').value.trim();
            const ageInput = document.getElementById('patient-age').value;
            const condition = document.getElementById('patient-condition').value.trim();
            const priority = document.getElementById('patient-priority').value;

            if (!name || !ageInput || !condition || !priority) {
                return showStatus("Please fill in all patient details.");
            }
            const age = parseInt(ageInput);
            
            const newPatient = {
                id: generateUniqueId(),
                name, age, condition, priority,
                status: 'waiting',
                checkInTime: Date.now(),
                completionTime: null
            };

            patientsData.push(newPatient); // Add to in-memory array
            document.getElementById('registration-form').reset();
            showStatus(`${name} added to the queue successfully! (Local Demo)`);
            renderAll(); // Rerender UI
        }

        window.updatePatientStatus = function(patientId, newStatus) {
            const patientIndex = patientsData.findIndex(p => p.id === patientId);
            if (patientIndex > -1) {
                patientsData[patientIndex].status = newStatus;
                if (newStatus === 'completed') {
                    patientsData[patientIndex].completionTime = Date.now();
                }
                console.log(`Patient ${patientId} status updated to ${newStatus.toUpperCase()}.`);
                renderAll(); // Rerender UI
            }
        }

        window.deletePatient = function(patientId) {
            patientsData = patientsData.filter(p => p.id !== patientId);
            showStatus(`Patient removed from the queue. (Local Demo)`);
            renderAll(); // Rerender UI
        }
        
        // --- UI INTERACTION LOGIC ---

        // Tab Switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const panelId = tab.getAttribute('data-panel');
                document.querySelectorAll('.panel-content').forEach(panel => {
                    panel.classList.add('hidden');
                });
                document.getElementById(panelId).classList.remove('hidden');
            });
        });

        // Form Submission
        document.getElementById('registration-form').addEventListener('submit', window.addPatient);

        // Filtering/Searching (Triggers table re-render)
        const filterElements = [
            document.getElementById('queue-search'),
            document.getElementById('queue-filter-priority'),
            document.getElementById('queue-filter-status')
        ];

        filterElements.forEach(element => {
            element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', renderAll);
        });


        // --- ENTRY POINT ---
        document.addEventListener('DOMContentLoaded', () => {
            renderAll();
            // Periodically refresh the dashboard to update the 'Wait Time' metric
            setInterval(renderAll, 10000); // Update every 10 seconds
        });
        // =====================
// Tab Navigation Logic
// =====================
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Remove active from all tabs
        tabs.forEach(t => t.classList.remove("active"));
        // Hide all panels
        panels.forEach(p => p.classList.add("hidden"));
        // Activate selected tab
        tab.classList.add("active");
        document.getElementById(tab.dataset.panel).classList.remove("hidden");
    });
});
// =====================
// Live Dashboard Button
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const liveBtn = document.getElementById("live-dashboard-btn");
  if (liveBtn) {
    liveBtn.addEventListener("click", () => {
      window.open("live-dashboard.html", "_blank");
    });
  }
});

// 1. Navbar Toggle (Hamburger Menu)
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
});
