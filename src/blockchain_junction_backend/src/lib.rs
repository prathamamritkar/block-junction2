use candid::{CandidType, Principal};
use serde::Deserialize;
use std::collections::HashMap;
use ic_cdk::api::time;

// Using u64 for amounts, assuming assets have a fixed number of decimal places
// or amounts are represented in their smallest unit (e.g., satoshis for Bitcoin).

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub enum Chain {
    ICP,
    Bitcoin,
    // Ethereum, // Example for future extension
    // Other chains can be added here
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Asset {
    chain: Chain,
    symbol: String, // e.g., "ICP", "BTC"
    amount: u64,    // Represented in the smallest unit of the asset
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct SwapRequest {
    user: Principal,        // The user initiating the swap
    from_asset: Asset,      // Asset the user wants to swap
    to_asset_symbol: String, // Symbol of the asset the user wants to receive (e.g., "BTC")
    to_chain: Chain,        // Chain of the asset the user wants to receive
    // to_asset_amount_min: u64, // Optional: Minimum amount of to_asset user is willing to accept
    deadline: u64,          // Timestamp for when the request expires (nanoseconds)
    id: u64,                // Unique identifier for the swap request
}

// Placeholder for now, will be expanded in later steps
#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to the Cross-Chain Asset Swap.", name)
}

use ic_cdk::storage;
use ic_cdk_macros::*;
use std::cell::RefCell;
use ic_stable_structures::{StableBTreeMap, DefaultMemoryImpl};

// Canister State
type UserBalances = StableBTreeMap<Principal, HashMap<String, u64>>; // User -> (Asset Symbol -> Amount)
type PendingSwaps = StableBTreeMap<u64, SwapRequest>; // Swap ID -> SwapRequest

thread_local! {
    static BALANCES: RefCell<UserBalances> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );

    static SWAPS: RefCell<PendingSwaps> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );

    static NEXT_SWAP_ID: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    // Initialize state if needed, though StableBTreeMap handles its own initialization.
    // For example, setting up initial supported assets or configurations.
}

// Helper function to get a new unique swap ID
fn get_next_swap_id() -> u64 {
    NEXT_SWAP_ID.with(|id_counter| {
        let current_id = *id_counter.borrow();
        *id_counter.borrow_mut() = current_id + 1;
        current_id
    })
}

// Simulated deposit function
#[update]
fn deposit_asset(asset: Asset) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal not allowed to deposit.".to_string());
    }

    BALANCES.with(|balances_map| {
        let mut balances = balances_map.borrow_mut();
        let user_specific_balances = balances.entry(caller).or_insert_with(HashMap::new);
        let current_balance = user_specific_balances.entry(asset.symbol.clone()).or_insert(0);
        *current_balance += asset.amount;
    });
    Ok(())
}

#[update]
fn create_swap_request(from_asset_symbol: String, from_asset_amount: u64, to_asset_symbol: String, to_chain: Chain, duration_nanos: u64) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal not allowed to create swap requests.".to_string());
    }

    // Check if user has enough balance for the 'from_asset'
    let has_sufficient_balance = BALANCES.with(|balances_map| {
        balances_map.borrow().get(&caller)
            .and_then(|user_balances| user_balances.get(&from_asset_symbol))
            .map_or(false, |balance| *balance >= from_asset_amount)
    });

    if !has_sufficient_balance {
        return Err(format!("Insufficient balance of {} to create swap.", from_asset_symbol));
    }

    // Deduct the asset from user's balance (escrow)
    BALANCES.with(|balances_map| {
        let mut balances = balances_map.borrow_mut();
        if let Some(user_balances) = balances.get_mut(&caller) {
            if let Some(balance) = user_balances.get_mut(&from_asset_symbol) {
                *balance -= from_asset_amount;
            }
        }
    });

    let swap_id = get_next_swap_id();
    let current_time = time();
    let deadline = current_time + duration_nanos;

    // For now, assuming the from_asset is on ICP or its origin chain is known.
    // This needs refinement based on how assets are identified globally.
    // For this phase, we'll assume the `from_asset_symbol` implies its chain or it's an ICP-based asset.
    // A more robust system would require specifying the from_asset's chain explicitly if ambiguous.
    let from_asset = Asset {
        chain: Chain::ICP, // Placeholder: This needs to be determined correctly.
                           // If the asset is BTC, its chain should be Chain::Bitcoin.
                           // This part requires more thought on how assets are uniquely identified
                           // and how their source chain is specified during swap creation.
                           // For now, let's assume all 'from' assets in this simplified version are ICP-based representations
                           // or the symbol itself is unique enough (e.g., "ckBTC" vs "BTC").
        symbol: from_asset_symbol.clone(),
        amount: from_asset_amount,
    };

    let swap_request = SwapRequest {
        id: swap_id,
        user: caller,
        from_asset,
        to_asset_symbol,
        to_chain,
        deadline,
    };

    SWAPS.with(|swaps_map| {
        swaps_map.borrow_mut().insert(swap_id, swap_request);
    });

    Ok(swap_id)
}

// Simulated swap execution - matches two requests (very simplified)
// In a real system, this would be an AMM, order book, or RFQ system.
// This function is a placeholder and needs significant enhancement.
#[update]
fn execute_swap(swap_id1: u64, swap_id2: u64) -> Result<(), String> {
    // This is a highly simplified placeholder.
    // A real execution would involve matching compatible swaps, price discovery, etc.
    // For now, let's assume swap_id1 and swap_id2 are perfectly matched.
    // This function primarily demonstrates removing swaps and crediting assets.

    SWAPS.with(|swaps_map| {
        let mut swaps = swaps_map.borrow_mut();

        let req1_opt = swaps.get(&swap_id1);
        let req2_opt = swaps.get(&swap_id2);

        if req1_opt.is_none() || req2_opt.is_none() {
            return Err("One or both swap requests not found.".to_string());
        }

        let req1 = req1_opt.unwrap().clone(); // Clone to avoid borrow checker issues with mutable borrow later
        let req2 = req2_opt.unwrap().clone();

        // Basic compatibility check (highly simplified)
        // req1 wants what req2 offers, and req2 wants what req1 offers
        if !(req1.from_asset.symbol == req2.to_asset_symbol &&
             req1.from_asset.chain == req2.to_chain && // Assuming symbol implies chain for to_asset for now
             req2.from_asset.symbol == req1.to_asset_symbol &&
             req2.from_asset.chain == req1.to_chain) {
            return Err("Swap requests are not compatible.".to_string());
        }

        // Check deadlines
        let current_time = time();
        if current_time > req1.deadline || current_time > req2.deadline {
            return Err("One or both swap requests have expired.".to_string());
        }

        // Credit assets to users
        BALANCES.with(|balances_map| {
            let mut balances_bm = balances_map.borrow_mut();

            // Credit user1 with req2's from_asset (which is what user1 wanted)
            let user1_balances = balances_bm.entry(req1.user).or_insert_with(HashMap::new);
            let user1_target_asset_balance = user1_balances.entry(req2.from_asset.symbol.clone()).or_insert(0);
            *user1_target_asset_balance += req2.from_asset.amount;

            // Credit user2 with req1's from_asset (which is what user2 wanted)
            let user2_balances = balances_bm.entry(req2.user).or_insert_with(HashMap::new);
            let user2_target_asset_balance = user2_balances.entry(req1.from_asset.symbol.clone()).or_insert(0);
            *user2_target_asset_balance += req1.from_asset.amount;
        });

        // Remove executed swaps
        swaps.remove(&swap_id1);
        swaps.remove(&swap_id2);

        Ok(())
    })
}


// Simulated withdrawal function
#[update]
fn withdraw_asset(asset_symbol: String, amount: u64, target_chain: Chain, target_address: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal not allowed.".to_string());
    }

    // Check balance
    let has_sufficient_balance = BALANCES.with(|balances_map| {
        balances_map.borrow().get(&caller)
            .and_then(|user_balances| user_balances.get(&asset_symbol))
            .map_or(false, |balance| *balance >= amount)
    });

    if !has_sufficient_balance {
        return Err(format!("Insufficient balance of {} to withdraw.", asset_symbol));
    }

    // Deduct from balance
    BALANCES.with(|balances_map| {
        let mut balances = balances_map.borrow_mut();
        if let Some(user_balances) = balances.get_mut(&caller) {
            if let Some(balance) = user_balances.get_mut(&asset_symbol) {
                *balance -= amount;
                // Optional: remove asset from map if balance is zero
                // if *balance == 0 { user_balances.remove(&asset_symbol); }
            }
        }
    });

    // Actual withdrawal logic to the target_chain and target_address would go here.
    // For Bitcoin, this would involve creating and signing a Bitcoin transaction.
    // For ICP assets, it might involve calling another canister's transfer method.
    ic_cdk::println!("Simulated withdrawal: User {} withdrew {} {} to chain {:?} at address {}",
        caller, amount, asset_symbol, target_chain, target_address);

    Ok(())
}

// Query functions to view state (optional, but good for debugging/frontend)
#[query]
fn get_user_balance(user: Principal, asset_symbol: String) -> Result<u64, String> {
    BALANCES.with(|balances_map| {
        balances_map.borrow().get(&user)
            .and_then(|user_balances| user_balances.get(&asset_symbol))
            .map(|balance| *balance)
            .ok_or_else(|| format!("No balance found for asset {} for user {}", asset_symbol, user))
    })
}

#[query]
fn get_all_user_balances(user: Principal) -> Result<HashMap<String, u64>, String> {
    BALANCES.with(|balances_map| {
        balances_map.borrow().get(&user)
            .map(|user_balances| user_balances.clone())
            .ok_or_else(|| format!("No balances found for user {}", user))
    })
}


#[query]
fn get_swap_request(swap_id: u64) -> Result<SwapRequest, String> {
    SWAPS.with(|swaps_map| {
        swaps_map.borrow().get(&swap_id)
            .map(|req| req.clone()) // Clone to return ownership
            .ok_or_else(|| format!("Swap request with ID {} not found.", swap_id))
    })
}

#[query]
fn get_all_pending_swaps() -> Vec<SwapRequest> {
    SWAPS.with(|swaps_map| {
        swaps_map.borrow().iter().map(|(_, req)| req.clone()).collect()
    })
}

// For Bitcoin address generation (simulated for now)
type UserBitcoinAddresses = StableBTreeMap<Principal, String>;

thread_local! {
    // ... (other thread_local variables BALANCES, SWAPS, NEXT_SWAP_ID remain unchanged)

    static USER_BTC_ADDRESSES: RefCell<UserBitcoinAddresses> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );
}


#[update]
fn get_or_generate_user_bitcoin_deposit_address() -> Result<String, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous principal cannot generate a Bitcoin deposit address.".to_string());
    }

    USER_BTC_ADDRESSES.with(|addr_map_ref| {
        let mut addr_map = addr_map_ref.borrow_mut();
        if let Some(existing_address) = addr_map.get(&caller) {
            Ok(existing_address.clone())
        } else {
            // Simulate Bitcoin address generation.
            // In a real scenario, this would involve:
            // 1. Deriving a new key using the management canister's ecdsa_public_key endpoint
            //    with a unique derivation path for the user.
            // 2. Converting this public key to a Bitcoin address (e.g., P2WPKH or P2TR).
            // This is a complex, asynchronous operation.
            // For now, we simulate it with a unique placeholder.
            let new_address = format!("sim_btc_addr_for_{}", caller.to_text());

            addr_map.insert(caller, new_address.clone());
            ic_cdk::println!("Generated new Bitcoin deposit address for {}: {}", caller, new_address);
            Ok(new_address)
        }
    })
}

#[query]
fn get_user_bitcoin_deposit_address() -> Result<String, String> {
    let caller = ic_cdk::caller();
     if caller == Principal::anonymous() {
        return Err("Anonymous principal does not have a Bitcoin deposit address.".to_string());
    }
    USER_BTC_ADDRESSES.with(|addr_map_ref| {
        addr_map_ref.borrow().get(&caller)
            .map(|addr| addr.clone())
            .ok_or_else(|| "No Bitcoin deposit address found for this user. Please generate one first.".to_string())
    })
}
