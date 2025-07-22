export interface Match {
  id: string;
  price: string;
  base_amount: string;
  quote_amount: string;
  side: "buy" | "sell";
}
export interface MatchesMessage {
  event: "matches_update";
  symbol: string;
  event_time: string;
  matches: Match[];
}
export interface Currency {
  id: number;
  title: string;
  title_fa: string;
  code: string;
  image: string;
  min_withdraw: string;
  price_info: Record<string, any>;
  price_info_usdt: Record<string, any>;
  color: string;
  alias: string[];
  withdraw_commission: string;
  withdraw_commission_type: "value" | "percent" | string;
  max_withdraw_commission: string;
  tradable: boolean;
  for_test: boolean;
  decimal: number;
  decimal_amount: number;
  decimal_irt: number;
  high_risk: boolean;
  show_high_risk: boolean;
  networks: any[];
  for_loan: boolean;
  for_stake: boolean;
  recommend_for_deposit_weight: number;
}
