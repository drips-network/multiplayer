import { randomUUID, type UUID } from 'crypto';
import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export default abstract class BaseEntity {
  @PrimaryColumn('uuid', {
    name: 'id',
  })
  public _id!: UUID;
  @BeforeInsert()
  generateUuid() {
    if (!this._id) {
      this._id = randomUUID();
    }
  }

  @CreateDateColumn({ name: 'createdAt' })
  public _createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  public _updatedAt!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  public _deletedAt!: Date;
}
