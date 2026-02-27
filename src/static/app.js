document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities(showToast = false) {
    try {
      showSpinner(true);
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and reset select options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section (show list or placeholder text with delete icons)
        let participantsSection;
        if (details.participants && details.participants.length > 0) {
          const listItems = details.participants
            .map(
              (p) =>
                `<li><span class="participant-name">${p}</span> <span class="remove-btn" data-activity="${name}" data-email="${p}" title="Remove">&#x274C;</span></li>`
            )
            .join("\n");
          participantsSection = `
            <div class="participants">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${listItems}
              </ul>
            </div>
          `;
        } else {
          participantsSection = `
            <div class="participants empty">
              <em>No participants yet</em>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // attach delete handlers after elements exist
      document.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const activity = btn.getAttribute("data-activity");
          const email = btn.getAttribute("data-email");
          try {
            const res = await fetch(
              `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(
                email
              )}`,
              { method: "DELETE" }
            );
            const json = await res.json();
            if (res.ok) {
              messageDiv.textContent = json.message;
              messageDiv.className = "success";
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
              await fetchActivities(true);
            } else {
              messageDiv.textContent = json.detail || "Unable to remove participant";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }
          } catch (err) {
            console.error("Error removing participant", err);
            messageDiv.textContent = "Failed to remove participant.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);    } finally {
      showSpinner(false);
      if (showToast) {
        messageDiv.textContent = "Activities list updated";
        messageDiv.className = "info";
        messageDiv.classList.remove("hidden");
        setTimeout(() => messageDiv.classList.add("hidden"), 3000);
      }    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // refresh activities to reflect new participant and availability
        await fetchActivities(true);
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // spinner helper
  function showSpinner(flag) {
    const spinner = document.getElementById("spinner");
    if (spinner) {
      spinner.classList.toggle("hidden", !flag);
    }
  }

  // Initialize app
  fetchActivities();
});
