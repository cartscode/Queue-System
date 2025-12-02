// Initialize EmailJS with your Public Key
emailjs.init("jd6G2cYaW-n0Ewv0h"); 

const form = document.getElementById('contact-form');
const popup = document.getElementById('thankyou-popup');
const closePopup = document.getElementById('close-popup');

form.addEventListener('submit', function (e) {
  e.preventDefault(); // prevent page reload

  // Get form data
  const formData = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value
  };

  // Show loading state
  const submitBtn = form.querySelector('.btn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // Send email using EmailJS with your correct Service ID and Template ID
  emailjs.send(
    "service_lhsct9g",      // Your Service ID
    "template_8079x7e",     // Your Template ID
    formData
  )
  .then(function(response) {
    console.log('SUCCESS!', response.status, response.text);
    
    // Show success popup
    popup.style.display = 'flex';
    form.reset(); // clear form fields
    
    // Reset button
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  })
  .catch(function(error) {
    console.log('FAILED...', error);
    
    // Show error message
    alert('Oops! Something went wrong. Please try again or contact us directly via email.');
    
    // Reset button
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  });
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