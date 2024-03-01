import { Column } from 'typeorm';
import {
  isAddressId,
  type Address,
  type AddressId,
  isEthAddress,
} from '../typeUtils';
import DataSchemaConstants from '../DataSchemaConstants';
import type { IValueObject } from '../IValueObject';
import { InvalidArgumentError } from '../errors';

export default class Publisher implements IValueObject {
  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_LENGTH,
    nullable: false,
    unique: true,
    name: 'addressId',
  })
  public _addressId!: AddressId;

  @Column('varchar', {
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    unique: true,
    name: 'address',
  })
  public _address!: Address;

  public static new(addressId: string, address: string) {
    if (!isAddressId(addressId)) {
      throw new InvalidArgumentError('Invalid addressId.');
    }

    if (!isEthAddress(address)) {
      throw new InvalidArgumentError('Invalid address.');
    }

    const publisher = new Publisher();

    publisher._addressId = addressId;
    publisher._address = address;

    return publisher;
  }
}
