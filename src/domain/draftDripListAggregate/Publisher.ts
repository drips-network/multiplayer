import { Column } from 'typeorm';
import {
  isAddressDriverId,
  type Address,
  type AddressDriverId,
  isEthAddress,
} from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type { IValueObject } from '../IValueObject';
import { InvalidArgumentError } from '../errors';

export default class Publisher implements IValueObject {
  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    nullable: false,
    name: 'addressDriverId',
  })
  public _addressId!: AddressDriverId;

  @Column('varchar', {
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    name: 'address',
  })
  public _address!: Address;

  public static create(addressDriverId: string, address: string) {
    if (!isAddressDriverId(addressDriverId)) {
      throw new InvalidArgumentError('Invalid addressDriverId.');
    }

    if (!isEthAddress(address)) {
      throw new InvalidArgumentError('Invalid address.');
    }

    const publisher = new Publisher();

    publisher._addressId = addressDriverId;
    publisher._address = address;

    return publisher;
  }
}
