-- Create auto-close function and schedule with pg_cron
-- Task T013: Create close_expired_auctions() function
-- Task T014: Enable pg_cron extension
-- Task T015: Schedule pg_cron job

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to close expired auctions
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE auctions
  SET status = 'ended'
  WHERE ends_at < now()
    AND status = 'active';
END;
$$;

-- Schedule cron job to run every minute
-- Note: This may need to be run separately in Supabase dashboard depending on permissions
SELECT cron.schedule(
  'close-expired-auctions',
  '* * * * *',
  $$ SELECT close_expired_auctions() $$
);
