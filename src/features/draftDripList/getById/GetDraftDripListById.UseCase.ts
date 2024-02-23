import type { Repository } from 'typeorm';
import type UseCase from '../../../application/interfaces/IUseCase';
import type { DraftDripList } from '../../../domain/DraftDripList';
import NotFoundError from '../../../application/ NotFoundError';
import type { GetDraftDripListByIdResponse } from './GetDraftDripListById.Response';
import type { GetDraftDripListByIdRequest } from './GetDraftDripListById.Request';

export default class GetDraftDripListByIdUseCase
  implements UseCase<GetDraftDripListByIdRequest, GetDraftDripListByIdResponse>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute(
    request: GetDraftDripListByIdRequest,
  ): Promise<GetDraftDripListByIdResponse> {
    const draftDripList = await this._repository.findOne({
      where: { id: request.id },
    });

    if (!draftDripList) {
      throw new NotFoundError(`DraftDripList with id ${request.id} not found.`);
    }

    return {
      id: draftDripList.id,
      name: draftDripList.name,
      description: draftDripList.description,
      collaborators: draftDripList.collaborators || [],
    };
  }
}
