
emailjs.init("3WQTWVJ9etTPOMg8w"); 

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

  // Show loading state (optional)
  const submitBtn = form.querySelector('.btn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // Send email using EmailJS
  emailjs.send(
    "service_33x9sv9",    
    "template_c18igii",   
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
