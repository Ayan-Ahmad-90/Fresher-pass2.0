import React from "react";
import QRCode from "qrcode.react";

const QRDisplay = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Your QR Code:</h3>
      <QRCode value={JSON.stringify(data)} size={200} />
    </div>
  );
};

export default QRDisplay;
