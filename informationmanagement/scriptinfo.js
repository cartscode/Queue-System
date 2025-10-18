function goToDashboard() {
  window.open("realTimeDashboards.html", "_blank");
}

const regularQueue = [];
const priorityQueue = [];
const allPatients = [];

// === Load existing patients  from DB TO TABLE ===
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
        age: patient.age,
        condition: patient.condition_text,
        time: new Date(patient.registered_time).toLocaleTimeString(),
        status: patient.status
      };
// test
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

// === Add patient to DB and refresh ===
async function addPatient() {
  const name = document.getElementById("patientName").value.trim();
  const age = document.getElementById("patientAge").value.trim();
  const condition = document.getElementById("patientCondition").value.trim();
  const type = document.getElementById("patientType").value;

  if (!name || !age || !condition) {
    alert("Please fill out all fields.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("age", age);
  formData.append("condition", condition);
  formData.append("type", type);

  // FOR DATABASE INSERTION OF INFORMATION
  try {
    const response = await fetch("database.php", {
      method: "POST",
      body: formData
    });

    const result = await response.text();
    if (result.includes("success")) {
      alert("✅ Patient added successfully!");
      await loadPatients(); // reload the table
      document.getElementById("patientForm").reset();
    } else {
      alert("❌ Error adding patient.");
    }

  } catch (error) {
    console.error("Error adding patient:", error);
  }
}

// === Render table rows ===
function renderQueue(type) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  const tbody = document.getElementById(type + "QueueBody");
  tbody.innerHTML = "";

  if (queue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">Queue is empty...</td></tr>`;
    return;
  }

  queue.forEach((patient, index) => {
    const statusClass = getStatusClass(patient.status);
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${patient.name}</td>
        <td>${patient.age}</td>
        <td>${patient.condition}</td>
        <td>${patient.time}</td>
        <td><span class="status-badge ${statusClass}">${patient.status}</span></td>
        <td class="action-icons">
          <i class="fa-solid fa-user-doctor" title="Assign Doctor" onclick="assignDoctor('${type}', ${index})"></i>
          <i class="fa-solid fa-check" title="Mark as Completed" onclick="markDone('${type}', ${index})"></i>
    
          <i class="fa-solid fa-trash" title="Remove Patient" onclick="removePatient('${type}', ${index})"></i>
        </td>
      </tr>
    `;
    // remove/delete function connect to database 
    tbody.innerHTML += row;
  });
  updateDashboard();
}

function getStatusClass(status) {
  switch (status) {
    case "Waiting": return "status-waiting";
    case "Being Treated": return "status-treated";
    case "Completed": return "status-completed";
    default: return "";
  }
}

function assignDoctor(type, index) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  queue[index].status = "Being Treated";
  renderQueue(type);
}

function markDone(type, index) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  queue[index].status = "Completed";
  renderQueue(type);
}

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

    if (result.includes("success")) {
      alert("🗑️ Patient removed successfully!");
      await loadPatients(); // reload data after deletion
    } else {
      alert("❌ Failed to delete patient: " + result);
    }
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
}


function updateDashboard() {
  const total = regularQueue.length + priorityQueue.length;
  const waiting = [...regularQueue, ...priorityQueue].filter(p => p.status === "Waiting").length;
  const inProgress = [...regularQueue, ...priorityQueue].filter(p => p.status === "Being Treated").length;
  const completed = [...regularQueue, ...priorityQueue].filter(p => p.status === "Completed").length;

  const waitingPatients = [...regularQueue, ...priorityQueue].filter(p => p.status === "Waiting");
  let avgWait = "< 1 min";
  if (waitingPatients.length > 0) {
    const totalWait = waitingPatients.reduce((sum, p) => sum + ((Date.now() - p.waitStart) / 60000), 0);
    avgWait = (totalWait / waitingPatients.length).toFixed(1) + " min";
  }

  document.getElementById("totalPatients").innerText = total;
  document.getElementById("waitingPatients").innerText = waiting;
  document.getElementById("inProgress").innerText = inProgress;
  // fix the time av waiting
  document.getElementById("avgWait").innerText = avgWait;
}

const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  navLinks.classList.toggle("show");
});

window.onload = loadPatients;
setInterval(loadPatients, 5000); // auto-refresh table every 5 seconds
