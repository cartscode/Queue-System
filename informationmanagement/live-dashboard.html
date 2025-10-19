<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Dashboard - HealthCare+</title>
  <link rel="stylesheet" href="infoms.css" />

  <style>
    body {
      background: #f4f6fa;
      font-family: Arial, sans-serif;
      padding: 30px;
    }
    h1 {
      text-align: center;
      color: var(--primary-color);
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: var(--primary-color);
      color: white;
    }
    td.emergency { color: #F44336; font-weight: bold; }
    td.urgent { color: #FF9800; font-weight: bold; }
    td.normal { color: #2196F3; font-weight: bold; }
    td.low { color: #4CAF50; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Live Dashboard - Patient Queue Overview</h1>
  <table>
    <thead>
      <tr>
        <th>Patient ID</th>
        <th>Patient Name</th>
        <th>Priority Level</th>
      </tr>
    </thead>
    <tbody id="live-body">
      <tr><td colspan="3" style="text-align:center; color:#777;">Waiting for queue data...</td></tr>
    </tbody>
  </table>

  <script>
    const tbody = document.getElementById("live-body");

    function renderLiveData() {
      const opener = window.opener;
      if (!opener || !opener.patientsData) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999;">No data available</td></tr>';
        return;
      }

      const patients = opener.patientsData;
      const priorityOrder = { emergency: 4, urgent: 3, normal: 2, low: 1 };

      const sorted = [...patients].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999;">No patients in queue</td></tr>';
        return;
      }

      tbody.innerHTML = sorted.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td class="${p.priority}">${p.priority.toUpperCase()}</td>
        </tr>
      `).join('');
    }

    // Update every 3 seconds
    renderLiveData();
    setInterval(renderLiveData, 3000);
  </script>
</body>
</html>
