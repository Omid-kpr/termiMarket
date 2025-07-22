import { fetchSymbols } from "./symbols";
import { connectToBitpin } from "./websocket";
import { renderCandles, renderSymbols, renderTrade } from "./dashboard";

(async () => {
  const symbols = await fetchSymbols();
  renderSymbols(symbols);

  connectToBitpin(renderTrade);

  setInterval(() => {
    renderCandles();
  }, 1000);
})();
