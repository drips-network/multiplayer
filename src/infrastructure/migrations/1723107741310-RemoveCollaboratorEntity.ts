import type { MigrationInterface, QueryRunner } from 'typeorm';
import type { UUID } from 'crypto';
import appSettings from '../../appSettings';
import type { Address } from '../../domain/typeUtils';

export class RemoveCollaboratorEntity1723107741310
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = appSettings.network;

    // Add a new column to `VotingRounds` entity to store the collaborators (initially nullable).
    await queryRunner.query(
      `ALTER TABLE "${schema}"."VotingRounds" ADD COLUMN "collaborators" varchar(42)[];`,
    );

    // Retrieve all existing VotingRounds.
    const votingRoundIds = (await queryRunner.query(
      `SELECT id FROM "${schema}"."VotingRounds"`,
    )) as { id: UUID }[];

    // For each Voting Round, get the related collaborators and update the new column.
    for (const { id } of votingRoundIds) {
      const collaborators = (await queryRunner.query(
        `SELECT "Collaborator"."address"
           FROM "${schema}"."Collaborators" "Collaborator"
           INNER JOIN "${schema}"."CollaboratorVotingRounds" "CVR" ON "Collaborator"."id" = "CVR"."collaboratorsId"
           WHERE "CVR"."votingRoundsId" = $1`,
        [id],
      )) as { address: Address }[];

      const collaboratorAddresses = collaborators.map(
        (collaborator) => collaborator.address,
      );

      await queryRunner.query(
        `UPDATE "${schema}"."VotingRounds" SET "collaborators" = $1 WHERE id = $2`,
        [collaboratorAddresses, id],
      );
    }

    // Alter the column to be non-nullable after updating the values.
    await queryRunner.query(
      `ALTER TABLE "${schema}"."VotingRounds" ALTER COLUMN "collaborators" SET NOT NULL;`,
    );

    // Drop foreign key constraint on Votes table.
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" DROP CONSTRAINT "FK_35ecaac51f05d46166bf4414a4a"`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
