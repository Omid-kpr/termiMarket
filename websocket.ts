import WebSocket from "ws";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function connectToBitpin(onMessage: (data: any) => void) {
  const ws = new WebSocket("wss://ws.bitpin.ir");

  let lastPongAt = Date.now();
  const PING_INTERVAL = 20000;
  const TIMEOUT = 20000;

  const sendPing = () => {
    try {
      ws.send(JSON.stringify({ message: "PING" }));
      console.log("testing connection...");
    } catch (err) {
      console.log("Failed to start testing:", err);
    }
  };

  const interval = setInterval(async () => {
    const now = Date.now();
    const elapsed = now - lastPongAt;

    if (elapsed > TIMEOUT) {
      console.log("server did not respond in time. Closing connection...");
      clearInterval(interval);
      ws.close();

      console.log("⏱️ Waiting for 2s before reconnect...");
      await delay(2000);
      connectToBitpin(onMessage); // reconnect
    } else {
      sendPing();
    }
  }, PING_INTERVAL + 500);

  ws.on("open", () => {
    console.log("WebSocket connected");
    sendPing(); // kickstart first ping
  });

  ws.on("message", (data: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.message === "PONG") {
        console.log("connection is Live");
        lastPongAt = Date.now();
      } else if (msg.event === "matches_update") {
        onMessage(msg);
      } else {
        console.log("Unhandled message:", msg);
      }
    } catch (err) {
      console.log("Failed to parse message:", err);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket closed. Clearing health check.");
    clearInterval(interval);
  });

  return ws;
}
