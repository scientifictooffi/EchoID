import React from "react";
import "./App.css";

function SuccessPage() {
  return (
    <div className="container">
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h1>Verification Successful!</h1>
        <p>Your proof has been verified successfully.</p>
        <button
          className="action-button"
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
