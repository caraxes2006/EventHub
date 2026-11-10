import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../api/axios";

const SCANNER_ID = "qr-reader";

const CheckIn = () => {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const submitCode = async (code) => {
    setError("");
    setResult(null);
    try {
      const res = await api.post("/tickets/checkin", { qrCodeData: code });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    }
  };

  const startScanner = async () => {
    setError("");
    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => submitCode(decodedText),
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError("Could not access camera. You can still enter the ticket code manually below.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    submitCode(manualCode.trim());
    setManualCode("");
  };

  return (
    <div className="container">
      <h1 className="page-title">Ticket check-in</h1>
      <p className="muted">Scan an attendee's QR ticket, or enter the code manually.</p>

      <div className="card checkin-card">
        <div id={SCANNER_ID} className="qr-reader-box" />

        {!scanning ? (
          <button className="btn-primary" onClick={startScanner}>Start camera scan</button>
        ) : (
          <button className="btn-outline" onClick={stopScanner}>Stop scanning</button>
        )}

        <form className="manual-checkin" onSubmit={handleManualSubmit}>
          <input
            aria-label="Ticket code"
            placeholder="Or paste/enter ticket code manually"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button className="btn-primary" type="submit">Verify</button>
        </form>

        {result && (
          <div className="checkin-result success">
            <p><strong><CheckCircle2 size={18} style={{ verticalAlign: "-3px" }} aria-hidden="true" /> {result.message}</strong></p>
            <p>{result.ticket?.attendee?.name} — {result.ticket?.attendee?.email}</p>
            <p className="muted">{result.ticket?.event?.title}</p>
          </div>
        )}
        {error && (
          <div className="checkin-result error" role="alert">
            <XCircle size={18} style={{ verticalAlign: "-3px" }} aria-hidden="true" /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
