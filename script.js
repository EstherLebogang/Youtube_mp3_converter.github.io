    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("converter-form");
      const urlInput = document.getElementById("youtube-url");
      const convertBtn = document.getElementById("convert-btn");
      const loader = document.getElementById("loader");
      const result = document.getElementById("result");
      const themeToggle = document.getElementById("theme-toggle");
      const themeIcon = themeToggle.querySelector('i');

      // Initialize theme
      if (!localStorage.getItem("theme")) {
        localStorage.setItem("theme", "dark");
      }
      if (localStorage.getItem("theme") === "light") {
        document.body.classList.remove("dark-mode");
        themeIcon.className = "fas fa-moon";
      } else {
        document.body.classList.add("dark-mode");
        themeIcon.className = "fas fa-sun";
      }

      // Toggle light/dark mode
      themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
      });

      function showLoader(show) {
        loader.style.display = show ? "block" : "none";
        convertBtn.disabled = show;
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();

        if (!url) {
          result.innerHTML = "Please enter a YouTube URL.";
          result.className = "result error show";
          return;
        }

        showLoader(true);
        result.className = "result";
        result.innerHTML = "";

        try {
          const response = await fetch("http://localhost:4000/api/download/mp3", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });

          const data = await response.json();

          if (data.error) {
            result.innerHTML = `❌ Failed to convert: ${data.error}`;
            result.className = "result error show";
          } else if (data.file) {
            result.innerHTML = `
              ✅ Conversion successful!<br />
              <a href="${data.file}" download class="download-link">Download MP3</a>
            `;
            result.className = "result success show";
          } else {
            result.innerHTML = "❌ Unknown error occurred.";
            result.className = "result error show";
          }
        } catch (err) {
          result.innerHTML = `❌ Error: ${err.message}`;
          result.className = "result error show";
        } finally {
          showLoader(false);
        }
      });
    });