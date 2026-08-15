const PROPS = PropertiesService.getScriptProperties();

const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply({ ok: false, error: "EMPTY_REQUEST" });
    }

    const body = JSON.parse(e.postData.contents || "{}");
    const action = String(body.action || "");

    if (action === "verify") {
      return verifyCredential(body);
    }

    if (action === "issue") {
      return issueCredential(body);
    }

    if (action === "revoke") {
      return revokeCredential(body);
    }

    if (action === "session") {
      return inspectSession(body);
    }

    return reply({ ok: false, error: "UNKNOWN_ACTION" });

  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: "BAD_REQUEST" });
  }
}

function verifyCredential(body) {
  const token = String(body.token || "").trim();
  if (!token) return reply({ ok: false, error: "NO_TOKEN" });

  const raw = PROPS.getProperty("cred_" + token);
  if (!raw) return reply({ ok: false, error: "INVALID_CREDENTIAL" });

  let cred;
  try {
    cred = JSON.parse(raw);
  } catch {
    return reply({ ok: false, error: "CORRUPT_CREDENTIAL" });
  }

  if (cred.active !== true) {
    return reply({ ok: false, error: "REVOKED" });
  }

  const clearance = normalizeClearance(cred.clearance);
  if (!clearance) {
    return reply({ ok: false, error: "INVALID_CLEARANCE" });
  }

  // Create a short-lived server-side session.
  const sessionToken = makeToken();
  const expires = Date.now() + SESSION_TTL_MS;

  PROPS.setProperty(
    "session_" + sessionToken,
    JSON.stringify({
      clearance,
      expires
    })
  );

  return reply({
    ok: true,
    valid: true,
    clearance,
    sessionToken,
    expires
  });
}

function issueCredential(body) {
  const session = requireO5Session(body.sessionToken);
  if (!session.ok) return reply(session);

  const clearance = normalizeClearance(body.clearance);
  if (!clearance) {
    return reply({ ok: false, error: "INVALID_CLEARANCE" });
  }

  const token = makeToken();

  PROPS.setProperty(
    "cred_" + token,
    JSON.stringify({
      clearance,
      active: true,
      createdAt: Date.now()
    })
  );

  return reply({
    ok: true,
    token,
    clearance
  });
}

function revokeCredential(body) {
  const session = requireO5Session(body.sessionToken);
  if (!session.ok) return reply(session);

  const token = String(body.token || "").trim();
  if (!token) return reply({ ok: false, error: "NO_TOKEN" });

  const key = "cred_" + token;
  const raw = PROPS.getProperty(key);
  if (!raw) return reply({ ok: false, error: "INVALID_CREDENTIAL" });

  let cred;
  try {
    cred = JSON.parse(raw);
  } catch {
    return reply({ ok: false, error: "CORRUPT_CREDENTIAL" });
  }

  cred.active = false;
  cred.revokedAt = Date.now();
  PROPS.setProperty(key, JSON.stringify(cred));

  return reply({ ok: true, revoked: true });
}

function inspectSession(body) {
  const token = String(body.sessionToken || "").trim();
  const s = readSession(token);

  if (!s.ok) return reply(s);

  return reply({
    ok: true,
    clearance: s.clearance,
    expires: s.expires
  });
}

function requireO5Session(sessionToken) {
  const s = readSession(sessionToken);
  if (!s.ok) return s;

  if (s.clearance !== "O5") {
    return { ok: false, error: "O5_REQUIRED" };
  }

  return s;
}

function readSession(sessionToken) {
  const token = String(sessionToken || "").trim();
  if (!token) return { ok: false, error: "NO_SESSION" };

  const key = "session_" + token;
  const raw = PROPS.getProperty(key);

  if (!raw) return { ok: false, error: "INVALID_SESSION" };

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    PROPS.deleteProperty(key);
    return { ok: false, error: "CORRUPT_SESSION" };
  }

  if (Number(session.expires || 0) <= Date.now()) {
    PROPS.deleteProperty(key);
    return { ok: false, error: "SESSION_EXPIRED" };
  }

  const clearance = normalizeClearance(session.clearance);
  if (!clearance) {
    PROPS.deleteProperty(key);
    return { ok: false, error: "INVALID_SESSION_CLEARANCE" };
  }

  return {
    ok: true,
    clearance,
    expires: Number(session.expires)
  };
}

function normalizeClearance(value) {
  const v = String(value || "").trim().toUpperCase();

  if (v === "O5" || v === "05") return "O5";
  if (v === "L4" || v === "LEVEL 4") return "L4";
  if (v === "L3" || v === "LEVEL 3") return "L3";
  if (v === "L2" || v === "LEVEL 2") return "L2";
  if (v === "L1" || v === "LEVEL 1") return "L1";

  return "";
}

function makeToken() {
  // 64 hex-ish characters from two UUIDs with hyphens removed.
  return (
    Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "")
  );
}

function reply(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
