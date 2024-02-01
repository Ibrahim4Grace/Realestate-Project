                              'use strict';
			// Wait for the page to load
            document.addEventListener("DOMContentLoaded", function () {
                const enquiryForm = document.getElementById("enquiryForm");
                const thankYouMessage = document.getElementById("thankYouMessage");
              
                enquiryForm.addEventListener("submit", async function (event) {
                    event.preventDefault();// Prevent the default form submission behavior
              
                    try {
                        const response = await fetch('/contactUsPagePost', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                flname: document.getElementById('flname').value,
                                email: document.getElementById('email').value,
                                contactNumber: document.getElementById('contactNumber').value,
                                message: document.getElementById('message').value,
                            }),
                        });
              
                        if (response.ok) {
                            const responseData = await response.text();
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
            
