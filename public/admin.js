document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const loginResultDiv = document.getElementById("loginResult");
  if (response.ok) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminSection").style.display = "block";
  } else {
    const error = await response.json();
    loginResultDiv.innerHTML = `<p style="color: red;">Fehler: ${error.error}</p>`;
  }
});

document
  .getElementById("createShipmentForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("status").value;
    const ort = document.getElementById("ort").value;
    const datum = document.getElementById("datum").value;
    const uhrzeit = document.getElementById("uhrzeit").value;

    const response = await fetch("/admin/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, ort, datum, uhrzeit }),
    });

    const resultDiv = document.getElementById("result");
    if (response.ok) {
      const data = await response.json();
      resultDiv.innerHTML = `<p style="color: green;">Sendung erfolgreich erstellt! Tracking-Nummer: ${data.number}</p>`;
    } else {
      const error = await response.json();
      resultDiv.innerHTML = `<p style="color: red;">Fehler: ${error.error}</p>`;
    }
  });

document
  .getElementById("updateShipmentForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const number = document.getElementById("updateNumber").value;
    const status = document.getElementById("updateStatus").value;
    const ort = document.getElementById("updateOrt").value;
    const datum = document.getElementById("updateDatum").value;
    const uhrzeit = document.getElementById("updateUhrzeit").value;

    const response = await fetch("/admin/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, status, ort, datum, uhrzeit }),
    });

    const resultDiv = document.getElementById("result");
    if (response.ok) {
      resultDiv.innerHTML = `<p style="color: green;">Sendung erfolgreich aktualisiert!</p>`;
    } else {
      const error = await response.json();
      resultDiv.innerHTML = `<p style="color: red;">Fehler: ${error.error}</p>`;
    }
  });
