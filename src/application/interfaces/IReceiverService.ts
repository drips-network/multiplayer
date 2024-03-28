import type { NominationReceiver } from '../../domain/votingRoundAggregate/Nomination';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type { NominationDto } from '../../features/nominate/NominateRequest';
import type { ReceiverDto } from '../dtos/ReceiverDto';

export default interface IReceiverService {
  mapToReceiver(receiverDto: ReceiverDto): Promise<Receiver>;
  mapToNominationReceiver(
    receiverDto: NominationDto,
  ): Promise<NominationReceiver>;
}
