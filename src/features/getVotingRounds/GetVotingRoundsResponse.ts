export type GetVotingRoundsResponse = {
  votingRounds:
    | {
        id: string;
        status: string;
      }[]
    | undefined;
};