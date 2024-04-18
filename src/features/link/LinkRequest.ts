export type LinkRequest =
  | {
      dripListId: string | undefined;
    }
  | {
      dripListId: string;
      safeTransactionHash: string;
    };
