import React, { useState } from "react";
import axios from "axios";

const RegistrationForm = () => {
  const [data, setData] = useState({ name: "", email: "", phone: "", college: "", course: "" });
  const [qr, setQr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", data);
      setQr(res.data.qr);
    } catch (err) {
      console.error(err);
      alert("Registration failed. Check console for details.");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={submit}>
        {Object.keys(data).map((key) => (
          <input
            key={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={data[key]}
            onChange={(e) => setData({ ...data, [key]: e.target.value })}
            required
          />
        ))}
        <button type="submit">Submit</button>
      </form>

      {qr && (
        <div style={{ marginTop: "1rem" }}>
          <img src={qr} alt="QR Code" />
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
