use ic_cdk_macros::*;
use candid::Principal;

#[update]
fn login() -> String {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        "Authentication failed".to_string()
    } else {
        format!("Authenticated as: {}", caller.to_text())
    }
}

pub fn is_authenticated(principal: Principal) -> bool {
    principal != Principal::anonymous()
}

#[query]
fn get_caller_principal() -> Principal {
    ic_cdk::caller()
}