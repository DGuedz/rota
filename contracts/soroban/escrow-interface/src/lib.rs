#![no_std]

mod types;
mod errors;
mod storage;
mod events;

use soroban_sdk::{contract, contractimpl, token, Address, Env, String};
use types::{EscrowRecord, EscrowStatus};
use errors::EscrowError;

#[contract]
pub struct RotaEscrowContract;

#[contractimpl]
impl RotaEscrowContract {
    /// 1. Initialize the Escrow (Locks the buyer's funds)
    pub fn init_escrow(
        env: Env,
        escrow_id: String,
        buyer: Address,
        seller: Address,
        asset: Address,
        amount: i128,
        bond_amount: i128,
        deadline: u64,
        metadata_hash: Option<String>,
    ) -> Result<(), EscrowError> {
        buyer.require_auth();

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if storage::has_escrow(&env, &escrow_id) {
            return Err(EscrowError::AlreadyExists);
        }

        // Transfer funds from buyer to the contract
        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        let record = EscrowRecord {
            escrow_id: escrow_id.clone(),
            buyer: buyer.clone(),
            seller: seller.clone(),
            asset,
            amount,
            bond_amount,
            status: EscrowStatus::Locked,
            created_at: env.ledger().timestamp(),
            deadline,
            proof_hash: None,
            metadata_hash,
        };

        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_escrow_initialized(&env, &escrow_id, &buyer, &seller, amount);

        Ok(())
    }

    /// 2. Deposit Bond (Seller deposits the guarantee)
    pub fn deposit_bond(
        env: Env,
        escrow_id: String,
        seller: Address,
    ) -> Result<(), EscrowError> {
        seller.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;
        
        if record.seller != seller {
            return Err(EscrowError::NotAuthorized);
        }
        if record.status != EscrowStatus::Locked {
            return Err(EscrowError::InvalidState);
        }
        if record.bond_amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        let token_client = token::Client::new(&env, &record.asset);
        token_client.transfer(&seller, &env.current_contract_address(), &record.bond_amount);

        record.status = EscrowStatus::Bonded;
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_bond_deposited(&env, &escrow_id, &seller, record.bond_amount);

        Ok(())
    }

    /// 3. Submit Proof Hash Reference
    pub fn submit_proof_ref(
        env: Env,
        escrow_id: String,
        proof_hash: String,
    ) -> Result<(), EscrowError> {
        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;
        
        record.seller.require_auth();

        if record.status != EscrowStatus::Bonded {
            return Err(EscrowError::InvalidState);
        }

        record.proof_hash = Some(proof_hash.clone());
        record.status = EscrowStatus::ProofSubmitted;
        
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_proof_ref_submitted(&env, &escrow_id, &proof_hash);

        Ok(())
    }

    /// 4. Settle Escrow (Releases payment and bond to the seller)
    /// In a real scenario, this is called by an oracle/admin or multisig, but here we simplify.
    pub fn settle_escrow(
        env: Env,
        escrow_id: String,
        admin: Address,
    ) -> Result<(), EscrowError> {
        admin.require_auth(); // Simplification: admin (or the buyer) authorizes settlement

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;

        if record.status != EscrowStatus::ProofSubmitted {
            return Err(EscrowError::InvalidState);
        }

        let total_payout = record.amount + record.bond_amount;
        let token_client = token::Client::new(&env, &record.asset);
        
        token_client.transfer(&env.current_contract_address(), &record.seller, &total_payout);

        record.status = EscrowStatus::Settled;
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_escrow_settled(&env, &escrow_id, &record.buyer, &record.seller, record.amount);

        Ok(())
    }

    /// 5. Slash Bond (Punishes seller and returns funds to buyer)
    pub fn slash_bond(
        env: Env,
        escrow_id: String,
        admin: Address,
        slash_amount: i128,
    ) -> Result<(), EscrowError> {
        admin.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;

        if record.status != EscrowStatus::Bonded && record.status != EscrowStatus::ProofSubmitted && record.status != EscrowStatus::Disputed {
            return Err(EscrowError::InvalidState);
        }
        if slash_amount > record.bond_amount || slash_amount < 0 {
            return Err(EscrowError::InvalidSlashAmount);
        }

        let token_client = token::Client::new(&env, &record.asset);
        
        // Return original amount + slashed bond to the buyer
        let buyer_refund = record.amount + slash_amount;
        token_client.transfer(&env.current_contract_address(), &record.buyer, &buyer_refund);

        // Return remaining bond to seller if any
        let remaining_bond = record.bond_amount - slash_amount;
        if remaining_bond > 0 {
            token_client.transfer(&env.current_contract_address(), &record.seller, &remaining_bond);
        }

        record.status = EscrowStatus::Slashed;
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_bond_slashed(&env, &escrow_id, &record.seller, slash_amount);

        Ok(())
    }

    /// 6. Cancel Escrow
    pub fn cancel_escrow(
        env: Env,
        escrow_id: String,
        admin: Address,
    ) -> Result<(), EscrowError> {
        admin.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;
        let prev_status = record.status.clone();

        if prev_status == EscrowStatus::Settled || prev_status == EscrowStatus::Slashed || prev_status == EscrowStatus::Cancelled {
            return Err(EscrowError::InvalidState);
        }

        let token_client = token::Client::new(&env, &record.asset);

        // Refund buyer
        if record.amount > 0 {
            token_client.transfer(&env.current_contract_address(), &record.buyer, &record.amount);
        }

        // Refund seller bond if they already deposited
        if prev_status != EscrowStatus::Locked && record.bond_amount > 0 {
            token_client.transfer(&env.current_contract_address(), &record.seller, &record.bond_amount);
        }

        record.status = EscrowStatus::Cancelled;
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_escrow_cancelled(&env, &escrow_id, prev_status);

        Ok(())
    }
}
