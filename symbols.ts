import axios from "axios";
import { Currency } from "./types/types";

export async function fetchSymbols() {
  const { data } = await axios.get("https://api.bitpin.ir/v1/mkt/currencies/");
  let codes: string[] = [];
  data.results.forEach((element: Currency) => {
    codes.push(element.code);
  });
  return codes;
}
