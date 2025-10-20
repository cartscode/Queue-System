<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Real-Time Patient Flow Management</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://kit.fontawesome.com/a2e0f4d4e4.js" crossorigin="anonymous"></script>
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeIn 0.6s ease-in-out; }
    .priority-tab { background-color: #dc2626; color: white; box-shadow: 0 0 10px rgba(239,68,68,0.5); }

    .status-waiting { background: #d1fae5; color: #065f46; }
    .status-treated { background: #fef3c7; color: #92400e; }
    .status-completed { background: #dbeafe; color: #1e40af; }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
      font-size: 0.85rem;
    }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; }
    tr:nth-child(even) { background-color: #f9fafb; }

    .table-container { overflow-x: auto; }
  </style>
</head>

<body class="bg-gray-50 text-gray-800">
  <div class="max-w-6xl mx-auto p-6 fade-in">
    <h1 class="text-2xl font-bold text-center mb-6">Real-Time Patient Flow Management</h1>

    <!-- Tabs -->
    <div class="flex justify-center mb-8">
      <button id="tab-regular" class="px-6 py-2 bg-purple-600 text-white font-semibold rounded-l-lg shadow-md transition duration-300 hover:scale-105">
        Regular Patient Queue (Triage)
      </button>
      <button id="tab-priority" class="px-6 py-2 priority-tab font-semibold rounded-r-lg shadow-md transition duration-300 hover:scale-105">
        Priority Patient Queue (FIFO)
      </button>
    </div>

    <!-- Regular Queue Dashboard -->
    <section id="regular-section">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl shadow text-center">
          <p class="text-sm text-gray-500">Total Patients</p>
          <p id="totalPatients" class="text-3xl font-bold">0</p>
        </div>
        <div class="bg-white p-4 rounded-xl shadow text-center">
          <p class="text-sm text-gray-500">Waiting in Queue</p>
          <p id="waitingPatients" class="text-3xl font-bold">0</p>
        </div>
        <div class="bg-white p-4 rounded-xl shadow text-center">
          <p class="text-sm text-gray-500">Currently Serving</p>
          <p id="inProgress" class="text-3xl font-bold">0</p>
        </div>
        <div class="bg-white p-4 rounded-xl shadow text-center">
          <p class="text-sm text-gray-500">Avg Wait Time</p>
          <p id="avgWait" class="text-3xl font-bold text-gray-500">0 min</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden table-container">
        <table>
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Condition</th>
              <th>Type</th>
              <th>Registered Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="regularQueueBody">
            <tr><td colspan="7" class="text-center py-6 text-gray-500">Loading patients...</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Priority Queue Dashboard -->
    <section id="priority-section" class="hidden fade-in">
      <div class="bg-white rounded-xl shadow overflow-hidden table-container">
        <table>
          <thead class="bg-red-100 text-red-800">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Condition</th>
              <th>Type</th>
              <th>Registered Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="priorityQueueBody">
            <tr><td colspan="7" class="text-center py-6 text-gray-500">No priority patients yet...</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <script>
  // TAB SWITCHING
  const tabRegular = document.getElementById("tab-regular");
  const tabPriority = document.getElementById("tab-priority");
  const sectionRegular = document.getElementById("regular-section");
  const sectionPriority = document.getElementById("priority-section");

  tabRegular.addEventListener("click", () => {
    sectionRegular.classList.remove("hidden");
    sectionPriority.classList.add("hidden");
    tabRegular.classList.add("bg-purple-600", "text-white");
    tabPriority.classList.remove("priority-tab");
  });

  tabPriority.addEventListener("click", () => {
    sectionRegular.classList.add("hidden");
    sectionPriority.classList.remove("hidden");
    tabRegular.classList.remove("bg-purple-600", "text-white");
    tabPriority.classList.add("priority-tab");
  });

  // ✅ FETCH DATA FROM PHP + MYSQL
  async function loadPatients() {
      try {
          const response = await fetch("fetch_patients.php");
          if (!response.ok) throw new Error("Failed to fetch patient data");

          const patients = await response.json();

          const regularBody = document.querySelector("#regularQueueBody");
          const priorityBody = document.querySelector("#priorityQueueBody");

          regularBody.innerHTML = "";
          priorityBody.innerHTML = "";

          let totalPatients = 0;
          let waitingCount = 0;

          patients.forEach(p => {
              totalPatients++;
              if (p.status === "Waiting") waitingCount++;

              const row = `
                  <tr>
                      <td>${p.id}</td>
                      <td>${p.name}</td>
                      <td>${p.age}</td>
                      <td>${p.condition_text}</td>
                      <td>${p.type}</td>
                      <td>${p.registered_time}</td>
                      <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
                  </tr>
              `;

              if (p.type === "Priority") priorityBody.innerHTML += row;
              else regularBody.innerHTML += row;
          });

          document.getElementById("totalPatients").textContent = totalPatients;
          document.getElementById("waitingPatients").textContent = waitingCount;
      } catch (error) {
          console.error("Error loading patients:", error);
      }
  }

  // Refresh every 5 seconds
  setInterval(loadPatients, 5000);
  loadPatients();
  </script>

</body>
</html>
