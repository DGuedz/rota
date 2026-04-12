use soroban_sdk::{Env, String};
use crate::types::{DataKey, EscrowRecord};

pub fn has_escrow(env: &Env, escrow_id: &String) -> bool {
    env.storage().persistent().has(&DataKey::Escrow(escrow_id.clone()))
}

pub fn get_escrow(env: &Env, escrow_id: &String) -> Option<EscrowRecord> {
    env.storage().persistent().get(&DataKey::Escrow(escrow_id.clone()))
}

pub fn set_escrow(env: &Env, escrow_id: &String, record: &EscrowRecord) {
    env.storage().persistent().set(&DataKey::Escrow(escrow_id.clone()), record);
}

pub fn remove_escrow(env: &Env, escrow_id: &String) {
    env.storage().persistent().remove(&DataKey::Escrow(escrow_id.clone()));
}
