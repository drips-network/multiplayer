/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MigrationInterface, QueryRunner } from 'typeorm';
import appSettings from '../../appSettings';

export class Initial1729510659276 implements MigrationInterface {
  name = 'Initial1729510659276';
  schema = appSettings.dbSchemaName;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const syncQuery = `
      DO $$
      DECLARE
        tables_exist boolean;
      BEGIN
      -- Check if any of the specified tables exist
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = '${this.schema}' 
        AND table_name IN ('Links', 'Votes', 'Nominations', 'VotingRounds', 'Publishers', 'AllowedReceivers')
      ) INTO tables_exist;

      -- If any table exists, log and exit
      IF tables_exist THEN
        RAISE NOTICE 'One or more tables already exist. Skipping schema creation.';
      ELSE
        -- Proceed with schema creation if no tables exist
        CREATE TABLE "${this.schema}"."Links" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "dripListId" character varying(78) NOT NULL, "safeTransactionHash" character varying(66), "isSafeTransactionExecuted" boolean, CONSTRAINT "PK_f349e17079b4e03580647d37a4c" PRIMARY KEY ("id"));
        CREATE TABLE "${this.schema}"."Votes" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "collaborator" character varying(42) NOT NULL, "receivers" json NOT NULL, "votingRoundId" uuid NOT NULL, CONSTRAINT "PK_1a640338dd383276aed15c8d9df" PRIMARY KEY ("id"));
        CREATE TYPE "${this.schema}"."Nominations_status_enum" AS ENUM('pending', 'accepted', 'rejected');
        CREATE TABLE "${this.schema}"."Nominations" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "status" "${this.schema}"."Nominations_status_enum" NOT NULL, "receiver" json, "statusChangedAt" TIMESTAMP NOT NULL, "address" character varying(42) NOT NULL, "description" character varying(200) NOT NULL, "impactMetrics" json NOT NULL, "votingRoundId" uuid NOT NULL, CONSTRAINT "PK_39c2ff295ad8e5f868d99542387" PRIMARY KEY ("id"));
        CREATE TABLE "${this.schema}"."VotingRounds" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "votingStartsAt" TIMESTAMP WITH TIME ZONE NOT NULL, "votingEndsAt" TIMESTAMP WITH TIME ZONE NOT NULL, "nominationStartsAt" TIMESTAMP WITH TIME ZONE, "nominationEndsAt" TIMESTAMP WITH TIME ZONE, "dripListId" character varying(78), "name" character varying(80), "description" character varying(1000), "areVotesPrivate" boolean NOT NULL, "collaborators" character varying(42) array NOT NULL, "publisherId" uuid NOT NULL, "linkId" uuid, "chainId" integer NOT NULL, CONSTRAINT "REL_c6fc9578bf91be54d8002d2f04" UNIQUE ("linkId"), CONSTRAINT "PK_c4aed13dca2449d513431cab671" PRIMARY KEY ("id"));
        CREATE TABLE "${this.schema}"."Publishers" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "address" character varying(42) NOT NULL, CONSTRAINT "PK_d7afb0adb9e19a29da8642ff7c2" PRIMARY KEY ("id"));
        CREATE TABLE "${this.schema}"."AllowedReceivers" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "receivers" json NOT NULL, "votingRoundId" uuid NOT NULL, CONSTRAINT "PK_ad83abc4fbd0099ec59321bff01" PRIMARY KEY ("id"));

        -- Add foreign key constraints
        ALTER TABLE "${this.schema}"."Votes" ADD CONSTRAINT "FK_c1a823243970b45923c3d767bff" FOREIGN KEY ("votingRoundId") REFERENCES "${this.schema}"."VotingRounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "${this.schema}"."Nominations" ADD CONSTRAINT "FK_f6621b6b1dc1befa2a5bdd13ae3" FOREIGN KEY ("votingRoundId") REFERENCES "${this.schema}"."VotingRounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "${this.schema}"."VotingRounds" ADD CONSTRAINT "FK_e73d61acc4c181152ddd3f4fb61" FOREIGN KEY ("publisherId") REFERENCES "${this.schema}"."Publishers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "${this.schema}"."VotingRounds" ADD CONSTRAINT "FK_c6fc9578bf91be54d8002d2f04e" FOREIGN KEY ("linkId") REFERENCES "${this.schema}"."Links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "${this.schema}"."AllowedReceivers" ADD CONSTRAINT "FK_1eec4ba37caeb4df788d4bcc6ea" FOREIGN KEY ("votingRoundId") REFERENCES "${this.schema}"."VotingRounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
      END IF;
    END $$;
  `;

    await queryRunner.query(syncQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
