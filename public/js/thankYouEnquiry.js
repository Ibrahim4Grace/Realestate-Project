 'use strict';

 // Wait for the page to load
 document.addEventListener("DOMContentLoaded", function () {
   const formEnquiry = document.getElementById("formEnquiry");
   const enquiryMessage = document.getElementById("enquiryMessage");

   // Add an event listener to the form submission
   formEnquiry.addEventListener("submit", function (event) {
    
     // Optional: Hide the form after submission
     formEnquiry.style.display = "none";

     // Show the "thank you" message
     enquiryMessage.style.display = "block";
   });
 });
