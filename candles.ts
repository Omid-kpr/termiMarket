import dayjs from "dayjs";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

type TimeFrame = "1m" | "5m" | "1h" | "1d" | "1M";

const candles: Record<TimeFrame, Map<number, Candle>> = {
  "1m": new Map(),
  "5m": new Map(),
  "1h": new Map(),
  "1d": new Map(),
  "1M": new Map(),
};

function getTimeBucket(ts: number, tf: TimeFrame): number {
  const d = dayjs(ts);
  switch (tf) {
    case "1m":
      return d.startOf("minute").unix();
    case "5m":
      return d
        .startOf("minute")
        .minute(Math.floor(d.minute() / 5) * 5)
        .unix();
    case "1h":
      return d.startOf("hour").unix();
    case "1d":
      return d.startOf("day").unix();
    case "1M":
      return d.startOf("month").unix();
  }
}

export function updateCandles(
  price: number,
  volume: number,
  timestamp: number,
) {
  (Object.keys(candles) as TimeFrame[]).forEach((tf) => {
    const bucket = getTimeBucket(timestamp * 1000, tf);
    const candleMap = candles[tf];

    const existing = candleMap.get(bucket);
    if (!existing) {
      candleMap.set(bucket, {
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
        timestamp: bucket,
      });
    } else {
      existing.high = Math.max(existing.high, price);
      existing.low = Math.min(existing.low, price);
      existing.close = price;
      existing.volume += volume;
    }
  });
}

export function getCandles(tf: TimeFrame): Candle[] {
  return Array.from(candles[tf].values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );
}
