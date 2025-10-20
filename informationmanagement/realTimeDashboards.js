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

      // 👇 Case-insensitive match for priority
      if (p.type.toLowerCase() === "priority") {
        priorityBody.innerHTML += row;
      } else {
        regularBody.innerHTML += row;
      }
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
