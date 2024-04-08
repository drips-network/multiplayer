import type { NominationReceiver } from '../../domain/votingRoundAggregate/Nomination';
import type Nomination from '../../domain/votingRoundAggregate/Nomination';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type { NominationDto } from '../../features/nominate/NominateRequest';
import type { NominationInfoDto, ReceiverDto } from '../dtos';

export default interface IReceiverMapper {
  mapToReceiver(receiverDto: ReceiverDto): Promise<Receiver>;
  mapToNominationReceiver(
    receiverDto: NominationDto,
  ): Promise<NominationReceiver>;
  mapToNominationInfoDto(nomination: Nomination): NominationInfoDto;
  mapToReceiverDto(receiver: Receiver): ReceiverDto;
}
