-- ============================================================================
-- FlowBank | Personalised AI Banking & Autonomous Financial Telemetry
-- Database Schema & Seed Data (PostgreSQL & MySQL Compatible)
-- Problem Statement: PS-003 Personalised AI Banking
-- Architecture: RBI Account Aggregator (AA), Multi-Goal Prioritization,
--               Anomaly Telemetry, WhatsApp Nudge Gateway & User Override
-- ============================================================================

-- Drop existing tables in reverse dependency order (if re-running)
DROP TABLE IF EXISTS whatif_simulations CASCADE;
DROP TABLE IF EXISTS whatsapp_telemetry_logs CASCADE;
DROP TABLE IF EXISTS spend_locks CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS aa_consents CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS TABLE
-- Stores primary customer identities, KYC/Aadhaar tokenization & credentials
-- ============================================================================
CREATE TABLE users (
    user_id             VARCHAR(36) PRIMARY KEY,
    customer_id         VARCHAR(20) NOT NULL UNIQUE,     -- e.g. CID-9041
    full_name           VARCHAR(100) NOT NULL,           -- e.g. Aditya Sharma
    phone_number        VARCHAR(20) NOT NULL,            -- e.g. +91 9876543210
    email               VARCHAR(120) NOT NULL UNIQUE,
    aadhaar_masked      VARCHAR(20) NOT NULL,            -- e.g. XXXX-XXXX-4829
    pan_number          VARCHAR(15) NOT NULL,            -- e.g. ABCPS1234F
    mpin_hash           VARCHAR(128) NOT NULL,           -- Hashed 6-digit MPIN
    monthly_income      DECIMAL(12, 2) NOT NULL DEFAULT 85000.00,
    fixed_obligations   DECIMAL(12, 2) NOT NULL DEFAULT 42000.00,
    discretionary_limit DECIMAL(12, 2) NOT NULL DEFAULT 14500.00,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. BANK_ACCOUNTS TABLE
-- Connected financial institution accounts ingested via RBI Account Aggregator
-- ============================================================================
CREATE TABLE bank_accounts (
    account_id          VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    bank_name           VARCHAR(80) NOT NULL,            -- e.g. HDFC Bank, SBI
    account_number_mask VARCHAR(25) NOT NULL,            -- e.g. A/C No. ending with ...4092
    account_type        VARCHAR(20) NOT NULL DEFAULT 'SAVINGS', -- SAVINGS, SALARY, CURRENT
    current_balance     DECIMAL(12, 2) NOT NULL DEFAULT 124500.00,
    ifsc_code           VARCHAR(15) NOT NULL,
    is_primary          BOOLEAN DEFAULT TRUE,
    is_aa_linked        BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. AA_CONSENTS TABLE (RBI Account Aggregator Framework)
-- Granular, revocable user consent artifacts for data privacy & telemetry
-- ============================================================================
CREATE TABLE aa_consents (
    consent_id          VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    consent_handle      VARCHAR(60) NOT NULL UNIQUE,     -- e.g. AA-CONSENT-9041-RBI
    purpose_code        VARCHAR(20) NOT NULL DEFAULT '101', -- 101: Personal Financial Management
    consent_status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    ingestion_enabled   BOOLEAN NOT NULL DEFAULT TRUE,   -- Live transaction streaming
    whatif_model_consent BOOLEAN NOT NULL DEFAULT TRUE,  -- Predictive spend simulation
    whatsapp_nudges_consent BOOLEAN NOT NULL DEFAULT TRUE, -- Outbound WhatsApp interventions
    data_provider_fip   VARCHAR(100) DEFAULT 'Sahamati Financial Information Provider (FIP)',
    valid_from          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until         TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consent_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. FINANCIAL_GOALS TABLE
-- Multi-Goal Priority Engine (Critical vs Flexible target milestones)
-- ============================================================================
CREATE TABLE financial_goals (
    goal_id             VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    goal_name           VARCHAR(100) NOT NULL,           -- e.g. School Fees, Laptop Buy
    goal_category       VARCHAR(40) NOT NULL,            -- EDUCATION, GADGET, EMERGENCY, TRAVEL
    priority_tier       VARCHAR(30) NOT NULL,            -- CRITICAL_NON_NEGOTIABLE vs FLEXIBLE
    priority_weight     INT NOT NULL DEFAULT 1,          -- 1 = Highest (Critical), 2 = Secondary
    target_amount       DECIMAL(12, 2) NOT NULL,
    current_saved       DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    target_deadline     DATE NOT NULL,
    deadline_type       VARCHAR(20) NOT NULL DEFAULT 'HARD', -- HARD vs SOFT
    velocity_status     VARCHAR(40) NOT NULL DEFAULT 'OPTIMUM_VELOCITY',
    -- Status options: 'OPTIMUM_VELOCITY', 'TEMPORARILY_PAUSED', 'ACTIVE_OVERRIDE', 'COMPLETED'
    monthly_allocation  DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- 5. TRANSACTIONS TABLE
-- Ingested transaction telemetry with AI Anomaly Detection & Category Overrides
-- ============================================================================
CREATE TABLE transactions (
    transaction_id      VARCHAR(36) PRIMARY KEY,
    account_id          VARCHAR(36) NOT NULL,
    user_id             VARCHAR(36) NOT NULL,
    merchant_name       VARCHAR(100) NOT NULL,           -- e.g. TechStore Electronics
    amount              DECIMAL(12, 2) NOT NULL,
    transaction_type    VARCHAR(10) NOT NULL DEFAULT 'DEBIT', -- DEBIT or CREDIT
    channel             VARCHAR(20) NOT NULL DEFAULT 'UPI',  -- UPI, CARD, NET_BANKING, NEFT
    
    -- AI Categorization vs Customer Override (PS-003 Requirement)
    category_ai         VARCHAR(50) NOT NULL,            -- Initial auto-tagged: Impulse Spike
    category_override   VARCHAR(50),                     -- Customer corrected: Work Tool / Education
    is_overridden       BOOLEAN DEFAULT FALSE,
    override_reason     VARCHAR(200),
    
    -- Telemetry & Anomaly Flagging
    is_discretionary    BOOLEAN DEFAULT TRUE,
    is_anomaly          BOOLEAN DEFAULT FALSE,
    anomaly_score       DECIMAL(5, 3) DEFAULT 0.000,     -- e.g. 0.942 (Isolation Forest model)
    impacted_goal_id    VARCHAR(36),                     -- References financial_goals(goal_id)
    goal_delay_days     INT DEFAULT 0,                   -- Milestone delay impact (e.g. 4 days)
    
    transaction_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txn_account FOREIGN KEY (account_id) REFERENCES bank_accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_goal FOREIGN KEY (impacted_goal_id) REFERENCES financial_goals(goal_id) ON DELETE SET NULL
);

-- ============================================================================
-- 6. SPEND_LOCKS TABLE
-- Guardrail locks triggered by user WhatsApp quick-action or app intervention
-- ============================================================================
CREATE TABLE spend_locks (
    lock_id             VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    lock_status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, EXPIRED
    reason              VARCHAR(150) NOT NULL DEFAULT 'IMPULSE_SPIKE_VELOCITY_PRESERVATION',
    duration_hours      INT NOT NULL DEFAULT 24,
    locked_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at          TIMESTAMP NOT NULL,
    released_by_user    BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_locks_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. WHATSAPP_TELEMETRY_LOGS TABLE
-- Outbound interactive banking alerts, delivery telemetry, and user replies
-- ============================================================================
CREATE TABLE whatsapp_telemetry_logs (
    log_id              VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    dispatch_reference  VARCHAR(50) NOT NULL,            -- e.g. TXN-ALERT-1760541289
    recipient_phone     VARCHAR(20) NOT NULL,            -- Destination WhatsApp phone
    gateway_provider    VARCHAR(40) NOT NULL DEFAULT 'FLOWBANK_AUTONOMOUS_NODE',
    -- Providers: CALLMEBOT, TWILIO_WHATSAPP, FLOWBANK_AUTONOMOUS_NODE, WEBHOOK
    alert_type          VARCHAR(40) NOT NULL,            -- IMPULSE_SPIKE_WARNING, REALLOCATION_CONFIRM
    message_content     TEXT NOT NULL,
    delivery_status     VARCHAR(30) NOT NULL DEFAULT 'DELIVERED_TO_PHONE',
    -- Status: PENDING, DELIVERED_TO_PHONE, FAILED, USER_RESPONDED
    user_action_chosen  VARCHAR(40),                     -- LOCK_SPEND, ADJUST_GOALS, OVERRIDE_CATEGORY
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wa_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- 8. WHATIF_SIMULATIONS TABLE
-- Historical records of user predictive 'What-If' discretionary explorations
-- ============================================================================
CREATE TABLE whatif_simulations (
    simulation_id       VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    simulated_amount    DECIMAL(12, 2) NOT NULL,         -- e.g. 3500.00
    calculated_delay    INT NOT NULL,                    -- e.g. 4 Days
    impacted_goal_name  VARCHAR(100) NOT NULL,           -- Laptop Buy
    protected_goal_name VARCHAR(100) NOT NULL,           -- School Fees
    status_summary      VARCHAR(255),
    simulated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sim_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PRODUCTION QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX idx_transactions_user_time ON transactions(user_id, transaction_time DESC);
CREATE INDEX idx_transactions_anomaly ON transactions(is_anomaly);
CREATE INDEX idx_goals_user_priority ON financial_goals(user_id, priority_weight ASC);
CREATE INDEX idx_wa_logs_user ON whatsapp_telemetry_logs(user_id, created_at DESC);
CREATE INDEX idx_aa_consents_status ON aa_consents(user_id, consent_status);

-- ============================================================================
-- REALISTIC SEED DATA (Matching FlowBank Demo State)
-- ============================================================================

-- Insert Primary User
INSERT INTO users (
    user_id, customer_id, full_name, phone_number, email,
    aadhaar_masked, pan_number, mpin_hash,
    monthly_income, fixed_obligations, discretionary_limit
) VALUES (
    'usr-9041-aditya',
    'CID-9041',
    'Aditya Sharma',
    '+919876543210',
    'aditya.sharma@flowbank.in',
    'XXXX-XXXX-4829',
    'ABCPS9041F',
    'e10adc3949ba59abbe56e057f20f883e', -- hashed '123456'
    85000.00,
    42000.00,
    14500.00
);

-- Insert Connected Bank Account
INSERT INTO bank_accounts (
    account_id, user_id, bank_name, account_number_mask,
    account_type, current_balance, ifsc_code, is_primary, is_aa_linked
) VALUES (
    'acc-hdfc-4092',
    'usr-9041-aditya',
    'HDFC Bank Ltd. (Salary & Operating Account)',
    'XXXX-XXXX-XXXX-4092',
    'SAVINGS',
    124500.00,
    'HDFC0001092',
    TRUE,
    TRUE
);

-- Insert RBI Account Aggregator Consent
INSERT INTO aa_consents (
    consent_id, user_id, consent_handle, purpose_code, consent_status,
    ingestion_enabled, whatif_model_consent, whatsapp_nudges_consent,
    data_provider_fip, valid_until
) VALUES (
    'cns-rbi-9041',
    'usr-9041-aditya',
    'AA-CONSENT-9041-RBI',
    '101',
    'ACTIVE',
    TRUE,
    TRUE,
    TRUE,
    'Sahamati Financial Information Provider (FIP)',
    CURRENT_TIMESTAMP + INTERVAL '365 DAY'
);

-- Insert Stated Financial Goals (Multi-Goal Priority Hierarchy)
INSERT INTO financial_goals (
    goal_id, user_id, goal_name, goal_category,
    priority_tier, priority_weight, target_amount, current_saved,
    target_deadline, deadline_type, velocity_status, monthly_allocation
) VALUES 
(
    'goal-school-fees',
    'usr-9041-aditya',
    'Child School Fees Q4',
    'EDUCATION',
    'CRITICAL_NON_NEGOTIABLE',
    1,
    45000.00,
    38250.00,
    DATE '2026-11-15',
    'HARD',
    'OPTIMUM_VELOCITY',
    15000.00
),
(
    'goal-laptop-buy',
    'usr-9041-aditya',
    'Laptop Upgrade (MacBook Pro)',
    'GADGET',
    'FLEXIBLE',
    2,
    65000.00,
    27300.00,
    DATE '2026-12-31',
    'SOFT',
    'TEMPORARILY_PAUSED',
    8000.00
);

-- Insert Telemetry Transactions (Including the Anomaly Spike)
INSERT INTO transactions (
    transaction_id, account_id, user_id, merchant_name,
    amount, transaction_type, channel, category_ai, category_override,
    is_overridden, is_discretionary, is_anomaly, anomaly_score,
    impacted_goal_id, goal_delay_days, transaction_time
) VALUES 
(
    'txn-spike-001',
    'acc-hdfc-4092',
    'usr-9041-aditya',
    'TechStore Electronics',
    3500.00,
    'DEBIT',
    'UPI',
    'Impulse Spike',
    NULL,
    FALSE,
    TRUE,
    TRUE,
    0.942,
    'goal-laptop-buy',
    4,
    CURRENT_TIMESTAMP - INTERVAL '15 MINUTE'
),
(
    'txn-routine-002',
    'acc-hdfc-4092',
    'usr-9041-aditya',
    'City International School Fees Escrow',
    15000.00,
    'DEBIT',
    'NET_BANKING',
    'Education Fees',
    NULL,
    FALSE,
    FALSE,
    FALSE,
    0.010,
    'goal-school-fees',
    0,
    CURRENT_TIMESTAMP - INTERVAL '3 DAY'
),
(
    'txn-routine-003',
    'acc-hdfc-4092',
    'usr-9041-aditya',
    'Metro Mart Supermarket',
    4280.00,
    'DEBIT',
    'CARD',
    'Groceries & Utilities',
    NULL,
    FALSE,
    FALSE,
    FALSE,
    0.025,
    NULL,
    0,
    CURRENT_TIMESTAMP - INTERVAL '5 DAY'
);

-- Insert Active Spend Lock Guardrail
INSERT INTO spend_locks (
    lock_id, user_id, lock_status, reason, duration_hours,
    locked_at, expires_at, released_by_user
) VALUES (
    'lck-spike-001',
    'usr-9041-aditya',
    'ACTIVE',
    'IMPULSE_SPIKE_VELOCITY_PRESERVATION: TechStore Electronics ₹3,500',
    24,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '24 HOUR',
    FALSE
);

-- Insert Outbound WhatsApp Telemetry Alert Log
INSERT INTO whatsapp_telemetry_logs (
    log_id, user_id, dispatch_reference, recipient_phone,
    gateway_provider, alert_type, message_content,
    delivery_status, user_action_chosen
) VALUES (
    'walog-001',
    'usr-9041-aditya',
    'TXN-ALERT-9041-01',
    '+919876543210',
    'FLOWBANK_AUTONOMOUS_NODE',
    'IMPULSE_SPIKE_WARNING',
    '🚨 *FlowBank Telemetry Alert!* A spend of *₹3,500* at *TechStore Electronics* was detected. Your critical priority *Child School Fees* remains 100% protected, but flexible goal *Laptop Buy* is delayed by *+4 Days*. Reply 1 to Lock Spend, 2 to Rebalance Priorities.',
    'DELIVERED_TO_PHONE',
    'LOCK_SPEND'
);

-- Insert Sample What-If Simulation Record
INSERT INTO whatif_simulations (
    simulation_id, user_id, simulated_amount, calculated_delay,
    impacted_goal_name, protected_goal_name, status_summary
) VALUES (
    'sim-001',
    'usr-9041-aditya',
    3500.00,
    4,
    'Laptop Upgrade (MacBook Pro)',
    'Child School Fees Q4',
    'Spending ₹3,500 extra delays Laptop target by 4 days while protecting School Fees.'
);

-- ============================================================================
-- VERIFICATION QUERY FOR JUDGES & EVALUATORS
-- Run this query to inspect complete customer financial health in one join
-- ============================================================================
-- SELECT 
--     u.customer_id,
--     u.full_name,
--     u.monthly_income,
--     b.bank_name,
--     b.current_balance,
--     c.consent_status AS aa_consent,
--     g.goal_name,
--     g.priority_tier,
--     g.current_saved,
--     g.target_amount,
--     g.velocity_status,
--     t.merchant_name AS last_spike_merchant,
--     t.amount AS last_spike_amount,
--     t.goal_delay_days,
--     l.lock_status AS discretionary_lock
-- FROM users u
-- JOIN bank_accounts b ON u.user_id = b.user_id
-- JOIN aa_consents c ON u.user_id = c.user_id
-- JOIN financial_goals g ON u.user_id = g.user_id
-- LEFT JOIN transactions t ON u.user_id = t.user_id AND t.is_anomaly = TRUE
-- LEFT JOIN spend_locks l ON u.user_id = l.user_id AND l.lock_status = 'ACTIVE';
