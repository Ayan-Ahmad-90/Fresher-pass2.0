import { useState } from "react";
import axios from "axios";
import QRScanner from "../components/Scanner"; // <-- NEW Scanner

export default function VerifyPage() {
  const [status, setStatus] = useState({
    state: "idle",
    message: "Point camera at QR",
    registration: null,
  });

  const handleScan = async (code) => {
    if (!code) return;

    try {
      const res = await axios.post("http://localhost:5000/verify", { id: code });
      const data = res.data;

      if (data.status === "SUCCESS" || data.status === "verified") {
        setStatus({
          state: "success",
          message: "Successfully Verified",
          registration: data.registration ?? data.reg ?? null,
        });
      } else if (data.status === "ALREADY" || data.status === "already") {
        setStatus({
          state: "warning",
          message: "Already Verified",
          registration: data.registration ?? data.reg ?? null,
        });
      } else {
        setStatus({
          state: "error",
          message: "Not Found / Invalid QR",
          registration: null,
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        state: "error",
        message: "Server error",
        registration: null,
      });
    }
  };

  const colorFor = (s) =>
    s === "success"
      ? "#10b981"
      : s === "warning"
      ? "#f59e0b"
      : s === "error"
      ? "#ef4444"
      : "#fff";

  return (
    <div className="card">
      <h2>Verify FresherPass</h2>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "4/3",
            borderRadius: 8,
            overflow: "hidden",
            border: "4px solid var(--teal)",
          }}
        >
          {/* 🔥 REPLACED OLD QrReader WITH NEW SCANNER */}
          <QRScanner onScan={handleScan} />
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: colorFor(status.state),
              color: status.state === "idle" ? "#111" : "#fff",
            }}
          >
            <h3>{status.message}</h3>

            {status.registration && (
              <div style={{ marginTop: 12, textAlign: "left" }}>
                <p>
                  <strong>ID:</strong> {status.registration.id}
                </p>
                <p>
                  <strong>Name:</strong> {status.registration.name}
                </p>
                <p>
                  <strong>College:</strong> {status.registration.college}
                </p>
                <p>
                  <strong>Verified At:</strong>{" "}
                  {status.registration.verifiedAt ??
                    status.registration.verified_at ??
                    "N/A"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
