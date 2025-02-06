import { createInsertSchema } from "drizzle-zod";
import { integer, pgEnum, pgTable, text, timestamp,boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { EnumValues, z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "superuser", "user"]);
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified:boolean("email_verified").default(false),
  googleId:text("google_id"),
  picture:text("picture"),
  isBlocked: boolean("is_blocked").default(false),
  isDeleted: boolean("is_deleted").default(false),
  hashedpassword: text("password"),
  role: roleEnum("role").default("user").notNull(),
  otp: text("otp"),
  otpExpiresAt: timestamp("otp_expires_at", {
    withTimezone: true,
    mode: "date"
  }),
});
export type Role = "admin" | "superuser" | "user";

export interface User{
  id:string;
  name:string;
  email:string;
  emailVerified:boolean;
  googleId: string | null;
  isBlocked:boolean;
  isDeleted:boolean;
  role:Role;
  picture: string | null;
}

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const insertUserSchema = createInsertSchema(users);

export const sessions = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const insertSessionSchema = createInsertSchema(sessions);

export interface Session {
  id:string;
  expiresAt:Date;
  userId:string;
}

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  orders: many(orders),
}));

export const insertAccountSchema = createInsertSchema(accounts);

export const clubs = pgTable("clubs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // stadiumId: text("stadium_id").references(() => stadium.id, {
  //   onDelete: "cascade",
  // }),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  imageUrl: text("image_url"),
});

export const insertClubSchema = createInsertSchema(clubs);

export const clubsRelations = relations(clubs, ({ many, one }) => ({
  // matches: many(matches),
  players: many(players),
  account: one(accounts, {
    fields: [clubs.accountId],
    references: [accounts.id],
  }),
}));

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clubId: text("club_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  position: text("position"),
  imageUrl: text("image_url"),
});

export const insertPlayerSchema = createInsertSchema(players);

export const playersRelations = relations(players, ({ one }) => ({
  club: one(clubs, {
    fields: [players.clubId],
    references: [clubs.id],
  }),
}));

export const stadium = pgTable("stadiums", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const insertStadiumSchema = createInsertSchema(stadium);

export const stadiumRelations = relations(stadium, ({ many }) => ({
  // matches: many(matches),
}));

export const seasons = pgTable("seasons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const insertSeasonSchema = createInsertSchema(seasons);

export const seasonsRelations = relations(seasons, ({ many }) => ({
  matches: many(matches),
}));

export const matches = pgTable("matches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  venue: text("venue_id").references(() => stadium.id, {
    onDelete: "cascade",
  }),
  matchScoreId: text("match_score_id").references(() => matchScores.id, {
    onDelete: "cascade",
  }),
  imageUrl: text("image_url"),
  seasonId: text("season_id").references(() => seasons.id, {
    onDelete: "cascade",
  }),
  clubOneId: text("club_one_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
  clubTwoId: text("club_two_id").references(() => clubs.id, {
    onDelete: "cascade",
  }),
});

export const insertMatchSchema = createInsertSchema(matches);

export const matchesRelations = relations(matches, ({ one, many }) => ({
  clubOne: one(clubs, {
    fields: [matches.clubOneId],
    references: [clubs.id],
  }),
  clubTwo: one(clubs, {
    fields: [matches.clubTwoId],
    references: [clubs.id],
  }),
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
  venue: one(stadium, {
    fields: [matches.venue],
    references: [stadium.id],
  }),
  matchDates: many(matchDates),
  matchScores: one(matchScores, {
    fields: [matches.matchScoreId],
    references: [matchScores.id],
  }),
}));

export const matchDates = pgTable("match_dates", {
  id: text("id").primaryKey(),
  date: timestamp("date").notNull(),
  matchId: text("match_id").references(() => matches.id, {
    onDelete: "cascade",
  }),
});

export const insertMatchDateSchema = createInsertSchema(matchDates);

export const matchDatesRelations = relations(matchDates, ({ one }) => ({
  match: one(matches, {
    fields: [matchDates.matchId],
    references: [matches.id],
  }),
}));

export const matchScores = pgTable("match_scores", {
  id: text("id").primaryKey(),
  scoreOne: text("score_one"),
  scoreTwo: text("score_two"),
});

export const insertMatchScoreSchema = createInsertSchema(matchScores);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  //userId: text("user_id").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const insertCategorySchema = createInsertSchema(categories);

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  description: text("description"),
  name: text("name").notNull(),
  amount: text("amount").notNull(),
  imageUrl: text("image_url"),
  categoryId: text("category_id")
    .references(() => categories.id, { onDelete: "set null" })
    .notNull(),
  // accountId: text("account_id").references(() => accounts.id, {
  //   onDelete: "cascade",
  // }),
});

export const productsRelations = relations(products, ({ one }) => ({
  // account: one(accounts, {
  //   fields: [products.accountId],
  //   references: [accounts.id],
  // }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const insertProductSchema = createInsertSchema(products);

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: text("category_id")
    .references(() => categories.id, { onDelete: "set null" })
    .notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  account: one(accounts, {
    fields: [orders.accountId],
    references: [accounts.id],
  }),
}));

export const insertOrderSchema = createInsertSchema(orders, {
  date: z.coerce.date(),
});

export const stripeCustomer = pgTable("stripe_customer", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  stripeCustomerId: text("stripeCustomerId").notNull(),
});