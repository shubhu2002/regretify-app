-- =========================
-- Ledger Books Table (top-level grouping)
-- =========================
CREATE TABLE "regretify-ledger-books" (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT fk_ledger_book_user
    FOREIGN KEY (user_id)
    REFERENCES "regretify-users"(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_ledger_books_user_id ON "regretify-ledger-books"(user_id);

-- =========================
-- Add ledger_book_id to accounts table
-- =========================
ALTER TABLE "regretify-ledger" ADD COLUMN ledger_book_id INTEGER;

-- Create a default ledger book for each user who has accounts, then link them
-- (Run this as a data migration)
INSERT INTO "regretify-ledger-books" (user_id, name, description)
SELECT DISTINCT user_id, 'My Ledger', 'Default ledger'
FROM "regretify-ledger";

UPDATE "regretify-ledger" a
SET ledger_book_id = b.id
FROM "regretify-ledger-books" b
WHERE a.user_id = b.user_id AND b.name = 'My Ledger';

-- Now make it NOT NULL and add FK
ALTER TABLE "regretify-ledger" ALTER COLUMN ledger_book_id SET NOT NULL;

ALTER TABLE "regretify-ledger"
  ADD CONSTRAINT fk_ledger_account_book
    FOREIGN KEY (ledger_book_id)
    REFERENCES "regretify-ledger-books"(id)
    ON DELETE CASCADE;

CREATE INDEX idx_ledger_book_id ON "regretify-ledger"(ledger_book_id);
