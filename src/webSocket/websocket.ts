import WebSocket from "ws";
import { Match } from "../types/types";
import { updateCandles } from "../logic/candles";
import { dlog } from "../ui/dashboard";

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
      dlog("{red-fg}Failed to start testing:{/red-fg}", e);
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
      dlog("{/green-fg}sub request sent{/green-fg}");
    } catch (e) {
      dlog("{red-fg}failed to subscribe: {/red-fg}", e);
    }
  };

  const interval = setInterval(async () => {
    const now = Date.now();
    const elapsed = now - lastPongAt;

    if (elapsed > TIMEOUT) {
      dlog(
        "{red-fg}server did not respond in time. Closing connection...{/red-fg}",
      );
      clearInterval(interval);
      ws.close();

      dlog("{yellow-fg}Waiting for 2s before reconnect...{/yellow-fg}");
      await delay(2000);
      connectToBitpin(onTrade);
    } else {
      sendPing();
    }
  }, PING_INTERVAL);

  ws.on("open", () => {
    dlog("{green-fg}WebSocket connected{/green-fg}");
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
        dlog(
          `{yellow-fg}data recieved at ${new Date().toString()}{/yellow-fg}`,
        );
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
        dlog("{yellow-fg}subscripton seccessful{/yellow-fg}");
      } else {
        if (msg.event !== "market_data") {
          dlog("{blue-fg}Unhandled message:{/blue-fg}", msg);
        }
      }
    } catch (err) {
      dlog("{red-fg}Failed to parse message:{/red-fg}", err);
    }
  });
  ws.on("error", (error) => {
    dlog("{red-fg}WebSocket error:{/red-fg}", error);
  });
  ws.on("close", () => {
    dlog("{red-fg}WebSocket closed. Clearing health check.{/red-fg}");
    clearInterval(interval);
  });

  return ws;
}
