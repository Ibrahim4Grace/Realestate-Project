
// Wait for the page to load
document.addEventListener("DOMContentLoaded", function () {
  const enquiryForm = document.getElementById("enquiryForm");
  const thankYouMessage = document.getElementById("thankYouMessage");

  // Add an event listener to the form submission
  enquiryForm.addEventListener("submit", function (event) {
    // The event.preventDefault() is removed here so that the form can submit.
    // It will allow the form data to be sent to your server.
    
    // Optional: Hide the form after submission
    enquiryForm.style.display = "none";

    // Show the "thank you" message
    thankYouMessage.style.display = "block";
  });
});


  

