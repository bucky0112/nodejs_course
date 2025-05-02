CREATE TABLE "heroes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"gender" char(1),
	"age" integer,
	"hero_level" char(1) NOT NULL,
	"hero_rank" integer,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "monsters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"danger_level" char(1) NOT NULL,
	"description" text,
	"kill_by" integer
);
