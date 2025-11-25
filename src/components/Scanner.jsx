import React, { useState } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";
import axios from "axios";

const Scanner = () => {
  const [status, setStatus] = useState({ state: "idle", message: "Point camera at QR", registration: null });

  const handleScan = async (result) => {
    if (!result) return;
    const code = result?.text ?? result;
    try {
      const res = await axios.post("http://localhost:5000/verify", { id: code });
      const data = res.data;

      if (data.status === "SUCCESS" || data.status === "verified") {
        setStatus({ state: "success", message: "Successfully Verified", registration: data.registration ?? data.reg ?? null });
      } else if (data.status === "ALREADY" || data.status === "already") {
        setStatus({ state: "warning", message: "Already Verified", registration: data.registration ?? data.reg ?? null });
      } else if (data.status === "INVALID" || res.status === 404) {
        setStatus({ state: "error", message: "Not Found / Invalid QR", registration: null });
      } else {
        setStatus({ state: "error", message: data.error || "Unknown response", registration: null });
      }
    } catch (err) {
      console.error(err);
      setStatus({ state: "error", message: "Server error", registration: null });
    }
  };

  const handleError = (err) => {
    console.error("Scanner error:", err);
    setStatus({ state: "error", message: "Camera error or permission denied", registration: null });
  };

  const colorFor = (s) =>
    s === "success" ? "#10b981" : s === "warning" ? "#f59e0b" : s === "error" ? "#ef4444" : "#fff";

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
          <QrScanner
            onResult={handleScan}
            onError={handleError}
            constraints={{ video: { facingMode: "environment" } }}
            style={{ width: "100%", height: "100%" }}
          />
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
                  <strong>Verified At:</strong> {status.registration.verifiedAt ?? status.registration.verified_at ?? "N/A"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
