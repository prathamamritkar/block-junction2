use ic_cdk_macros::*;
use crate::types::*;
use crate::storage::*;
use crate::auth::*;

#[update]
fn create_swap_request(
    from_asset_symbol: String,
    from_asset_amount: u64,
    to_asset_symbol: String,
    to_chain: Chain,
    duration_nanos: u64
) -> SwapResponse {
    let caller = ic_cdk::caller();
    
    if !is_authenticated(caller) {
        return SwapResponse {
            success: false,
            message: "Authentication required".to_string(),
            swap_id: None,
        };
    }

    let user_balance = get_user_balance(caller, &from_asset_symbol);
    if user_balance < from_asset_amount {
        return SwapResponse {
            success: false,
            message: "Insufficient balance".to_string(),
            swap_id: None,
        };
    }

    let from_asset = Asset {
        chain: Chain::ICP, // Determine from symbol
        symbol: from_asset_symbol.clone(),
        amount: from_asset_amount,
    };

    let swap_request = SwapRequest {
        user: caller,
        from_asset,
        to_asset_symbol,
        to_chain,
        deadline: ic_cdk::api::time() + duration_nanos,
        id: 0, // Will be set in storage
    };

    let swap_id = add_pending_swap(swap_request);
    
    // Deduct balance
    let new_balance = user_balance - from_asset_amount;
    update_user_balance(caller, &from_asset_symbol, new_balance);

    SwapResponse {
        success: true,
        message: "Swap request created successfully".to_string(),
        swap_id: Some(swap_id),
    }
}

#[update]
fn execute_swap(swap_id1: u64, swap_id2: u64) -> SwapResponse {
    let caller = ic_cdk::caller();
    
    if !is_authenticated(caller) {
        return SwapResponse {
            success: false,
            message: "Authentication required".to_string(),
            swap_id: None,
        };
    }

    let swap1 = match get_pending_swap(swap_id1) {
        Some(swap) => swap,
        None => return SwapResponse {
            success: false,
            message: "First swap not found".to_string(),
            swap_id: None,
        },
    };

    let swap2 = match get_pending_swap(swap_id2) {
        Some(swap) => swap,
        None => return SwapResponse {
            success: false,
            message: "Second swap not found".to_string(),
            swap_id: None,
        },
    };

    // Validate swap compatibility
    if swap1.from_asset.symbol != swap2.to_asset_symbol || 
       swap2.from_asset.symbol != swap1.to_asset_symbol {
        return SwapResponse {
            success: false,
            message: "Incompatible swap requests".to_string(),
            swap_id: None,
        };
    }

    // Execute the swap
    remove_pending_swap(swap_id1);
    remove_pending_swap(swap_id2);

    // Update balances
    let user1_new_balance = get_user_balance(swap1.user, &swap2.from_asset.symbol) + swap2.from_asset.amount;
    let user2_new_balance = get_user_balance(swap2.user, &swap1.from_asset.symbol) + swap1.from_asset.amount;
    
    update_user_balance(swap1.user, &swap2.from_asset.symbol, user1_new_balance);
    update_user_balance(swap2.user, &swap1.from_asset.symbol, user2_new_balance);

    SwapResponse {
        success: true,
        message: "Swap executed successfully".to_string(),
        swap_id: None,
    }
}

#[query]
fn get_pending_swaps() -> Vec<SwapRequest> {
    get_all_pending_swaps()
}