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

        const regularBody = document.querySelector("#regularQueueBody");
        const priorityBody = document.querySelector("#priorityQueueBody");

        // Clear current table rows
        regularBody.innerHTML = "";
        priorityBody.innerHTML = "";

        let totalPatients = 0;
        let waitingCount = 0;
        let inProgressCount = 0;

        patients.forEach(p => {
            totalPatients++;
            if (p.status === "Waiting") waitingCount++;
            if (p.status === "In Progress") inProgressCount++;

            const row = `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.age}</td>
                    <td>${p.condition_text}</td>
                    <td>${p.registered_time}</td>
                    <td>${p.status}</td>
                    <td>
                        <button onclick="updateStatus(${p.id}, 'In Progress')">Start</button>
                        <button onclick="updateStatus(${p.id}, 'Completed')">Complete</button>
                    </td>
                </tr>
            `;

            if (p.type === "Priority") priorityBody.innerHTML += row;
            else regularBody.innerHTML += row;
        });

        document.getElementById("totalPatients").textContent = totalPatients;
        document.getElementById("waitingPatients").textContent = waitingCount;
        document.getElementById("inProgress").textContent = inProgressCount;

    } catch (error) {
        console.error("Error loading patients:", error);
    }
}

// Refresh every 5 seconds
setInterval(loadPatients, 5000);
loadPatients();

// Update patient status function
async function updateStatus(id, status) {
    try {
        await fetch(`update_status.php?id=${id}&status=${status}`);
        loadPatients();
    } catch (error) {
        console.error(error);
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
 async function addPatient() {
  // ... gather formData earlier ...
    try {
      const res = await fetch("database.php", {
        method: "POST",
        body: formData
      });

      const resultText = await res.text();
      if (resultText.includes("success")) {
        alert("✅ Patient added successfully!");
        await loadPatients(); // reload the table
        document.getElementById("patientForm").reset();
      } else {
        alert("❌ Error adding patient.");
        console.error("Add patient response:", resultText);
      }
    } catch (error) {
      console.error("Error adding patient:", error);
    }
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

function removePatient(type, index) {
  const queue = type === "regular" ? regularQueue : priorityQueue;
  queue.splice(index, 1);
  renderQueue(type);
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

