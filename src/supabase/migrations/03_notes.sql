-- =========================
-- Notes Table
-- =========================
CREATE TABLE "regretify-notes" (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  pinned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id)
    REFERENCES "regretify-users"(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_id ON "regretify-notes"(user_id);
CREATE INDEX idx_notes_updated_at ON "regretify-notes"(updated_at DESC);
