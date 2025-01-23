-- Check and recreate the 'role' type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        DROP TYPE "public"."role" CASCADE;
    END IF;
    CREATE TYPE "public"."role" AS ENUM('admin', 'superuser', 'user');
END $$;

-- Check and recreate the 'accounts' table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'accounts') THEN
        DROP TABLE "public"."accounts" CASCADE;
    END IF;
    CREATE TABLE "accounts" (
        "id" text PRIMARY KEY NOT NULL,
        "plaid_id" text,
        "name" text NOT NULL,
        "user_id" text NOT NULL
    );
END $$;

-- Check and recreate the 'categories' table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'categories') THEN
        DROP TABLE "public"."categories" CASCADE;
    END IF;
    CREATE TABLE "categories" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "user_id" text NOT NULL
    );
END $$;

-- Repeat for other tables using DROP CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'clubs') THEN
        DROP TABLE "public"."clubs" CASCADE;
    END IF;
    CREATE TABLE "clubs" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "account_id" text,
        "image_url" text
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'match_dates') THEN
        DROP TABLE "public"."match_dates" CASCADE;
    END IF;
    CREATE TABLE "match_dates" (
        "id" text PRIMARY KEY NOT NULL,
        "date" timestamp NOT NULL,
        "match_id" text
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'match_scores') THEN
        DROP TABLE "public"."match_scores" CASCADE;
    END IF;
    CREATE TABLE "match_scores" (
        "id" text PRIMARY KEY NOT NULL,
        "score_one" text,
        "score_two" text
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'matches') THEN
        DROP TABLE "public"."matches" CASCADE;
    END IF;
    CREATE TABLE "matches" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "venue_id" text,
        "match_score_id" text,
        "image_url" text,
        "season_id" text,
        "club_one_id" text,
        "club_two_id" text
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'orders') THEN
        DROP TABLE "public"."orders" CASCADE;
    END IF;
    CREATE TABLE "orders" (
        "id" text PRIMARY KEY NOT NULL,
        "amount" integer NOT NULL,
        "payee" text NOT NULL,
        "notes" text,
        "date" timestamp NOT NULL,
        "account_id" text NOT NULL,
        "category_id" text NOT NULL
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'players') THEN
        DROP TABLE "public"."players" CASCADE;
    END IF;
    CREATE TABLE "players" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "club_id" text,
        "position" text,
        "image_url" text
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'products') THEN
        DROP TABLE "public"."products" CASCADE;
    END IF;
    CREATE TABLE "products" (
        "id" text PRIMARY KEY NOT NULL,
        "description" text,
        "name" text NOT NULL,
        "amount" text NOT NULL,
        "image_url" text,
        "category_id" text NOT NULL
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'seasons') THEN
        DROP TABLE "public"."seasons" CASCADE;
    END IF;
    CREATE TABLE "seasons" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "image_url" text,
        "start_date" timestamp NOT NULL,
        "end_date" timestamp NOT NULL
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'session') THEN
        DROP TABLE "public"."session" CASCADE;
    END IF;
    CREATE TABLE "session" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'stadiums') THEN
        DROP TABLE "public"."stadiums" CASCADE;
    END IF;
    CREATE TABLE "stadiums" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "image_url" text
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'stripe_customer') THEN
        DROP TABLE "public"."stripe_customer" CASCADE;
    END IF;
    CREATE TABLE "stripe_customer" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "stripeCustomerId" text NOT NULL
    );
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'users') THEN
        DROP TABLE "public"."users" CASCADE;
    END IF;
    CREATE TABLE "users" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "is_blocked" boolean DEFAULT false,
        "is_deleted" boolean DEFAULT false,
        "password" text,
        "role" "role" DEFAULT 'admin' NOT NULL,
        "otp" text,
        "otp_expires_at" timestamp with time zone
    );
END $$;


--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_dates" ADD CONSTRAINT "match_dates_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_venue_id_stadiums_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."stadiums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_match_score_id_match_scores_id_fk" FOREIGN KEY ("match_score_id") REFERENCES "public"."match_scores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_one_id_clubs_id_fk" FOREIGN KEY ("club_one_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_two_id_clubs_id_fk" FOREIGN KEY ("club_two_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;