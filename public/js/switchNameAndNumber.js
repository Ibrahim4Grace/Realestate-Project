const agentNameDropdown = document.getElementById("agentName");
const agentNumberInput = document.getElementById("agentNumber");

// Fetch the list of agents from the server
fetch('/api/agent')
  .then(response => response.json())
  .then(serverAgents => {
    // Attach an event listener to update the agent number
    agentNameDropdown.addEventListener("change", function() {
      const selectedAgentName = agentNameDropdown.value;
      const selectedAgentInfo = serverAgents.find(agent => agent.agentName === selectedAgentName);
      if (selectedAgentInfo) {
        agentNumberInput.value = selectedAgentInfo.agentNumber;
      } else {
        agentNumberInput.value = ''; // Clear the agent number input
      }
    });
  })
  .catch(error => {
    console.error("Error fetching agent data:", error);
  });
