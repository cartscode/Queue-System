function goToDashboard() {
  window.open("realTimeDashboards.html", "_blank");
}

// Mapping of doctor type codes to friendly names
const doctorTypeNames = {
  general_practitioner: "General Practitioner",
  pediatrician: "Pediatrician",
  dermatologist: "Dermatologist",
  cardiologist: "Cardiologist",
  orthopedic: "Orthopedic",
  gynecologist: "Gynecologist"
};

const doctorRooms = {
  general_practitioner: "101",
  pediatrician: "102",
  dermatologist: "103",
  cardiologist: "104",
  orthopedic: "105",
  gynecologist: "106",
};

document.getElementById("doctorType").addEventListener("change", function() {
  const roomDisplay = document.getElementById("roomDisplay");
  const selectedDoctor = this.value;
  if (doctorRooms[selectedDoctor]) {
    roomDisplay.textContent = `Assigned Room: ${doctorRooms[selectedDoctor]}`;
  } else {
    roomDisplay.textContent = "Assigned Room: -";
  }
});

// Helper function to calculate age from birthdate string
function calculateAge(birthdate) {
  if (!birthdate) return "N/A";
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const regularQueue = [];
const priorityQueue = [];

// === Load existing patients from DB and populate queues ===
async function loadPatients() {
  try {
    const response = await fetch("fetch_patients.php");
    const patients = await response.json();

    regularQueue.length = 0;
    priorityQueue.length = 0;

    patients.forEach(patient => {
      const patientData = {
        id: patient.id,
        name: patient.name,
        birthdate: patient.birthdate,
        doctor_type: patient.doctor_type,
        room: patient.room,
        condition: patient.condition_text,  // Make sure backend sends condition_text
        time: new Date(patient.registered_time).toLocaleTimeString(),
        status: patient.status,
        type: patient.type
      };

      if (patient.type === "regular") {
        regularQueue.push(patientData);
      } else {
        priorityQueue.push(patientData);
      }
    });

    renderQueue("regular");
    renderQueue("priority");
    updateDashboard();

  } catch (error) {
    console.error("Error loading patients:", error);
  }
}

// === Add patient to DB and reload table ===
async function addPatient() {
  const name = document.getElementById("patientName").value.trim();
  const birthdate = document.getElementById("patientBirthdate").value.trim();
  const condition = document.getElementById("patientCondition").value.trim();
  const type = document.getElementById("patientType").value;
  const doctor_type = document.getElementById("doctorType").value;

  if (!name || !birthdate || !condition || !doctor_type) {
    alert("Please fill out all fields.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("birthdate", birthdate);
  formData.append("condition", condition);
  formData.append("type", type);
  formData.append("doctor_type", doctor_type);

  try {
    const response = await fetch("database.php", {
      method: "POST",
      body: formData
    });

    const result = await response.text();

    // Check success by keyword (you can improve this with JSON responses)
    if (result.toLowerCase().includes("success")) {
      alert("✅ Patient added successfully!");
      await loadPatients();
      document.getElementById("patientForm").reset();
    } else {
      alert("❌ Error adding patient.");
    }
  } catch (error) {
    console.error("Error adding patient:", error);
  }
}

// === Render queue table rows ===
function renderQueue(type) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  const tbody = document.getElementById(type + "QueueBody");
  tbody.innerHTML = "";

  if (queue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">Queue is empty...</td></tr>`;
    return;
  }

  queue.forEach((patient, index) => {
    const statusClass = getStatusClass(patient.status);
    const doctorName = doctorTypeNames[patient.doctor_type] || patient.doctor_type;

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${patient.name}</td>
        <td>${calculateAge(patient.birthdate)}</td> <!-- AGE displayed here -->
        <td>${doctorName}</td>
        <td>${patient.room}</td>
        <td>${patient.condition}</td>
        <td>${patient.time}</td>
        <td><span class="status-badge status-${patient.status.toLowerCase()}">${patient.status}</span></td>
        <td>
          <button onclick="assignDoctor('${type}', ${index})">Assign Doctor</button>
          <button onclick="markDone('${type}', ${index})">Mark Done</button>
          <button onclick="removePatient('${type}', ${index})">Remove</button>
        </td>
      </tr>
    `;

    tbody.innerHTML += row;
  });

  updateDashboard();
}

// === Helper: get CSS class for status badges ===
function getStatusClass(status) {
  switch (status) {
    case "Waiting": return "status-waiting";
    case "Being Treated": return "status-treated";
    case "Completed": return "status-completed";
    default: return "";
  }
}

// === Change status to "Being Treated" ===
async function assignDoctor(type, index) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  const patient = queue[index];

  try {
    const response = await fetch("update_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${encodeURIComponent(patient.id)}&status=${encodeURIComponent("Being Treated")}`
    });

    const result = await response.text();
    if (result.toLowerCase().includes("success")) {
      queue[index].status = "Being Treated";
      renderQueue(type);
      alert(`👨‍⚕️ ${patient.name} is now being treated.`);
    } else {
      alert("❌ Failed to update status.");
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

// === Change status to "Completed" ===
async function markDone(type, index) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  const patient = queue[index];

  try {
    const response = await fetch("update_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${encodeURIComponent(patient.id)}&status=${encodeURIComponent("Completed")}`
    });

    const result = await response.text();
    if (result.toLowerCase().includes("success")) {
      queue[index].status = "Completed";
      renderQueue(type);
      alert(`✅ ${patient.name}'s treatment completed.`);
    } else {
      alert("❌ Failed to update status.");
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

// === Remove patient from queue ===
async function removePatient(type, index) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  const patient = queue[index];

  if (!confirm(`Are you sure you want to remove ${patient.name}?`)) return;

  try {
    const response = await fetch("delete_patient.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id=" + encodeURIComponent(patient.id)
    });

    const result = await response.text();

    if (result.toLowerCase().includes("success")) {
      alert("🗑️ Patient removed successfully!");
      await loadPatients();
    } else {
      alert("❌ Failed to delete patient: " + result);
    }
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
}

// === Update dashboard stats ===
function updateDashboard() {
  const total = regularQueue.length + priorityQueue.length;
  const waiting = [...regularQueue, ...priorityQueue].filter(p => p.status === "Waiting").length;
  const inProgress = [...regularQueue, ...priorityQueue].filter(p => p.status === "Being Treated").length;
  const completed = [...regularQueue, ...priorityQueue].filter(p => p.status === "Completed").length;

  const waitingPatients = [...regularQueue, ...priorityQueue].filter(p => p.status === "Waiting");
  let avgWait = "< 1 min";
  if (waitingPatients.length > 0) {
    // NOTE: waitStart property is not set in this code; you can add it if you want precise wait time calculation
    const totalWait = waitingPatients.reduce((sum, p) => sum + ((Date.now() - (p.waitStart || Date.now())) / 60000), 0);
    avgWait = (totalWait / waitingPatients.length).toFixed(1) + " min";
  }

  document.getElementById("totalPatients").innerText = total;
  document.getElementById("waitingPatients").innerText = waiting;
  document.getElementById("inProgress").innerText = inProgress;
  document.getElementById("avgWait").innerText = avgWait;
}

// Hamburger menu toggle
const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  navLinks.classList.toggle("show");
});

// Load patients on page load
window.onload = loadPatients;

document.addEventListener("DOMContentLoaded", () => {
  const roomNumbers = {
    general_practitioner: "101",
    pediatrician: "102",
    dermatologist: "103",
    cardiologist: "104",
    orthopedic: "105",
    gynecologist: "106",
  };

  const doctorTypeSelect = document.getElementById("doctorType");
  const roomDisplay = document.getElementById("roomDisplay");

  if (!doctorTypeSelect || !roomDisplay) {
    console.error("doctorTypeSelect or roomDisplay not found in DOM");
    return;
  }

  doctorTypeSelect.addEventListener("change", () => {
    const selectedDoctor = doctorTypeSelect.value;
    console.log("Doctor type selected:", selectedDoctor);
    if (roomNumbers[selectedDoctor]) {
      roomDisplay.textContent = `Assigned Room: ${roomNumbers[selectedDoctor]}`;
    } else {
      roomDisplay.textContent = "Assigned Room: -";
    }
  });
});
