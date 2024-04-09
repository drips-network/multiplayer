/* eslint-disable dot-notation */
import Collaborator from '../../src/domain/collaboratorAggregate/Collaborator';
import { TOTAL_VOTE_WEIGHT } from '../../src/domain/constants';
import Link from '../../src/domain/linkedDripList/Link';
import Publisher from '../../src/domain/publisherAggregate/Publisher';
import type { AccountId, DripListId } from '../../src/domain/typeUtils';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';
import VotingRound, {
  VotingRoundStatus,
} from '../../src/domain/votingRoundAggregate/VotingRound';
import Vote from '../../src/domain/votingRoundAggregate/Vote';
import type { NominationReceiver } from '../../src/domain/votingRoundAggregate/Nomination';
import Nomination, {
  NominationStatus,
} from '../../src/domain/votingRoundAggregate/Nomination';
import {
  now,
  tomorrow,
  twoDaysAfter,
  twoDaysAgo,
  yesterday,
} from '../testUtils';

describe('VotingRound', () => {
  describe('status', () => {
    it('should return Deleted when deletedAt is set', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._deletedAt = yesterday;

      // Act
      const result = votingRound.status;

      // Assert
      expect(result).toBe(VotingRoundStatus.Deleted);
    });

    it('should return Linked when linkedAt is set', () => {
      // Arrange
      const votingRound = new VotingRound();

      const link = new Link();
      link._updatedAt = now;

      votingRound._link = link;

      // Act
      const result = votingRound.status;

      // Assert
      expect(result).toBe(VotingRoundStatus.Linked);
    });

    it('should return Completed when end date is in the past', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._endsAt = yesterday;

      // Act
      const result = votingRound.status;

      // Assert
      expect(result).toBe(VotingRoundStatus.Completed);
    });

    it('should return Started deletedAt and linkedAt are not set and end date is in future', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._endsAt = tomorrow;

      // Act
      const result = votingRound.status;

      // Assert
      expect(result).toBe(VotingRoundStatus.Started);
    });
  });

  describe('linkedAt', () => {
    it("should return the Link's updatedAt date when the Voting Round is linked", () => {
      // Arrange
      const votingRound = new VotingRound();

      const link = new Link();
      link._updatedAt = yesterday;

      votingRound._link = link;

      // Act
      const result = votingRound.linkedAt;

      // Assert
      expect(result).toBe(link._updatedAt);
    });

    it('should return undefined when the Voting Round is not linked', () => {
      // Arrange
      const votingRound = new VotingRound();

      // Act
      const result = votingRound.linkedAt;

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('hasNominationPeriod', () => {
    it('should return true when the nomination period is set', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = twoDaysAgo;
      votingRound._nominationEndsAt = yesterday;

      // Act
      const result = votingRound.hasNominationPeriod;

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when the nomination period is not set', () => {
      // Arrange
      const votingRound = new VotingRound();

      // Act
      const result = votingRound.hasNominationPeriod;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isOpenForNominations', () => {
    it('should return true when the nomination period is set and nomination period end date is in the future', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = yesterday;
      votingRound._nominationEndsAt = tomorrow;

      // Act
      const result = votingRound.isOpenForNominations;

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when the nomination period is set and nomination period end date is in the past', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = twoDaysAgo;
      votingRound._nominationEndsAt = yesterday;

      // Act
      const result = votingRound.isOpenForNominations;

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when the nomination period is not set', () => {
      // Arrange
      const votingRound = new VotingRound();

      // Act
      const result = votingRound.isOpenForNominations;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasVotingPeriodStarted', () => {
    it('should return true when voting start date is in the past', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._startsAt = yesterday;

      // Act
      const result = votingRound.hasVotingPeriodStarted;

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when voting start date is in the future', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._startsAt = tomorrow;

      // Act
      const result = votingRound.hasVotingPeriodStarted;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw when start date is after end date', () => {
      // Arrange
      const startsAt = twoDaysAfter;
      const endsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          null as any,
          null as any,
        );

      // Assert
      expect(create).toThrow('Start date must be before end date.');
    });

    it('should throw when start date is in the past', () => {
      // Arrange
      const startsAt = yesterday;
      const endsAt = now;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          null as any,
          null as any,
        );

      // Assert
      expect(create).toThrow('Start date must be in the future.');
    });

    it('should throw when nomination start date is set but end is not', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          nominationStartsAt,
          null as any,
        );

      // Assert
      expect(create).toThrow(
        'Both nomination start and end dates must be provided.',
      );
    });

    it('should throw when nomination end date is set but start is not', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationEndsAt = now;

      // Act
      const act = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          null as any,
          nominationEndsAt,
        );

      // Assert
      expect(act).toThrow(
        'Both nomination start and end dates must be provided.',
      );
    });

    it('should not throw when both nomination start and end dates are set', () => {
      // Arrange
      const startsAt = twoDaysAfter;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).not.toThrow();
    });

    it('should throw when nomination start date is in the past', () => {
      // Arrange
      const startsAt = twoDaysAfter;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = twoDaysAgo;
      const nominationEndsAt = yesterday;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow('Nomination start date must be in the future.');
    });

    it('should throw when nomination end date is after start date', () => {
      // Arrange
      const startsAt = twoDaysAfter;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = tomorrow;
      const nominationEndsAt = twoDaysAgo;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow(
        'Nomination start date must be before nomination end date.',
      );
    });

    it('should throw when nomination end date is after voting start date', () => {
      // Arrange
      const startsAt = now;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          null as any,
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow(
        'Nomination end date must be before the voting round start date.',
      );
    });

    it('should throw when name is greater than 80 characters long', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          Array(81).fill('x').join(''),
          null as any,
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow('Name must be less than 80 characters long.');
    });

    it('should throw when description is greater than 200 characters long', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          Array(201).fill('x').join(''),
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow(
        'Description must be less than 200 characters long.',
      );
    });

    it('should throw when description is provided but name is missing', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          null as any,
          'description',
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow('Name must be provided.');
    });

    it('should throw when name, description and drip List ID are provided', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          'dripListId' as DripListId,
          'name',
          'description',
          [],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow(
        'You can provide either a Drip List id or a name and description, but not both.',
      );
    });

    it('should throw when collaborators contain duplicates', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;

      // Act
      const create = () =>
        VotingRound.create(
          startsAt,
          endsAt,
          null as any,
          null as any,
          'name',
          'description',
          [
            {
              _address: 'address',
            } as unknown as Collaborator,
            {
              _address: 'address',
            } as unknown as Collaborator,
          ],
          null as any,
          nominationStartsAt,
          nominationEndsAt,
        );

      // Assert
      expect(create).toThrow('Collaborators cannot contain duplicates.');
    });

    it('should create a Voting Round when all parameters are valid', () => {
      // Arrange
      const startsAt = tomorrow;
      const endsAt = twoDaysAfter;
      const nominationStartsAt = now;
      const nominationEndsAt = tomorrow;
      const publisher = new Publisher();

      // Act
      const votingRound = VotingRound.create(
        startsAt,
        endsAt,
        publisher,
        null as any,
        'name',
        'description',
        [
          {
            _address: 'address1',
          } as unknown as Collaborator,
          {
            _address: 'address2',
          } as unknown as Collaborator,
        ],
        false,
        nominationStartsAt,
        nominationEndsAt,
      );

      // Assert
      expect(votingRound._name).toBe('name');
      expect(votingRound._endsAt).toBe(endsAt);
      expect(votingRound._startsAt).toBe(startsAt);
      expect(votingRound._publisher).toBe(publisher);
      expect(votingRound._areVotesPrivate).toBe(false);
      expect(votingRound._collaborators).toHaveLength(2);
      expect(votingRound._description).toBe('description');
      expect(votingRound._nominationEndsAt).toBe(nominationEndsAt);
      expect(votingRound._collaborators![0]._address).toBe('address1');
      expect(votingRound._collaborators![1]._address).toBe('address2');
      expect(votingRound._nominationStartsAt).toBe(nominationStartsAt);
    });
  });

  describe('castVote', () => {
    it('should throw when the collaborator is not part the Voting Round', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._collaborators = [
        {
          _address: 'address1',
        } as unknown as Collaborator,
        {
          _address: 'address2',
        } as unknown as Collaborator,
      ];

      // Act
      const castVote = () => votingRound.castVote(new Collaborator(), []);

      // Assert
      expect(castVote).toThrow('Collaborator is not part of the voting round.');
    });

    it('should throw when receivers are more than 200', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._collaborators = [
        {
          _address: 'address1',
        } as unknown as Collaborator,
        {
          _address: 'address2',
        } as unknown as Collaborator,
      ];

      // Act
      const castVote = () =>
        votingRound.castVote(
          votingRound._collaborators![0],
          Array(201).fill(''),
        );

      // Assert
      expect(castVote).toThrow(
        'A maximum of 200 vote allocations can be added to a voting round.',
      );
    });

    it("should throw when the sum of receivers's weight is not equal to 1000000", () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._collaborators = [
        {
          _address: 'address1',
        } as unknown as Collaborator,
        {
          _address: 'address2',
        } as unknown as Collaborator,
      ];

      // Act
      const castVote = () =>
        votingRound.castVote(votingRound._collaborators![0], [
          {
            weight: 1,
          } as unknown as Receiver,
        ]);

      // Assert
      expect(castVote).toThrow(
        `The sum of the weights must be ${TOTAL_VOTE_WEIGHT} for each vote allocation.`,
      );
    });

    it('should create a vote when all parameters are valid', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._collaborators = [
        {
          _address: 'address1',
        } as unknown as Collaborator,
        {
          _address: 'address2',
        } as unknown as Collaborator,
      ];

      // Act
      votingRound.castVote(votingRound._collaborators![0], [
        {
          weight: 500000,
        } as unknown as Receiver,
        {
          weight: 500000,
        } as unknown as Receiver,
      ]);

      // Assert
      expect(votingRound._votes).toHaveLength(1);
    });
  });

  describe('getLatestVotes', () => {
    it('should return the latest votes for each receiver', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._collaborators = [
        {
          _address: 'collaborator1',
        } as unknown as Collaborator,
        {
          _address: 'collaborator2',
        } as unknown as Collaborator,
      ];

      votingRound._votes = [
        {
          _votingRound: votingRound,
          _collaborator: {
            _address: 'collaborator1',
          },
          _updatedAt: twoDaysAgo,
          _receiversJson: JSON.stringify([
            {
              address: 'address1',
              weight: 500000,
              type: 'address',
              accountId: 'accountId1',
            },
            {
              address: 'address2',
              weight: 500000,
              type: 'address',
              accountId: 'accountId2',
            },
          ]),
        } as unknown as Vote,
        {
          _votingRound: votingRound,
          _collaborator: {
            _address: 'collaborator1',
          },
          _updatedAt: yesterday,
          _receiversJson: JSON.stringify([
            {
              address: 'address1',
              weight: 1000000,
              type: 'address',
              accountId: 'accountId1',
            },
          ]),
        } as unknown as Vote,
        {
          _votingRound: votingRound,
          _collaborator: {
            _address: 'collaborator2',
          },
          _updatedAt: yesterday,
          _receiversJson: JSON.stringify([
            {
              address: 'address3',
              weight: 1000000,
              type: 'address',
              accountId: 'accountId3',
            },
          ]),
        } as unknown as Vote,
      ];

      // Act
      const result = votingRound.getLatestVotes();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].collaborator._address).toBe('collaborator1');
      expect(result[0].latestVote?._receiversJson).toBe(
        JSON.stringify([
          {
            address: 'address1',
            weight: 1000000,
            type: 'address',
            accountId: 'accountId1',
          },
        ]),
      );
      expect(result[1].collaborator._address).toBe('collaborator2');
      expect(result[1].latestVote?._receiversJson).toBe(
        JSON.stringify([
          {
            address: 'address3',
            weight: 1000000,
            type: 'address',
            accountId: 'accountId3',
          },
        ]),
      );
    });
  });

  describe('getResult', () => {
    it('should return the expected result', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._collaborators = [
        {
          _address: 'collaborator1',
        } as unknown as Collaborator,
        {
          _address: 'collaborator2',
        } as unknown as Collaborator,
      ];

      const [collaborator1, collaborator2] = votingRound._collaborators;

      const vote1 = new Vote();
      vote1.receivers = [
        {
          address: 'address1',
          weight: 500000,
          type: 'address',
          accountId: 'accountId1' as AccountId,
        },
        {
          address: 'address2',
          weight: 500000,
          type: 'address',
          accountId: 'accountId2' as AccountId,
        },
      ];
      vote1._votingRound = votingRound;
      vote1._collaborator = collaborator1;
      vote1._updatedAt = twoDaysAgo;

      const vote2 = new Vote();
      vote2.receivers = [
        {
          address: 'address3',
          weight: 1000000,
          type: 'address',
          accountId: 'accountId3' as AccountId,
        },
      ];
      vote2._votingRound = votingRound;
      vote2._collaborator = collaborator2;
      vote2._updatedAt = twoDaysAgo;

      votingRound._votes = [vote1, vote2];

      // Act
      const result = votingRound.getResult();

      // Assert
      expect(result).toEqual([
        {
          address: 'address1',
          weight: 250000,
          type: 'address',
          accountId: 'accountId1',
        },
        {
          address: 'address2',
          weight: 250000,
          type: 'address',
          accountId: 'accountId2',
        },
        {
          address: 'address3',
          weight: 500000,
          type: 'address',
          accountId: 'accountId3',
        },
      ]);
    });
  });

  describe('linkToNewDripList', () => {
    it('should call validateCanLink', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound['_validateCanLink'] = jest.fn();

      // Act
      votingRound.linkToNewDripList('dripListId' as DripListId);

      // Assert
      expect(votingRound['_validateCanLink']).toHaveBeenCalled();
    });

    it('should call createLink', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound['createLink'] = jest.fn();
      votingRound['_validateCanLink'] = jest.fn();

      // Act
      votingRound.linkToNewDripList('dripListId' as DripListId);

      // Assert
      expect(votingRound['createLink']).toHaveBeenCalledWith('dripListId');
    });
  });

  describe('linkToExistingDripList', () => {
    it('should throw if dripListId is not defined', () => {
      // Arrange
      const votingRound = new VotingRound();

      // Act
      const linkToExistingDripList = () => votingRound.linkToExistingDripList();

      // Assert
      expect(linkToExistingDripList).toThrow(
        'There is no Drip List to link to.',
      );
    });

    it('should call validateCanLink', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._dripListId = 'dripListId' as DripListId;
      votingRound['_validateCanLink'] = jest.fn();

      // Act
      votingRound.linkToExistingDripList();

      // Assert
      expect(votingRound['_validateCanLink']).toHaveBeenCalled();
    });

    it('should call createLink', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._dripListId = 'dripListId' as DripListId;
      votingRound['createLink'] = jest.fn();
      votingRound['_validateCanLink'] = jest.fn();

      // Act
      votingRound.linkToExistingDripList();

      // Assert
      expect(votingRound['createLink']).toHaveBeenCalledWith(
        votingRound._dripListId,
      );
    });
  });

  describe('_validateCanLink', () => {
    it('should throw when voting round is already linked', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._link = new Link();

      // Act
      const _validateCanLink = () => votingRound['_validateCanLink']();

      // Assert
      expect(_validateCanLink).toThrow(
        'Cannot link a voting round that is already linked.',
      );
    });

    it('should throw when voting round is not yet completed', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._endsAt = tomorrow;

      // Act
      const _validateCanLink = () => votingRound['_validateCanLink']();

      // Assert
      expect(_validateCanLink).toThrow(
        `Cannot link a voting round that is not completed. Status: ${votingRound.status}.`,
      );
    });

    it('should throw when voting round has no votes', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._endsAt = yesterday;

      // Act
      const _validateCanLink = () => votingRound['_validateCanLink']();

      // Assert
      expect(_validateCanLink).toThrow(
        'Cannot link a Drip List to a voting round with no votes.',
      );
    });
  });

  describe('nominate', () => {
    it('should throw when the Voting Round has no nomination period', () => {
      // Arrange
      const votingRound = new VotingRound();

      // Act
      const nominate = () => votingRound.nominate(new Nomination());

      // Assert
      expect(nominate).toThrow(
        'This voting round does not accept nominations.',
      );
    });

    it('should throw when nomination period is closed', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = yesterday;
      votingRound._nominationEndsAt = yesterday;

      // Act
      const nominate = () => votingRound.nominate(new Nomination());

      // Assert
      expect(nominate).toThrow('Nomination period is closed.');
    });

    it('should throw when a nomination with the same accountId already exists and it is not rejected', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = yesterday;
      votingRound._nominationEndsAt = tomorrow;

      const nomination = new Nomination();
      nomination._status = NominationStatus.Pending;
      nomination.receiver = {} as unknown as NominationReceiver;
      nomination.receiver.accountId = 'accountId' as any;

      votingRound._nominations = [nomination];

      // Act
      const nominate = () => votingRound.nominate(nomination);

      // Assert
      expect(nominate).toThrow('Receiver has already been nominated.');
    });

    it('should re-nominate a rejected nomination', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = yesterday;
      votingRound._nominationEndsAt = tomorrow;

      const nomination = new Nomination();
      nomination._status = NominationStatus.Rejected;
      nomination.receiver = {} as unknown as NominationReceiver;
      nomination.receiver.accountId = 'accountId' as any;

      votingRound._nominations = [nomination];

      // Act
      votingRound.nominate(nomination);

      // Assert
      expect(votingRound._nominations).toHaveLength(1);
    });

    it('should add a new nomination', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._nominationStartsAt = yesterday;
      votingRound._nominationEndsAt = tomorrow;

      const nomination = new Nomination();
      nomination._status = NominationStatus.Pending;
      nomination.receiver = {} as unknown as NominationReceiver;
      nomination.receiver.accountId = 'accountId' as any;

      // Act
      votingRound.nominate(nomination);

      // Assert
      expect(votingRound._nominations).toHaveLength(1);
    });
  });

  describe('setNominationsStatuses', () => {
    it('should throw when there are no nominations', () => {
      // Arrange
      const votingRound = new VotingRound();

      // Act
      const setNominationsStatuses = () =>
        votingRound.setNominationsStatuses([]);

      // Assert
      expect(setNominationsStatuses).toThrow(
        'There are no nominations to accept for this voting round.',
      );
    });

    it('should throw when voting period has started', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._startsAt = yesterday;
      votingRound._nominations = [new Nomination()];

      // Act
      const setNominationsStatuses = () =>
        votingRound.setNominationsStatuses([]);

      // Assert
      expect(setNominationsStatuses).toThrow(
        'Cannot accept nominations after the voting period has started.',
      );
    });

    it('should throw if receiver is not a nomination', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._startsAt = tomorrow;
      votingRound._nominations = [
        {
          receiver: {
            accountId: 'accountId1' as AccountId,
          } as unknown as NominationReceiver,
          _status: NominationStatus.Pending,
          _statusChangedAt: twoDaysAgo,
        } as unknown as Nomination,
      ];

      // Act
      const setNominationsStatuses = () =>
        votingRound.setNominationsStatuses([
          {
            accountId: 'accountId2' as AccountId,
            status: NominationStatus.Accepted,
          },
        ]);

      // Assert
      expect(setNominationsStatuses).toThrow(
        `Receiver with account ID accountId2 has not been nominated for this voting round.`,
      );
    });

    it('should set the status of the nominations', () => {
      // Arrange
      const votingRound = new VotingRound();
      votingRound._startsAt = tomorrow;
      votingRound._nominations = [
        {
          receiver: {
            accountId: 'accountId1' as AccountId,
          } as unknown as NominationReceiver,
          _status: NominationStatus.Pending,
          _statusChangedAt: twoDaysAgo,
        } as unknown as Nomination,
        {
          receiver: {
            accountId: 'accountId2' as AccountId,
          } as unknown as NominationReceiver,
          _status: NominationStatus.Accepted,
          _statusChangedAt: twoDaysAgo,
        } as unknown as Nomination,
        {
          receiver: {
            accountId: 'accountId3' as AccountId,
          } as unknown as NominationReceiver,
          _status: NominationStatus.Rejected,
          _statusChangedAt: twoDaysAgo,
        } as unknown as Nomination,
      ];

      // Act
      votingRound.setNominationsStatuses([
        {
          accountId: 'accountId1' as AccountId,
          status: NominationStatus.Accepted,
        },
        {
          accountId: 'accountId2' as AccountId,
          status: NominationStatus.Rejected,
        },
        {
          accountId: 'accountId3' as AccountId,
          status: NominationStatus.Accepted,
        },
      ]);

      // Assert
      expect(votingRound._nominations[0]._status).toBe(
        NominationStatus.Accepted,
      );
      expect(votingRound._nominations[0]._statusChangedAt).toBeDefined();
      expect(votingRound._nominations[0]._statusChangedAt).not.toBe(twoDaysAgo);
      expect(votingRound._nominations[1]._status).toBe(
        NominationStatus.Rejected,
      );
      expect(votingRound._nominations[1]._statusChangedAt).toBeDefined();
      expect(votingRound._nominations[1]._statusChangedAt).not.toBe(twoDaysAgo);
      expect(votingRound._nominations[2]._status).toBe(
        NominationStatus.Accepted,
      );
      expect(votingRound._nominations[2]._statusChangedAt).toBeDefined();
      expect(votingRound._nominations[2]._statusChangedAt).not.toBe(twoDaysAgo);
    });
  });
});
