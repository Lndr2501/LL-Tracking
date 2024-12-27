document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("trackingForm");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const trackingNumber = document.getElementById("trackingNumber").value;
    fetchTrackingData(trackingNumber);
  });

  // Funktion zum Abrufen der Tracking-Daten
  function fetchTrackingData(trackingNumber) {
    fetch(`/id?id=${trackingNumber}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          resultDiv.innerText = data.error;
        } else {
          resultDiv.innerHTML = `
            <p><strong>Sendungsnummer:</strong> ${data.number}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Ort:</strong> ${data.ort}</p>
            <p><strong>Datum:</strong> ${data.datum}</p>
            <p><strong>Uhrzeit:</strong> ${data.uhrzeit}</p>
          `;
        }
      })
      .catch((error) => {
        console.error("Fehler beim Abrufen der Sendungsdaten:", error);
        resultDiv.innerText = "Fehler beim Abrufen der Sendungsdaten";
      });
  }

  // Automatisch das Formular absenden, wenn die Seite mit einer Tracking-Nummer geladen wird
  const urlParams = new URLSearchParams(window.location.search);
  const trackingNumber = urlParams.get("id");
  if (trackingNumber) {
    document.getElementById("trackingNumber").value = trackingNumber;
    fetchTrackingData(trackingNumber);
  }
});
