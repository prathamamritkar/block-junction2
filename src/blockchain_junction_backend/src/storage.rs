use candid::{Encode, Decode, CandidType, Principal};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::cell::RefCell;
use ic_stable_structures::{StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use std::borrow::Cow;
use crate::types::SwapRequest;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct StorableHashMap(pub HashMap<String, u64>);

impl Storable for StorableHashMap {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for SwapRequest {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

type UserBalances = StableBTreeMap<Principal, StorableHashMap, DefaultMemoryImpl>;
type PendingSwaps = StableBTreeMap<u64, SwapRequest, DefaultMemoryImpl>;

thread_local! {
    static BALANCES: RefCell<UserBalances> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );
    
    static PENDING_SWAPS: RefCell<PendingSwaps> = RefCell::new(
        StableBTreeMap::init(DefaultMemoryImpl::default())
    );
    
    static NEXT_SWAP_ID: RefCell<u64> = RefCell::new(1);
}

pub fn init_storage() {
    // Initialize any required storage setup
}

pub fn get_user_balance(user: Principal, asset_symbol: &str) -> u64 {
    BALANCES.with(|balances| {
        balances.borrow()
            .get(&user)
            .map(|balance_map| balance_map.0.get(asset_symbol).copied().unwrap_or(0))
            .unwrap_or(0)
    })
}

pub fn update_user_balance(user: Principal, asset_symbol: &str, amount: u64) {
    BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        let mut user_balances = balances.get(&user).unwrap_or_default();
        user_balances.0.insert(asset_symbol.to_string(), amount);
        balances.insert(user, user_balances);
    });
}

pub fn add_pending_swap(swap: SwapRequest) -> u64 {
    let swap_id = NEXT_SWAP_ID.with(|id| {
        let current_id = *id.borrow();
        *id.borrow_mut() = current_id + 1;
        current_id
    });
    
    let mut swap_with_id = swap;
    swap_with_id.id = swap_id;
    
    PENDING_SWAPS.with(|swaps| {
        swaps.borrow_mut().insert(swap_id, swap_with_id);
    });
    
    swap_id
}

pub fn get_pending_swap(swap_id: u64) -> Option<SwapRequest> {
    PENDING_SWAPS.with(|swaps| {
        swaps.borrow().get(&swap_id)
    })
}

pub fn remove_pending_swap(swap_id: u64) -> Option<SwapRequest> {
    PENDING_SWAPS.with(|swaps| {
        swaps.borrow_mut().remove(&swap_id)
    })
}

pub fn get_all_pending_swaps() -> Vec<SwapRequest> {
    PENDING_SWAPS.with(|swaps| {
        swaps.borrow().iter().map(|(_, swap)| swap).collect()
    })
}