const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

// Get the host URL from environment variable or default to localhost
const HOST_URL = process.env.HOST_URL || "http://localhost:8080";
console.log(`Using host URL: ${HOST_URL}`);

// Store auth requests and proofs in memory
const requestMap = new Map();
const proofMap = new Map();

// Configure CORS and JSON parsing
app.use(
  express.json({
    type: ["application/json", "application/iden3comm-plain-json"],
    limit: "5mb",
    strict: false,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.get("/api/sign-in", (req, res) => {
  console.log("get Auth Request");
  const sessionId = Date.now().toString();
  const authRequest = {
    id: sessionId,
    typ: "application/iden3comm-plain-json",
    type: "https://iden3-communication.io/authorization/1.0/request",
    thid: sessionId,
    body: {
      callbackUrl: `${HOST_URL}/api/callback?sessionId=${sessionId}`,
      reason: "Proof verification",
      scope: [],
      sessionId: sessionId,
    },
  };

  // Store auth request in map
  requestMap.set(sessionId, { verified: false, proof: null });
  console.log("Auth request created for session:", sessionId);
  console.log("Current sessions in map:", Array.from(requestMap.keys()));

  return res.status(200).json(authRequest);
});

app.post("/api/callback", async (req, res) => {
  console.log("=== /api/callback hit ===");

  // Get both session IDs - from URL and from the request thread ID
  const urlSessionId = req.query.sessionId;
  const threadId = req.body.thid;
  const sessionId = urlSessionId || threadId;

  console.log("Session ID:", sessionId);
  console.log("Raw request body:", JSON.stringify(req.body, null, 2));

  // Extract proof and signals from the request body
  let proofData = {};
  let pubSignals = [];

  if (req.body.body && req.body.body.scope && req.body.body.scope[0]) {
    const scope = req.body.body.scope[0];
    proofData = scope.proof || {};
    pubSignals = scope.pub_signals || [];
  } else if (req.body.proof) {
    proofData = req.body.proof;
    pubSignals = req.body.pub_signals || [];
  }

  // Store the proof data in proofMap
  if (sessionId) {
    proofMap.set(sessionId, {
      proof: proofData,
      publicSignals: pubSignals,
      timestamp: Date.now(),
      status: "verified", // For testing, we assume all proofs are valid
    });
    console.log(`Stored proof for session ${sessionId}`);
  } else {
    console.warn(`Received callback without valid session ID`);
  }

  // Always return 200 with the proof data
  return res.status(200).json({
    status: "success",
    message: "Proof stored. Front end may poll /api/status to see this.",
    sessionId,
  });
});

// Status endpoint to check verification status
app.get("/api/status", (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({
      status: "error",
      error: "sessionId required",
    });
  }

  if (proofMap.has(sessionId)) {
    const { proof, publicSignals, timestamp, status } = proofMap.get(sessionId);
    return res.status(200).json({
      status: "verified", // custom flag indicating proof arrived
      proof,
      publicSignals,
      receivedAt: timestamp,
      sessionId,
    });
  } else {
    // We have not yet seen a callback for that sessionId
    return res.status(200).json({
      status: "pending",
      message: "No proof received yet for this session.",
      sessionId,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on ${HOST_URL}`);
  console.log(`CORS enabled for all origins in development mode`);
});
