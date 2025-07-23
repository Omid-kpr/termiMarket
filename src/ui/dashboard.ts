// dashboard.ts
import * as blessed from "blessed";
import * as contrib from "blessed-contrib";
import { getAllCandles } from "../logic/candles";
import { Match } from "../types/types";

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen });

const tradesBox = grid.set(0, 0, 6, 5, blessed.log, {
  label: "BTC Trades",
  tags: true,
  border: "line",
});

const symbolBox = grid.set(6, 0, 6, 5, blessed.box, {
  label: "Active Symbols",
  tags: true,
  scrollable: true,
  border: "line",
});
const candleBox1m = grid.set(0, 5, 3, 7, blessed.log, {
  label: "1 minute Candle Summary",
  tags: true,
  border: "line",
});

const candleBox5m = grid.set(3, 5, 3, 7, blessed.log, {
  label: "5 minutes Candle Summary",
  tags: true,
  border: "line",
});

const candleBox1h = grid.set(6, 5, 3, 7, blessed.log, {
  label: "1 hour Candle Summary",
  tags: true,
  border: "line",
});

const candleBox1d = grid.set(9, 5, 3, 7, blessed.log, {
  label: "1 day Candle Summary",
  tags: true,
  border: "line",
});

screen.key(["escape", "q", "C-c"], () => process.exit(0));

export function renderTrade(match: Match) {
  //dlog(match);
  const line = `{${match.side === "buy" ? "green" : "red"}-fg}${match.side.toUpperCase()} amount: ${match.base_amount} price: ${match.price}{/}`;
  tradesBox.log(line);
  screen.render();
}

export function renderSymbols(symbols: string[]) {
  symbolBox.setContent(symbols.join(", "));
  screen.render();
}
export function renderCandles() {
  const candles = getAllCandles();

  const boxMap: Record<string, any> = {
    "1m": candleBox1m,
    "5m": candleBox5m,
    "1h": candleBox1h,
    "1d": candleBox1d,
  };

  Object.entries(boxMap).forEach(([timeframe, box]) => {
    const data = candles[timeframe];
    if (!data || data.length === 0) {
      box.setContent("No candles yet.");
      return;
    }

    const summary = data
      .slice(-5)
      .map((c) => {
        const date = new Date(c.timestamp).toLocaleString();
        return `⏱️ ${date} | O: ${c.open} H: ${c.high} L: ${c.low} C: ${c.close} V: ${c.volume}`;
      })
      .join("\n");

    box.setContent(summary);
  });

  screen.render();
}

const logBox = blessed.log({
  tags: true,
  bottom: 0,
  height: 8,
  width: "100%",
  label: "Debug Logs",
  border: "line",
  style: { border: { fg: "yellow" } },
  scrollable: true,
  alwaysScroll: true,
});

screen.append(logBox);

export function dlog(...args: any[]) {
  const msg = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ");
  logBox.log(msg);
  screen.render();
}
