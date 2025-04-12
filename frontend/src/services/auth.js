const API = "http://localhost:8000"; // Replace if deployed

export const loginUser = async ({ username, password }) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: "Server error" };
  }
};

export const registerUser = async ({ username, email, password }) => {
  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: "Server error" };
  }
};
