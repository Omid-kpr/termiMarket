import WebSocket from "ws";
import { Match } from "./types/types";
import { updateCandles } from "./candles";
import { dlog } from "./dashboard";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function connectToBitpin(onTrade: (match: Match) => void) {
  const ws = new WebSocket("wss://ws.bitpin.ir");

  let lastPongAt = Date.now();
  const PING_INTERVAL = 19000;
  const TIMEOUT = 21000;

  const sendPing = () => {
    try {
      ws.send(JSON.stringify({ message: "PING" }));
      dlog("testing connection...");
    } catch (e) {
      dlog("Failed to start testing:", e);
    }
  };

  const subscribe = () => {
    try {
      ws.send(
        JSON.stringify({
          method: "sub_to_market_data",
          symbols: ["BTC_USDT", "BTC_IRT", "USDC_IRT"],
        }),
      );
      dlog("sub request sent");
    } catch (e) {
      dlog("failed to subscribe: ", e);
    }
  };

  const interval = setInterval(async () => {
    const now = Date.now();
    const elapsed = now - lastPongAt;

    if (elapsed > TIMEOUT) {
      dlog("server did not respond in time. Closing connection...");
      clearInterval(interval);
      ws.close();

      dlog("Waiting for 2s before reconnect...");
      await delay(2000);
      connectToBitpin(onTrade);
    } else {
      sendPing();
    }
  }, PING_INTERVAL);

  ws.on("open", () => {
    dlog("WebSocket connected");
    sendPing();
    subscribe();
  });

  ws.on("message", (data: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.message === "PONG") {
        dlog("connection is Live");
        lastPongAt = Date.now();
      } else if (msg.event === "matches_update") {
        dlog(msg);
        const trades = msg.matches as Match[];
        trades.forEach((match) => {
          const price = parseFloat(match.price);
          const volume = parseFloat(match.base_amount);
          const timestamp = msg.event_time;

          updateCandles(price, volume, timestamp);
          onTrade(match);
        });
      } else if (
        msg.message === "sub to markets ['BTC_USDT', 'BTC_IRT', 'USDC_IRT']"
      ) {
        dlog("subscripton seccessful");
      } else {
        if (msg.event !== "market_data") {
          dlog("Unhandled message:", msg);
        }
      }
    } catch (err) {
      dlog("Failed to parse message:", err);
    }
  });
  ws.on("error", (error) => {
    dlog("WebSocket error:", error);
  });
  ws.on("close", () => {
    dlog("WebSocket closed. Clearing health check.");
    clearInterval(interval);
  });

  return ws;
}
