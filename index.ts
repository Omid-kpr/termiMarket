import { fetchSymbols } from "./src/restApi/symbols";
import { connectToBitpin } from "./src/webSocket/websocket";
import {
  dlog,
  renderCandles,
  renderSymbols,
  renderTrade,
} from "./src/ui/dashboard";

(async () => {
  dlog("{green-fg}starting ...{/green-fg}");
  dlog(
    "{green-fg}because of the rules of the api every 15 seconds there will be a connection test so thats the testing connection ... & connection is live that you see{/green-fg}",
  );
  const symbols = await fetchSymbols();
  renderSymbols(symbols);

  connectToBitpin(renderTrade);

  setInterval(() => {
    renderCandles();
  }, 1000);
})();
