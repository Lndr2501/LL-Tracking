document
  .getElementById("trackingForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const trackingNumber = document.getElementById("trackingNumber").value;

    const response = await fetch(`/track/${trackingNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resultDiv = document.getElementById("result");
    if (response.ok) {
      const data = await response.json();
      resultDiv.innerHTML = data
        .reverse()
        .map((entry, index) => {
          let statusText = entry.status;
          if (entry.ort && entry.uhrzeit) {
            statusText += ` in ${entry.ort}`;
          } else if (entry.ort) {
            statusText += ` in ${entry.ort}`;
          } else if (entry.uhrzeit) {
            statusText += ``;
          }

          // Datum und Uhrzeit formatieren
          const datum = new Date(entry.datum);
          const formattedDate = datum.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const formattedTime = entry.uhrzeit;

          return `
                <div class="status-entry ${index === 0 ? "latest" : ""}">
                    <p>${statusText}</p>
                    <p style="font-size: 0.9em; color: #aaa;">${formattedDate} ${formattedTime}</p>
                </div>
            `;
        })
        .join("");
    } else {
      resultDiv.innerHTML = `<p style="color: red;">Tracking-Nummer nicht gefunden!</p>`;
    }
  });
