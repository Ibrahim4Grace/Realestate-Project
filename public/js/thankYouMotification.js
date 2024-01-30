'use strict';

document.addEventListener("DOMContentLoaded", function () {
  const enquiryForm = document.getElementById("enquiryForm");
  const thankYouMessage = document.getElementById("thankYouMessage");

  enquiryForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
          const response = await fetch('/contactUsPagePost', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  flname: document.getElementById('name').value,
                  email: document.getElementById('email').value,
                  contactNumber: document.getElementById('number').value,
                  message: document.getElementById('message').value,
              }),
          });

          if (response.ok) {
              const responseData = await response.json();
              enquiryForm.style.display = "none";
              thankYouMessage.style.display = "block";
              enquiryForm.reset();
              return false; // Prevent further processing and displaying the JSON response
          } else {
              console.error('Error:', response.statusText);
              // Handle error cases, e.g., display an error message to the user
          }
      } catch (error) {
          console.error('Error:', error);
          // Handle unexpected errors
      }
  });
});
