function goToDashboard() {
  window.open("realTimeDashboards.html", "_blank");
}

const regularQueue = [];
const priorityQueue = [];
const allPatients = [];

function addPatient() {
  const name = document.getElementById("patientName").value.trim();
  const age = document.getElementById("patientAge").value.trim();
  const condition = document.getElementById("patientCondition").value.trim();
  const type = document.getElementById("patientType").value;

  if (!name || !age || !condition) {
    alert("Please fill out all fields.");
    return;
  }

  const patient = {
    name,
    age,
    condition,
    time: new Date().toLocaleTimeString(),
    status: "Waiting",
    waitStart: Date.now()
  };

  if (type === "regular") {
    regularQueue.push(patient);
    renderQueue("regular");
  } else {
    priorityQueue.push(patient);
    renderQueue("priority");
  }

  addToStorage(patient, type);
  updateDashboard();

  document.getElementById("patientName").value = "";
  document.getElementById("patientAge").value = "";
  document.getElementById("patientCondition").value = "";
}

// Render table rows
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
    tbody.innerHTML += row;
  });
  updateDashboard();
}

// Get color class for badge
function getStatusClass(status) {
  switch (status) {
    case "Waiting": return "status-waiting";
    case "Being Treated": return "status-treated";
    case "Completed": return "status-completed";
    default: return "";
  }
}

// Actions
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

function addToStorage(patient, type) {
  const record = {
    id: `${type === "regular" ? "R" : "P"}-${allPatients.length + 1}`,
    name: patient.name,
    age: patient.age,
    condition: patient.condition,
    type: type,
    status: patient.status,
    registeredAt: new Date().toLocaleString()
  };
  allPatients.push(record);
}

// Dashboard Summary
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
  document.getElementById("avgWait").innerText = avgWait;
}
// Toggle mobile menu
const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  navLinks.classList.toggle("show");
});
setInterval(updateDashboard, 5000);