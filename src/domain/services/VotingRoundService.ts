import type IVotingRoundRepository from '../votingRoundAggregate/IVotingRoundRepository';
import { InvalidVotingRoundOperationError } from '../errors';
import type { Address, DripListId } from '../typeUtils';
import VotingRound from '../votingRoundAggregate/VotingRound';
import type Publisher from '../publisherAggregate/Publisher';
import type IPublisherRepository from '../publisherAggregate/IPublisherRepository';
import type IAllowedReceiversRepository from '../allowedReceiver/IAllowedReceiversRepository';
import type { AllowedReceiverData } from '../allowedReceiver/AllowedReceiver';
import AllowedReceiver from '../allowedReceiver/AllowedReceiver';
import type { ChainId } from '../../application/network';

export default class VotingRoundService {
  private readonly _publisherRepository: IPublisherRepository;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _allowedReceiversRepository: IAllowedReceiversRepository;

  public constructor(
    publisherRepository: IPublisherRepository,
    votingRoundRepository: IVotingRoundRepository,
    allowedReceiversRepository: IAllowedReceiversRepository,
  ) {
    this._publisherRepository = publisherRepository;
    this._votingRoundRepository = votingRoundRepository;
    this._allowedReceiversRepository = allowedReceiversRepository;
  }

  public async start(
    startsAt: Date,
    endsAt: Date,
    publisher: Publisher,
    dripListId: DripListId | undefined,
    name: string | undefined,
    description: string | undefined,
    collaborators: Address[],
    areVotesPrivate: boolean,
    chainId: ChainId,
    nominationStartsAt: Date | undefined = undefined,
    nominationEndsAt: Date | undefined = undefined,
    allowedReceiversData: AllowedReceiverData[] | undefined = undefined,
  ): Promise<VotingRound> {
    if (!collaborators?.length) {
      throw new InvalidVotingRoundOperationError('Collaborators are missing.');
    }

    const activeVotingRounds =
      await this._votingRoundRepository.getActiveVotingRoundsByPublisher(
        publisher,
      );

    if (
      activeVotingRounds.filter((r) => r._dripListId === dripListId).length > 0
    ) {
      throw new InvalidVotingRoundOperationError(
        'Publisher already has an active voting round for this existing Drip List.',
      );
    }

    const existingPublisher = await this._publisherRepository.getByAddress(
      publisher._address,
    );

    const newVotingRound = VotingRound.create(
      startsAt,
      endsAt,
      existingPublisher || publisher,
      chainId,
      dripListId,
      name,
      description,
      collaborators,
      areVotesPrivate,
      nominationStartsAt,
      nominationEndsAt,
    );

    await this._votingRoundRepository.save(newVotingRound);

    await this._setAllowedReceivers(allowedReceiversData, newVotingRound);

    return newVotingRound;
  }

  private async _setAllowedReceivers(
    allowedReceiversData: AllowedReceiverData[] | undefined,
    votingRound: VotingRound,
  ) {
    if (allowedReceiversData?.length) {
      const allowedReceivers = await Promise.all(
        allowedReceiversData.map(async (receiverData) =>
          AllowedReceiver.create(votingRound, receiverData),
        ),
      );

      // Create allowed receivers...
      await this._allowedReceiversRepository.createMany(allowedReceivers);

      // ... and link them to the voting round.
      votingRound._allowedReceivers = allowedReceivers; // eslint-disable-line no-param-reassign
      await this._votingRoundRepository.save(votingRound);
    }
  }
}
