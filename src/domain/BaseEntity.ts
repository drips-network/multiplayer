import { randomUUID, type UUID } from 'crypto';
import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export default abstract class BaseEntity {
  @PrimaryColumn('uuid')
  id!: UUID;
  @BeforeInsert()
  generateUuid() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
