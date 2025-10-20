function toggleForms() {
  document.getElementById("loginForm").style.display =
    document.getElementById("loginForm").style.display === "none" ? "block" : "none";
  document.getElementById("registerForm").style.display =
    document.getElementById("registerForm").style.display === "none" ? "block" : "none";
}

function validateRegister(event) {
  event.preventDefault();

  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  toggleForms();
}

function goToDashboard(event) {
  event.preventDefault();
  window.location.href = "\Project in CC105\informationmanagement\Informationmanagement.html";
}

// ---- Hospital Walk Animation ----
const container = document.getElementById("hospital-container");
const maxWalkers = 7;
const walkers = [];
const spacing = 220; // 200px + 20px gap

function getRandomClass() {
  return Math.floor(Math.random() * 19); // 0–18
}

function createWalker(offset = 0) {
  const num = getRandomClass();
  const img = document.createElement("img");
  img.src = `img/patient${num}.png`; // <-- patient images must exist
  img.classList.add("patient-walker");
  img.dataset.index = num;

  img.style.left = (-220 - offset) + "px";
  container.appendChild(img);

  walkers.push(img);
  walkForward(img, num);
}

function walkForward(img, num) {
  const walkInterval = setInterval(() => {
    const currentLeft = parseFloat(img.style.left) || 0;
    img.style.left = (currentLeft + 40) + "px"; // step forward

    // When reaching center -> change into client
    if (currentLeft >= window.innerWidth / 2 - 100 && !img.dataset.converted) {
      img.src = `img/client${num}.png`; // <-- client images must exist
      img.dataset.converted = true;
    }

    // When exiting right side -> remove and respawn
    if (currentLeft > window.innerWidth) {
      clearInterval(walkInterval);
      container.removeChild(img);
      walkers.splice(walkers.indexOf(img), 1);
      createWalker(); // spawn replacement
    }
  }, 1000); // step every 1s
}

// Initialize walkers with spacing
for (let i = 0; i < maxWalkers; i++) {
  setTimeout(() => {
    createWalker(i * spacing);
  }, i * 800);
}
