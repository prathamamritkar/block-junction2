use ic_cdk_macros::*;
use candid::Principal;

// Module declarations
pub mod types;
pub mod storage;
pub mod auth;
pub mod swap;
pub mod utils;

// Re-export important types for easier access
pub use types::*;

// Placeholder greet function
#[query]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to the Cross-Chain Asset Swap.", name)
}

// Initialize canister
#[init]
fn init() {
    storage::init_storage();
}

// Export the Candid interface
ic_cdk::export_candid!();

