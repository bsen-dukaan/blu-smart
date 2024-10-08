import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";

const app = new Hono();

const baseUrl = "https://chatbot.tracking.dev.blucgn.com";

async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API request failed:", errorText);
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return await response.json();
}

// Login API
app.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: "Username and password are required" }, 400);
  }

  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        username: username,
        password: password,
      },
    });

    const data = await handleApiResponse(response);
    return c.json(data);
  } catch (error) {
    console.error("Login request failed:", error);
    return c.json({ error: "Login failed", details: error.message }, 500);
  }
});

// Get Rides Information API
app.get("/getRides", async (c) => {
  const startRecord = c.req.query("startRecord");
  const count = c.req.query("count");
  const riderId = c.req.header("riderId");
  const rideType = c.req.header("rideType");
  const token = c.req.header("Authorization");

  if (!startRecord || !riderId || !rideType || !token) {
    return c.json({ error: "Missing required parameters or headers" }, 400);
  }

  try {
    const url = new URL(`${baseUrl}/api/v1/external/chat/getRides`);
    url.searchParams.append("startRecord", startRecord);
    if (count) url.searchParams.append("count", count);

    const response = await fetch(url, {
      headers: {
        Authorization: token,
        riderId: riderId,
        rideType: rideType,
      },
    });

    const data = await handleApiResponse(response);
    return c.json(data);
  } catch (error) {
    console.error("Get rides request failed:", error);
    return c.json(
      { error: "Failed to fetch rides", details: error.message },
      500
    );
  }
});

// Get RideAction Information API
app.get("/rideAction", async (c) => {
  const rideId = c.req.query("rideId");
  const driverId = c.req.query("driverId");
  const rideActionStr = c.req.query("rideActionStr");
  const rideRequestId = c.req.query("rideRequestId");
  const templateId = c.req.query("templateId");
  const templateKey = c.req.query("templateKey");
  const token = c.req.header("Authorization");

  if (!rideActionStr || !rideRequestId || !templateKey || !token) {
    return c.json({ error: "Missing required parameters or headers" }, 400);
  }

  try {
    const url = new URL(`${baseUrl}/api/v1/external/chat/info/RideAction`);
    if (rideId) url.searchParams.append("rideId", rideId);
    if (driverId) url.searchParams.append("driverId", driverId);
    url.searchParams.append("rideActionStr", rideActionStr);
    url.searchParams.append("rideRequestId", rideRequestId);
    if (templateId) url.searchParams.append("templateId", templateId);
    url.searchParams.append("templateKey", templateKey);

    const response = await fetch(url, {
      headers: {
        Authorization: token,
      },
    });

    const data = await handleApiResponse(response);
    return c.json(data);
  } catch (error) {
    console.error("Get ride action info request failed:", error);
    return c.json(
      { error: "Failed to fetch ride action info", details: error.message },
      500
    );
  }
});

export default app;
