import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/all").then(res => setRows(res.data));
  }, []);

  return (
    <div className="admin">
      <h2>Admin Dashboard</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Status</th><th>Created</th><th>Verified</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.phone}</td>
              <td>{r.status}</td>
              <td>{r.created_at}</td>
              <td>{r.verified_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
