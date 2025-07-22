import { fetchSymbols } from "./symbols";
import { connectToBitpin } from "./websocket";
import { updateCandles, getCandles } from "./candles";
import { BitpinMatch, BitpinMatchesUpdateMessage } from "./types/types";

interface Match { }
(async () => {
  const symbols = await fetchSymbols();
  console.log(
    "Available Symbols:",
    symbols.map((s: string) => s),
  );

  connectToBitpin((msg: BitpinMatchesUpdateMessage) => {
    console.log("Received Message inside index:", msg);
    msg.matches.forEach((match: BitpinMatch) => {
      updateCandles(
        Number(match.price),
        Number(match.base_amount),
        Math.floor(new Date(msg.event_time).getTime() / 1000),
      );
    });
    const recent = getCandles("1m").slice(-1)[0];
    console.log("Latest 1m Candle:", recent);
  });
})();
