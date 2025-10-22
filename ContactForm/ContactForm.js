
  const form = document.getElementById('contact-form');
  const popup = document.getElementById('thankyou-popup');
  const closePopup = document.getElementById('close-popup');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // prevent page reload
    popup.style.display = 'flex'; // show popup
    form.reset(); // optional: clear form fields
  });

  closePopup.addEventListener('click', function () {
    popup.style.display = 'none'; // hide popup
  });

  // Optional: close popup when clicking outside it
  window.addEventListener('click', function (e) {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });

  // Toggle mobile menu
const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  navLinks.classList.toggle("show");
});

