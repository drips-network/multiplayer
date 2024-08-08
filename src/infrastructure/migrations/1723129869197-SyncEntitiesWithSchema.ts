import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncEntitiesWithSchema1723129869197 implements MigrationInterface {
  name = 'SyncEntitiesWithSchema1723129869197';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = 'sepolia';

    // Add a temporary nullable column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" ADD COLUMN "newCollaborator" character varying(42)`,
    );

    // Update the new column with appropriate values
    await queryRunner.query(
      `UPDATE "${schema}"."Votes" SET "newCollaborator" = (SELECT "Collaborators"."address" FROM "${schema}"."Collaborators" WHERE "${schema}"."Votes"."collaboratorId" = "Collaborators"."id")`,
    );

    // Make the new column non-nullable
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" ALTER COLUMN "newCollaborator" SET NOT NULL`,
    );

    // Drop the old column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" DROP COLUMN "collaboratorId"`,
    );

    // Rename the new column to the old column name
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" RENAME COLUMN "newCollaborator" TO "collaborator"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = 'sepolia';

    // Add the old column back
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" ADD COLUMN "collaboratorId" uuid`,
    );

    // Update the old column with appropriate values
    await queryRunner.query(
      `UPDATE "${schema}"."Votes" SET "collaboratorId" = (SELECT "id" FROM "${schema}"."Collaborators" WHERE "${schema}"."Votes"."collaborator" = "Collaborators"."address")`,
    );

    // Make the old column non-nullable
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" ALTER COLUMN "collaboratorId" SET NOT NULL`,
    );

    // Drop the new column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" DROP COLUMN "collaborator"`,
    );

    // Rename the old column to the new column name
    await queryRunner.query(
      `ALTER TABLE "${schema}"."Votes" RENAME COLUMN "collaboratorId" TO "collaborator"`,
    );
  }
}
