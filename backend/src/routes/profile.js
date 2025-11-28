// profile.js

// ✅ Avoid redeclaring token
// Assumes token is already declared in config.js

async function saveProfile() {
  const email = document.getElementById('profileEmail').value;
  const name = document.getElementById('profileName').value;
  const phone = document.getElementById('profilePhone').value;
  const role = document.getElementById('profileRole').value;
  const position = document.getElementById('profilePosition').value;

  const profileData = { email, name, phone, role, position };

  try {
    const res = await fetch(`${API}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const result = await res.json();
    document.getElementById('profileMsg').textContent = result.message || 'Saved!';
  } catch (err) {
    document.getElementById('profileMsg').textContent = 'Save failed: ' + err.message;
  }
}
