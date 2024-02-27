import { Column, Entity } from 'typeorm';
import type { Address, AddressId } from '../typeUtils';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../DataSchemaConstants';

@Entity({
  name: 'Publishers',
})
export default class Publisher extends BaseEntity {
  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_LENGTH,
    nullable: false,
    unique: true,
  })
  public readonly addressId: AddressId;

  @Column('varchar', {
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    unique: true,
  })
  public readonly address: Address;

  public constructor(addressId: AddressId, address: Address) {
    super();

    this.addressId = addressId;
    this.address = address;
  }
}
