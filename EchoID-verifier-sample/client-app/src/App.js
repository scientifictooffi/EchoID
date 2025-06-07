import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import SuccessPage from "./SuccessPage";
import "./App.css";

const PROOF_OPTIONS = [
  {
    label: "Proof of Life",
    request: {
      id: 1,
      circuitId: "credentialAtomicQueryV3-beta.1",
      query: {
        allowedIssuers: ["*"],
        type: "AnimaProofOfLife",
        context:
          "https://raw.githubusercontent.com/anima-protocol/claims-polygonid/main/schemas/json-ld/pol-v1.json-ld",
      },
    },
  },
  {
    label: "Age Over 18",
    request: {
      id: 1,
      circuitId: "credentialAtomicQueryV3-beta.1",
      query: {
        allowedIssuers: ["*"],
        type: "KYCAgeCredential",
        context:
          "https://raw.githubusercontent.com/iden3/protocols/master/polygonid/examples/ageCredential/schema.json-ld",
        // You could also add numeric conditions here if desired,
        // e.g. credentialSubject: { birthDate: { lt: 20060101 } }
      },
    },
  },
  {
    label: "Membership Proof",
    request: {
      id: 1,
      circuitId: "credentialAtomicQueryV3-beta.1",
      query: {
        allowedIssuers: ["*"],
        type: "DAOAccessCredential",
        context: "https://example.com/schemas/daoAccess.json-ld",
      },
    },
  },
];

function App() {
  const [baseRequest, setBaseRequest] = useState(null);
  const [error, setError] = useState();
  const [selectedProof, setSelectedProof] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [isVerified, setIsVerified] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [callbackResponse, setCallbackResponse] = useState(null);
  const [requestWithScope, setRequestWithScope] = useState(null);

  // Function to handle proof submission
  const handleProofSubmission = useCallback(
    async (proof) => {
      console.log("About to call callback with proof:", proof);
      setLoading(true);
      setVerificationStatus("processing");

      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8080"
          }/api/callback?sessionId=${currentSessionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(proof),
          }
        );

        const data = await response.json();
        console.log("Got JSON back from /api/callback:", data);

        // Update verification status immediately
        setCallbackResponse(data);
        setVerificationStatus("success");
        setIsVerified(true);
      } catch (error) {
        console.error("Fetch error:", error);
        setCallbackResponse({
          status: "error",
          message: "Network error or server unreachable.",
        });
        setVerificationStatus("error");
      } finally {
        setLoading(false);
      }
    },
    [currentSessionId]
  );

  // Add event listeners for proof events
  useEffect(() => {
    console.log("Setting up proof event listeners");

    const handleProofEvent = (event) => {
      console.log("Proof event received:", event);
      const proofData = event.detail || event.data;
      console.log("Processing proof data:", proofData);
      handleProofSubmission(proofData);
    };

    window.addEventListener("proofGenerated", handleProofEvent);
    window.addEventListener("proofReceived", handleProofEvent);

    // Also listen for postMessage events
    const handleMessage = (event) => {
      console.log("Message event received:", event);
      if (
        event.data &&
        (event.data.type === "proofGenerated" ||
          event.data.type === "proofReceived")
      ) {
        console.log("PostMessage proof event received");
        handleProofEvent(event);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("proofGenerated", handleProofEvent);
      window.removeEventListener("proofReceived", handleProofEvent);
      window.removeEventListener("message", handleMessage);
    };
  }, [handleProofSubmission]);

  // Handle request scope updates when proof type is selected
  useEffect(() => {
    if (selectedProof && baseRequest) {
      const request = JSON.parse(JSON.stringify(baseRequest));
      request.body.scope = [selectedProof.request];
      console.log("Generated request with scope:", request);

      if (request.body?.sessionId) {
        setCurrentSessionId(request.body.sessionId);
      }

      setRequestWithScope(request);
      // Reset verification state when new proof is selected
      setVerificationStatus("idle");
      setShowNotification(false);
      setCallbackResponse(null);
      setIsVerified(false);
    }
  }, [selectedProof, baseRequest]);

  // Fetch the initial auth request
  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8080"
          }/api/sign-in`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log("Received auth request:", json);
        setBaseRequest(json);
        if (json.body?.sessionId) {
          setCurrentSessionId(json.body.sessionId);
        }
      } catch (err) {
        console.error("Failed to load auth request:", err);
        setError("Failed to load auth request");
      }
    }
    fetchAuth();
  }, []);

  // Log modal state changes
  useEffect(() => {
    console.log("Modal visibility changed:", {
      showNotification,
      verificationStatus,
      notificationMessage,
      currentSessionId,
      isVerified,
    });
  }, [
    showNotification,
    verificationStatus,
    notificationMessage,
    currentSessionId,
    isVerified,
  ]);

  // Poll for verification status
  useEffect(() => {
    let pollInterval;

    async function checkVerificationStatus() {
      if (!currentSessionId) return;

      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8080"
          }/api/status?sessionId=${currentSessionId}`
        );

        if (!response.ok) {
          console.error("Status check failed:", response.status);
          return;
        }

        const result = await response.json();
        console.log("Status check result:", result);

        if (result.status === "verified") {
          console.log("Verification completed successfully");
          setVerificationStatus("success");
          setCallbackResponse(result);
          setNotificationMessage("Your proof has been verified successfully!");
          setIsVerified(true);
          setShowNotification(true);
          clearInterval(pollInterval);
        } else if (result.status === "pending") {
          setVerificationStatus("processing");
          setShowNotification(true);
          setNotificationMessage("Processing your proof...");
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    }

    if (currentSessionId && !isVerified) {
      console.log(
        "Starting verification polling for session:",
        currentSessionId
      );
      checkVerificationStatus(); // Check immediately
      pollInterval = setInterval(checkVerificationStatus, 2000); // Then every 2 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentSessionId, isVerified]);

  // Show success page if verified
  if (isVerified) {
    return <SuccessPage />;
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button
          className="action-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!baseRequest) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">Verify with Echo ID</div>

      {/* Proof selection */}
      <div className="subheader">Choose a proof type:</div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {PROOF_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            className="action-button"
            onClick={() => setSelectedProof(opt)}
            disabled={loading || verificationStatus === "success"}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {selectedProof && requestWithScope && (
        <>
          {/* QR code */}
          <div className="subheader">
            Scan this QR code with your mobile wallet:
          </div>
          <div id="qrcode" style={{ position: "relative" }}>
            <QRCodeCanvas
              value={JSON.stringify(requestWithScope)}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
        </>
      )}

      {/* Verification Steps Container */}
      <div className="verification-steps">
        <div className="step-container">
          {/* Step 1: Select Proof Type */}
          <div className={`step ${selectedProof ? "completed" : "current"}`}>
            <div className="step-indicator">
              <div className="step-number">1</div>
              {selectedProof && <span className="check">✓</span>}
            </div>
            <div className="step-content">
              <h4>Select Proof Type</h4>
              <p>
                {selectedProof
                  ? selectedProof.label
                  : "Choose a proof type above"}
              </p>
            </div>
          </div>

          {/* Step 2: Scan QR Code */}
          <div
            className={`step ${
              loading || verificationStatus === "success"
                ? "completed"
                : selectedProof
                ? "current"
                : ""
            }`}
          >
            <div className="step-indicator">
              <div className="step-number">2</div>
              {(loading || verificationStatus === "success") && (
                <span className="check">✓</span>
              )}
            </div>
            <div className="step-content">
              <h4>Scan QR Code</h4>
              <p>
                {loading || verificationStatus === "success"
                  ? "QR code scanned"
                  : requestWithScope
                  ? "Scan the QR code with your wallet"
                  : "Select a proof type first"}
              </p>
            </div>
          </div>

          {/* Step 3: Verify Proof */}
          <div
            className={`step ${
              verificationStatus === "success"
                ? "completed"
                : loading
                ? "current"
                : ""
            }`}
          >
            <div className="step-indicator">
              <div className="step-number">3</div>
              {verificationStatus === "success" && (
                <span className="check">✓</span>
              )}
            </div>
            <div className="step-content">
              <h4>Verify Proof</h4>
              <p>
                {verificationStatus === "success"
                  ? "Verification successful!"
                  : loading
                  ? "Processing verification..."
                  : "Waiting for proof submission"}
              </p>
              {loading && <div className="loading-dot-pulse"></div>}
            </div>
          </div>

          {/* Verification Details */}
          {verificationStatus === "success" && callbackResponse && (
            <div className="verification-success">
              <div className="success-message">
                <span className="success-icon">✓</span>
                Verification Complete
              </div>
              <div className="success-details">
                <p>
                  <strong>Session ID:</strong> {callbackResponse.sessionId}
                </p>
                {callbackResponse.message && (
                  <p>
                    <strong>Message:</strong> {callbackResponse.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Notification Container */}
      {showNotification && (
        <div className="notification-container">
          <div className="notification-content">
            <div className="notification-header">
              <h3>
                {verificationStatus === "processing" ? (
                  <>
                    <span className="status-icon processing">⏳</span>
                    Processing Verification
                  </>
                ) : verificationStatus === "success" ? (
                  <>
                    <span className="status-icon success">✓</span>
                    Verification Successful
                  </>
                ) : (
                  <>
                    <span className="status-icon error">⚠️</span>
                    Verification Error
                  </>
                )}
              </h3>
              <button
                className="close-button"
                onClick={() => setShowNotification(false)}
              >
                ×
              </button>
            </div>
            <p className="notification-message">{notificationMessage}</p>
            {callbackResponse && (
              <div className="proof-details">
                <div className="session-id">
                  <strong>Session ID:</strong> {callbackResponse.sessionId}
                </div>
                {callbackResponse.proof && (
                  <pre className="proof-data">
                    {JSON.stringify(callbackResponse.proof, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          min-height: 100vh;
          position: relative;
        }

        .header {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .subheader {
          font-size: 18px;
          margin: 20px 0;
        }

        .action-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: #4CAF50;
          color: white;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }

        .action-button:hover:not(:disabled) {
          background-color: #45a049;
        }

        .action-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error {
          color: red;
          margin: 20px 0;
        }

        #qrcode {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .notification-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 400px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideUp 0.3s ease-out;
        }

        .notification-content {
          padding: 16px;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .notification-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-icon {
          font-size: 18px;
        }

        .status-icon.processing { color: #2196F3; }
        .status-icon.success { color: #4CAF50; }
        .status-icon.error { color: #f44336; }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          color: #666;
        }

        .notification-message {
          margin: 8px 0;
          color: #666;
        }

        .proof-details {
          margin-top: 12px;
          text-align: left;
        }

        .session-id {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .proof-data {
          background-color: #f5f5f5;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
          margin: 0;
          max-height: 100px;
          overflow-y: auto;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .verification-steps {
          margin: 20px auto;
          max-width: 500px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .step-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          border-radius: 8px;
          background: #f5f5f5;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .step.current {
          background: #e3f2fd;
          opacity: 1;
          border-left: 4px solid #2196F3;
        }

        .step.completed {
          background: #e8f5e9;
          opacity: 1;
          border-left: 4px solid #4CAF50;
        }

        .step-indicator {
          position: relative;
          margin-right: 16px;
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #999;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .step.current .step-number {
          background: #2196F3;
        }

        .step.completed .step-number {
          background: #4CAF50;
        }

        .check {
          position: absolute;
          right: -4px;
          bottom: -4px;
          width: 16px;
          height: 16px;
          background: #4CAF50;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .step-content {
          flex: 1;
        }

        .step-content h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .step-content p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .loading-dot-pulse {
          margin-top: 8px;
          display: inline-block;
          position: relative;
          width: 10px;
          height: 10px;
          background-color: #2196F3;
          border-radius: 50%;
          animation: dot-pulse 1s infinite;
        }

        .verification-success {
          margin-top: 16px;
          padding: 16px;
          background: #e8f5e9;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2e7d32;
          margin-bottom: 12px;
        }

        .success-icon {
          color: #4CAF50;
          font-size: 20px;
        }

        .success-details {
          font-size: 14px;
          color: #666;
        }

        .success-details p {
          margin: 4px 0;
        }

        @keyframes dot-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default App;
