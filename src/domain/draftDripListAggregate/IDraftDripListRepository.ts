import type { UUID } from 'crypto';
import type DraftDripList from './DraftDripList';

export default interface IDraftDripListRepository {
  getById(draftDripListId: UUID): Promise<DraftDripList | null>;
  softRemove(draftDripList: DraftDripList): Promise<void>;
  save(draftDripList: DraftDripList): Promise<void>;
}
