use soroban_sdk::{Env, Symbol, Address, String};
use crate::types::EscrowStatus;

// Helper constants for topics
const TOPIC_ESCROW: Symbol = Symbol::short("ESCROW");

pub fn emit_escrow_initialized(
    env: &Env,
    escrow_id: &String,
    buyer: &Address,
    seller: &Address,
    amount: i128,
) {
    let topics = (TOPIC_ESCROW, Symbol::short("INIT"), escrow_id.clone());
    env.events().publish(topics, (buyer.clone(), seller.clone(), amount));
}

pub fn emit_bond_deposited(
    env: &Env,
    escrow_id: &String,
    seller: &Address,
    bond_amount: i128,
) {
    let topics = (TOPIC_ESCROW, Symbol::short("BOND"), escrow_id.clone());
    env.events().publish(topics, (seller.clone(), bond_amount));
}

pub fn emit_proof_ref_submitted(
    env: &Env,
    escrow_id: &String,
    proof_hash: &String,
) {
    let topics = (TOPIC_ESCROW, Symbol::short("PROOF"), escrow_id.clone());
    env.events().publish(topics, proof_hash.clone());
}

pub fn emit_escrow_settled(
    env: &Env,
    escrow_id: &String,
    buyer: &Address,
    seller: &Address,
    amount_paid: i128,
) {
    let topics = (TOPIC_ESCROW, Symbol::short("SETTLED"), escrow_id.clone());
    env.events().publish(topics, (buyer.clone(), seller.clone(), amount_paid));
}

pub fn emit_bond_slashed(
    env: &Env,
    escrow_id: &String,
    seller: &Address,
    slash_amount: i128,
) {
    let topics = (TOPIC_ESCROW, Symbol::short("SLASHED"), escrow_id.clone());
    env.events().publish(topics, (seller.clone(), slash_amount));
}

pub fn emit_escrow_cancelled(
    env: &Env,
    escrow_id: &String,
    status_before_cancel: EscrowStatus,
) {
    let topics = (TOPIC_ESCROW, Symbol::short("CANCEL"), escrow_id.clone());
    env.events().publish(topics, status_before_cancel);
}
