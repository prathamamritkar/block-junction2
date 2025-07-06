use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq, Hash)]
pub enum Chain {
    ICP,
    Bitcoin,
    Ethereum,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Asset {
    pub chain: Chain,
    pub symbol: String,
    pub amount: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapRequest {
    pub user: Principal,
    pub from_asset: Asset,
    pub to_asset_symbol: String,
    pub to_chain: Chain,
    pub deadline: u64,
    pub id: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapResponse {
    pub success: bool,
    pub message: String,
    pub swap_id: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BalanceResponse {
    pub balances: std::collections::HashMap<String, u64>,
}