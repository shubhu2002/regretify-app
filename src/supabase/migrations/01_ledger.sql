-- =========================
-- Ledger Accounts Table
-- =========================
CREATE TABLE "regretify-ledger" (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT fk_ledger_user
    FOREIGN KEY (user_id)
    REFERENCES "regretify-users"(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_ledger_user_id ON "regretify-ledger"(user_id);


-- =========================
-- Ledger Entries Table
-- =========================
CREATE TABLE "regretify-ledger-entries" (
  id SERIAL PRIMARY KEY,
  ledger_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  date TIMESTAMPTZ DEFAULT now() NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('give', 'take')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT fk_ledger_entry_ledger
    FOREIGN KEY (ledger_id)
    REFERENCES "regretify-ledger"(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_ledger_entry_user
    FOREIGN KEY (user_id)
    REFERENCES "regretify-users"(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_ledger_entries_ledger_id ON "regretify-ledger-entries"(ledger_id);
CREATE INDEX idx_ledger_entries_user_id ON "regretify-ledger-entries"(user_id);
CREATE INDEX idx_ledger_entries_date ON "regretify-ledger-entries"(date);

-- =========================
-- Add starred column
-- =========================
ALTER TABLE "regretify-ledger-entries" ADD COLUMN starred BOOLEAN DEFAULT false NOT NULL;
