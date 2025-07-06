use ic_cdk_macros::*;
use crate::types::*;
use crate::storage::*;

#[update]
fn deposit_asset(asset_symbol: String, amount: u64) -> String {
    let caller = ic_cdk::caller();
    let current_balance = get_user_balance(caller, &asset_symbol);
    let new_balance = current_balance + amount;
    update_user_balance(caller, &asset_symbol, new_balance);
    format!("Deposited {} {} successfully", amount, asset_symbol)
}

#[query]
fn get_balance(asset_symbol: String) -> u64 {
    let caller = ic_cdk::caller();
    get_user_balance(caller, &asset_symbol)
}

#[query]
fn get_all_balances() -> BalanceResponse {
    let _caller = ic_cdk::caller();
    // Get all balances for the caller
    let balances = std::collections::HashMap::new();
    
    // This is a simplified implementation - in a real system you'd want to
    // iterate through all possible assets or store them in storage
    // For now, we'll return an empty map as placeholder
    // TODO: Implement proper balance retrieval from storage
    
    BalanceResponse {
        balances,
    }
}

#[update]
fn withdraw_asset(
    asset_symbol: String,
    amount: u64,
    target_chain: Chain,
    target_address: String
) -> String {
    let caller = ic_cdk::caller();
    let current_balance = get_user_balance(caller, &asset_symbol);
    
    if current_balance < amount {
        return "Insufficient balance".to_string();
    }
    
    let new_balance = current_balance - amount;
    update_user_balance(caller, &asset_symbol, new_balance);
    
    format!("Withdrawn {} {} to {} on {:?}", amount, asset_symbol, target_address, target_chain)
}

#[query]
fn get_btc_address() -> String {
    // Implementation for BTC address generation
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh".to_string() // Placeholder
}