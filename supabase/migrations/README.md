# Supabase Database Migrations

This directory contains SQL migration files for the Mobile Auction Platform (Bidit).

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project at https://supabase.com
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `001_create_auctions_table.sql`
   - `002_create_bids_table.sql`
   - `003_create_triggers.sql`
   - `004_create_cron_functions.sql`
   - `005_insert_test_data.sql`

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Migration Files

| File | Purpose | Tasks |
|------|---------|-------|
| `001_create_auctions_table.sql` | Creates auctions table with indexes | T007, T009 |
| `002_create_bids_table.sql` | Creates bids table with indexes | T008, T010 |
| `003_create_triggers.sql` | Creates validate_bid() trigger | T011, T012 |
| `004_create_cron_functions.sql` | Creates auto-close function and pg_cron job | T013, T014, T015 |
| `005_insert_test_data.sql` | Inserts sample auction data | T016 |

## Verification (Task T017)

After running all migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('auctions', 'bids');

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('auctions', 'bids');

-- Check triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check cron jobs (may require admin permissions)
SELECT * FROM cron.job;

-- Verify test data
SELECT COUNT(*) as auction_count FROM auctions;
SELECT COUNT(*) as bid_count FROM bids;
```

## Notes

- **pg_cron**: The cron job setup in `004_create_cron_functions.sql` may require admin permissions. If it fails, you can manually schedule it in the Supabase dashboard under Database → Cron Jobs.
- **RLS**: Row Level Security is disabled for MVP. It will be enabled in Phase 8 when authentication is added.
- **Test Data**: The test auctions have varying end times (30 min to 3 hours from creation) to test the auto-close functionality.
