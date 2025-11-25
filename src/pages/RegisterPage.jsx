import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [qr, setQr] = useState("");
  const [data, setData] = useState({ name:"", email:"", phone:"", college:"", course:"" });

  const submit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:5000/register", data);
    setQr(res.data.qr);
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={submit}>
        {Object.keys(data).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={data[key]}
            onChange={(e) => setData({ ...data, [key]: e.target.value })}
          />
        ))}
        <button>Submit</button>
      </form>

      {qr && <img src={qr} alt="QR Code" />}
    </div>
  );
}
