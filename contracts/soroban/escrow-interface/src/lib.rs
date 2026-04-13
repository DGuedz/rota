#![no_std]

mod types;
mod storage;
mod events;

use soroban_sdk::{contract, contractimpl, token, Address, Env, String};
use types::{EscrowRecord, EscrowStatus, EscrowError};

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
        resolver: Address,
        asset: Address,
        amount: i128,
        bond_amount: i128,
        deadline: u64,
        dispute_deadline: u64,
        metadata_hash: Option<String>,
    ) -> Result<(), EscrowError> {
        buyer.require_auth();

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if storage::has_escrow(&env, &escrow_id) {
            return Err(EscrowError::AlreadyExists);
        }

        // VSC Rule 7: Check blacklist
        if storage::is_blacklisted(&env, &buyer) {
            return Err(EscrowError::NotAuthorized);
        }

        // Transfer funds from buyer to the contract
        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        let record = EscrowRecord {
            escrow_id: escrow_id.clone(),
            buyer: buyer.clone(),
            seller: seller.clone(),
            resolver: resolver.clone(),
            asset,
            amount,
            bond_amount,
            status: EscrowStatus::Locked,
            created_at: env.ledger().timestamp(),
            deadline,
            dispute_deadline,
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
    pub fn settle_escrow(
        env: Env,
        escrow_id: String,
        caller: Address,
    ) -> Result<(), EscrowError> {
        caller.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;

        if record.status != EscrowStatus::ProofSubmitted {
            return Err(EscrowError::InvalidState);
        }

        // Only buyer can settle manually OR resolver can auto-settle after dispute_deadline
        let is_buyer = caller == record.buyer;
        let is_resolver_auto_settle = caller == record.resolver && env.ledger().timestamp() > record.dispute_deadline;
        
        if !is_buyer && !is_resolver_auto_settle {
            return Err(EscrowError::NotAuthorized);
        }

        let total_payout = record.amount + record.bond_amount;
        let token_client = token::Client::new(&env, &record.asset);
        
        token_client.transfer(&env.current_contract_address(), &record.seller, &total_payout);

        record.status = EscrowStatus::Settled;
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_escrow_settled(&env, &escrow_id, &record.buyer, &record.seller, record.amount);

        Ok(())
    }

    /// 4.b Raise Dispute (Buyer stops auto-settlement)
    pub fn raise_dispute(
        env: Env,
        escrow_id: String,
        buyer: Address,
    ) -> Result<(), EscrowError> {
        buyer.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;

        if record.buyer != buyer {
            return Err(EscrowError::NotAuthorized);
        }
        if record.status != EscrowStatus::ProofSubmitted {
            return Err(EscrowError::InvalidState);
        }
        if env.ledger().timestamp() > record.dispute_deadline {
            return Err(EscrowError::DeadlinePassed);
        }

        record.status = EscrowStatus::Disputed;
        storage::set_escrow(&env, &escrow_id, &record);
        events::emit_escrow_disputed(&env, &escrow_id, &buyer);

        Ok(())
    }

    /// 5. Slash Bond (Punishes seller and returns funds to buyer)
    pub fn slash_bond(
        env: Env,
        escrow_id: String,
        resolver: Address,
        slash_amount: i128,
    ) -> Result<(), EscrowError> {
        resolver.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;

        // Only resolver can slash
        if record.resolver != resolver {
            return Err(EscrowError::NotAuthorized);
        }

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
        resolver: Address,
    ) -> Result<(), EscrowError> {
        resolver.require_auth();

        let mut record = storage::get_escrow(&env, &escrow_id).ok_or(EscrowError::NotFound)?;
        
        if record.resolver != resolver {
            return Err(EscrowError::NotAuthorized);
        }

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

    /// 7. Honeypot: Active Defense (VSC Rule 7)
    /// This function looks like a backdoor left by developers, but actually
    /// blocks the caller and emits a critical security event.
    pub fn emergency_withdraw_yield(
        env: Env,
        attacker: Address,
    ) -> Result<(), EscrowError> {
        attacker.require_auth();

        // 1. Blacklist the attacker immediately
        storage::set_blacklisted(&env, &attacker);

        // 2. Emit Intrusion Detected
        events::emit_intrusion_detected(&env, &attacker);

        // Fail to prevent any state changes
        Err(EscrowError::NotAuthorized)
    }
}
