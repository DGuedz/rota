#![no_std]

use soroban_sdk::{contracterror, contracttype, Address, String};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyExists = 1,
    NotFound = 2,
    InvalidState = 3,
    NotAuthorized = 4,
    InvalidAmount = 5,
    DeadlinePassed = 6,
    InvalidSlashAmount = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Locked = 1,
    Bonded = 2,
    ProofSubmitted = 3,
    Settled = 4,
    Slashed = 5,
    Cancelled = 6,
    Disputed = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowRecord {
    pub escrow_id: String,
    pub buyer: Address,
    pub seller: Address,
    pub asset: Address,
    pub amount: i128,
    pub bond_amount: i128,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub deadline: u64,
    pub proof_hash: Option<String>,
    pub metadata_hash: Option<String>,
}

#[contracttype]
pub enum DataKey {
    Escrow(String), // Mapeia escrow_id -> EscrowRecord
}
