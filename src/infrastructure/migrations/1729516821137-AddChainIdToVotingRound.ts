import type { MigrationInterface, QueryRunner } from 'typeorm';
import appSettings from '../../appSettings';

export class AddChainIdToVotingRound1729516821137
  implements MigrationInterface
{
  name = 'AddChainIdToVotingRound1729516821137';
  schema = appSettings.network.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the column 'chainId' without the NOT NULL constraint.
    await queryRunner.query(`
        ALTER TABLE "${this.schema}"."VotingRounds" ADD COLUMN "chainId" integer;
      `);

    // Update existing rows to set the chain ID to 1. At the point of migration we only have data for the Ethereum mainnet.
    await queryRunner.query(`
        UPDATE "${this.schema}"."VotingRounds" SET "chainId" = ${appSettings.chainId};
      `);

    // Alter the column to make it NOT NULL after all rows have a value.
    await queryRunner.query(`
        ALTER TABLE "${this.schema}"."VotingRounds" ALTER COLUMN "chainId" SET NOT NULL;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the 'chainId' column from 'VotingRounds'.
    await queryRunner.query(`
        ALTER TABLE "${this.schema}"."VotingRounds" DROP COLUMN "chainId";
      `);
  }
}
