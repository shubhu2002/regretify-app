-- =========================
-- Function for custom user id
-- =========================
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := 'user_';
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;


-- =========================
-- Users Table
-- =========================
CREATE TABLE "regretify-users" (
  id TEXT PRIMARY KEY DEFAULT generate_user_id(),
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  profile TEXT,
  contact_number TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_regretify_users_email 
ON "regretify-users"(email);


-- =========================
-- Incomes Table
-- =========================
CREATE TABLE incomes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT fk_incomes_user
    FOREIGN KEY (user_id)
    REFERENCES "regretify-users"(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_date ON incomes(date);


-- =========================
-- Expenses Table
-- =========================
CREATE TABLE "regretify-expenses" (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  name TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT fk_expenses_user
    FOREIGN KEY (user_id)
    REFERENCES "regretify-users"(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_expenses_user_id ON "regretify-expenses"(user_id);
CREATE INDEX idx_expenses_date ON "regretify-expenses"(date);
CREATE INDEX idx_expenses_category ON "regretify-expenses"(category);