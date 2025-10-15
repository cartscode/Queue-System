import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, onSnapshot, collection, updateDoc, deleteDoc, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- GLOBAL SETUP (Mandatory for Canvas Environment) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';    
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { /* mock config if not present */ };
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Disable logging in production-like environments, set to 'Debug' for development
setLogLevel('error'); 

let app, db, auth;
let userId = null;
let isAuthReady = false;

// --- STATE MANAGEMENT ---
let currentPatients = [];
let currentMetrics = {
    total: 0, waiting: 0, inprogress: 0, completed: 0, emergency: 0,
    avgWaitTime: 0, turnaroundTime: 0,
    priorityCounts: { emergency: 0, urgent: 0, normal: 0, low: 0 }
};

const PATIENT_COLLECTION = `/artifacts/${appId}/public/data/patients`;

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
    const elapsedMinutes = (now - checkInTime) / 60000;
    return formatTime(elapsedMinutes);
}

// Simple exponential backoff retry for Firestore operations
async function firestoreRetryWrapper(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error("Firestore operation failed after multiple retries:", error);
                showStatus(`Error processing request: ${error.message}`);
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
        }
    }
}

// --- FIREBASE INITIALIZATION & AUTHENTICATION ---
async function initFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                // document.getElementById('user-info').textContent = `Authenticated User ID: ${userId.substring(0, 8)}...`;
                document.getElementById('auth-status').textContent = 'Log out'; // Retain "Log out" text
                isAuthReady = true;
                // Start real-time listeners once authenticated
                setupPatientListener();
            } else {
                // This should ideally not happen after initial sign-in unless token expires
                userId = null;
                // document.getElementById('user-info').textContent = `Welcome! (Anonymous Mode)`;
                document.getElementById('auth-status').textContent = 'Log in';
                isAuthReady = true;
            }
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        showStatus(`Firebase Error: ${error.message}`);
    }
}

// --- DATA PROCESSING & RENDERING ---
function calculateMetrics(patients) {
    const counts = { total: 0, waiting: 0, inprogress: 0, completed: 0 };
    const priorityCounts = { emergency: 0, urgent: 0, normal: 0, low: 0 };
    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;
    let completedCount = 0;
    let waitingCount = 0;
    
    const now = Date.now();

    patients.forEach(p => {
        counts.total++;
        priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1;
        
        if (p.status === 'waiting') {
            counts.waiting++;
            waitingCount++;
            // Calculate wait time in minutes (now - creationTime)
            totalWaitTime += (now - p.checkInTime) / 60000;
        } else if (p.status === 'inprogress') {
            counts.inprogress++;
        } else if (p.status === 'completed' && p.completionTime) {
            counts.completed++;
            completedCount++;
            // Calculate turnaround time (completionTime - creationTime)
            totalTurnaroundTime += (p.completionTime - p.checkInTime) / 60000;
        }
    });

    currentMetrics = {
        ...counts,
        priorityCounts,
        avgWaitTime: waitingCount > 0 ? totalWaitTime / waitingCount : 0,
        turnaroundTime: completedCount > 0 ? totalTurnaroundTime / completedCount : 0,
        emergencyRate: counts.total > 0 ? (priorityCounts.emergency / counts.total) * 100 : 0,
        queueLoad: counts.inprogress > 0 ? (counts.waiting / counts.inprogress) : 0,
        emergency: priorityCounts.emergency // Separate count for emergency indicator
    };
}

function renderMetrics() {
    const m = currentMetrics;

    // 1. Status Indicators
    // Note: The indicator HTML for Emergency is hardcoded to "1 Emergency" in the previous file.
    // I'll update it to use the dynamic count 'm.emergency' but keep the fixed text style from the original intent.
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
            <div class="metric-icon-bg completed"><i class="fas fa-calendar-check"></i></div>
            <div class="metric-title">Completed Today</div>
            <div class="metric-value">${m.completed}</div>
        </div>
    `;
    document.getElementById('metrics-grid').innerHTML = metricsGridHTML;

    // Note: Priority Distribution and Performance Metrics rendering is omitted 
    // since the HTML panels are currently placeholders, but metric data is calculated.
}

function renderQueueTable(patients) {
    const tableBody = document.getElementById('queue-table-body');
    const queueTitle = document.getElementById('queue-title');
    let tableHTML = '';
    
    // Apply filtering logic
    const search = document.getElementById('queue-search').value.toLowerCase();
    const filterPriority = document.getElementById('queue-filter-priority').value;
    const filterStatus = document.getElementById('queue-filter-status').value;
    
    const filteredPatients = patients.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(search);
        const priorityMatch = !filterPriority || p.priority === filterPriority;
        const statusMatch = !filterStatus || p.status === filterStatus;
        return nameMatch && priorityMatch && statusMatch;
    });

    // Update queue title
    queueTitle.innerHTML = `<i class="fas fa-list-alt icon"></i>Patient Queue (${filteredPatients.length} patients)`;


    // Sort by priority (Emergency > Urgent > Normal > Low) and then by check-in time
    const priorityOrder = { 'emergency': 4, 'urgent': 3, 'normal': 2, 'low': 1 };
    filteredPatients.sort((a, b) => {
        // Primary sort: Priority
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Secondary sort: Time (earlier time comes first)
        return a.checkInTime - b.checkInTime;
    });

    if (filteredPatients.length === 0) {
        tableHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-light);">No patients match the current filters.</td></tr>`;
    } else {
        filteredPatients.forEach((p, index) => {
            const checkInDate = new Date(p.checkInTime);
            const formattedTime = checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const waitTime = p.status === 'waiting' ? formatWaitTime(p.checkInTime) : '--';
            
            tableHTML += `
                <tr data-id="${p.id}">
                    <td>${index + 1}</td> <!-- Row Number -->
                    <td>${p.name}</td>
                    <td>${p.age}</td>
                    <td>${p.condition}</td>
                    <td><span class="tag ${p.priority}">${p.priority.toUpperCase()}</span></td>
                    <td><span class="tag status-${p.status}">${p.status.toUpperCase()}</span></td>
                    <td>${formattedTime}</td> <!-- Registered Time -->
                    <td>${waitTime}</td> <!-- Wait Time -->
                    <td class="action-btns">
                        <button onclick="updatePatientStatus('${p.id}', 'inprogress')" title="Start Consultation"><i class="fas fa-user-md"></i></button>
                        <button onclick="updatePatientStatus('${p.id}', 'completed')" title="Mark Completed"><i class="fas fa-check-circle"></i></button>
                        <button onclick="deletePatient('${p.id}')" title="Remove"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = tableHTML;
}

// --- FIREBASE LISTENERS & CRUD OPERATIONS ---
function setupPatientListener() {
    if (!db) return;
    const patientsRef = collection(db, PATIENT_COLLECTION);
    
    // Listen for all patients in real-time
    onSnapshot(patientsRef, (snapshot) => {
        const patientsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        currentPatients = patientsArray;
        
        // Re-calculate metrics and re-render everything
        calculateMetrics(currentPatients);
        renderMetrics();
        renderQueueTable(currentPatients);
        
    }, (error) => {
        console.error("Error listening to patient collection:", error);
        showStatus("Failed to load real-time queue data.");
    });
}


window.addPatient = async function(event) {
    event.preventDefault();
    
    if (!isAuthReady) {
        showStatus("Authentication is not ready. Please wait a moment.");
        return;
    }

    const name = document.getElementById('patient-name').value;
    const age = parseInt(document.getElementById('patient-age').value);
    const condition = document.getElementById('patient-condition').value;
    const priority = document.getElementById('patient-priority').value;

    if (!name || isNaN(age) || !condition || !priority) {
        showStatus("Please fill in all patient details.");
        return;
    }
    
    const newPatient = {
        name, age, condition, priority,
        status: 'waiting',
        checkInTime: Date.now(),
        completedBy: userId, // Record which user added the patient
        completionTime: null // Null initially
    };

    const operation = async () => {
        const patientsRef = collection(db, PATIENT_COLLECTION);
        await addDoc(patientsRef, newPatient);
        document.getElementById('registration-form').reset();
        showStatus(`${name} added to the queue successfully!`);
    };

    firestoreRetryWrapper(operation);
}

window.updatePatientStatus = async function(patientId, newStatus) {
    if (!isAuthReady) return showStatus("Authentication is not ready.");

    const patientRef = doc(db, PATIENT_COLLECTION, patientId);
    const updateData = {
        status: newStatus
    };
    
    if (newStatus === 'completed') {
        updateData.completionTime = Date.now();
    }

    const operation = async () => {
        await updateDoc(patientRef, updateData);
        showStatus(`Patient ${patientId.substring(0, 5)} status updated to ${newStatus.toUpperCase()}.`);
    };

    firestoreRetryWrapper(operation);
}

window.deletePatient = async function(patientId) {
    if (!isAuthReady) return showStatus("Authentication is not ready.");

    const patientRef = doc(db, PATIENT_COLLECTION, patientId);
    
    const operation = async () => {
        await deleteDoc(patientRef);
        showStatus(`Patient ${patientId.substring(0, 5)} removed from the queue.`);
    };

    firestoreRetryWrapper(operation);
}

// --- UI INTERACTION LOGIC ---

// 1. Navbar Toggle (Hamburger Menu)
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
});

// 2. Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 3. Tab Switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab class
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Switch panel content
        const panelId = tab.getAttribute('data-panel');
        document.querySelectorAll('.panel-content').forEach(panel => {
            panel.classList.add('hidden');
        });
        document.getElementById(panelId).classList.remove('hidden');
    });
});

// 4. Set initial active tab to Queue Management (as per image)
// Find the Queue Management button and panel and set active state
document.addEventListener('DOMContentLoaded', () => {
    const queueTab = document.querySelector('.tab[data-panel="queue-management"]');
    const queuePanel = document.getElementById('queue-management');
    if (queueTab && queuePanel) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel-content').forEach(p => p.classList.add('hidden'));

        queueTab.classList.add('active');
        queuePanel.classList.remove('hidden');
    }
});

// 5. Form Submission
document.getElementById('registration-form').addEventListener('submit', window.addPatient);

// 6. Filtering/Searching (Triggers table re-render based on currentPatients)
document.getElementById('queue-search').addEventListener('input', () => renderQueueTable(currentPatients));
document.getElementById('queue-filter-priority').addEventListener('change', () => renderQueueTable(currentPatients));
document.getElementById('queue-filter-status').addEventListener('change', () => renderQueueTable(currentPatients));


// --- ENTRY POINT ---
window.onload = initFirebase;
// Initial mock rendering while loading
calculateMetrics([]);
renderMetrics();
renderQueueTable([]);
