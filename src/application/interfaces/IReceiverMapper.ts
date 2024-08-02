import type { AllowedReceiverData } from '../../domain/allowedReceiver/AllowedReceiver';
import type { NominationReceiver } from '../../domain/votingRoundAggregate/Nomination';
import type Nomination from '../../domain/votingRoundAggregate/Nomination';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type {
  AllowedReceiverDto,
  NominationDto,
  NominationInfoDto,
  ReceiverDto,
} from '../dtos';

export default interface IReceiverMapper {
  mapToReceiver(receiverDto: ReceiverDto): Promise<Receiver>;
  mapToAllowedReceiver(
    receiverDto: AllowedReceiverDto,
  ): Promise<AllowedReceiverData>;
  mapToNominationReceiver(
    receiverDto: NominationDto,
  ): Promise<NominationReceiver>;
  mapToNominationInfoDto(nomination: Nomination): NominationInfoDto;
  mapToReceiverDto(receiver: Receiver): ReceiverDto;
}
