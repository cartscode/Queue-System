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

    patients.forEach(p => {
      const row = `
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td>${p.condition_text}</td>
          <td>${p.registered_time}</td>
          <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
        </tr>
      `;

      // ✅ Sort patients by type
      if (p.type && p.type.toLowerCase() === "priority") {
        priorityBody.innerHTML += row;
      } else {
        regularBody.innerHTML += row;
      }
    });

  } catch (error) {
    console.error("Error loading patients:", error);
  }
}

// Refresh every 5 seconds
setInterval(loadPatients, 5000);
loadPatients();