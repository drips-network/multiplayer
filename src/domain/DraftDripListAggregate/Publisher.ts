import { Column, Entity } from 'typeorm';
import {
  isAddressId,
  type Address,
  type AddressId,
  isEthAddress,
} from '../typeUtils';
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
  public _addressId!: AddressId;

  @Column('varchar', {
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    unique: true,
  })
  public _address!: Address;

  public static new(addressId: string, address: string) {
    if (!isAddressId(addressId)) {
      throw new Error('Invalid addressId.');
    }

    if (!isEthAddress(address)) {
      throw new Error('Invalid address.');
    }

    const publisher = new Publisher();

    publisher._addressId = addressId;
    publisher._address = address;

    return publisher;
  }
}
