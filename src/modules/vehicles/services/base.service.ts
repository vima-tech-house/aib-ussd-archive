import { Model, ModelStatic, Op } from 'sequelize';
import { BaseQueryParamsDto } from '../dto/query.dto';
import { QueryResult } from 'interfaces/vehicle-response.interface';

export class BaseService<T extends Model> {
  constructor(protected model: ModelStatic<T>) {}

  protected async findAllPaginated(
    queryParams: BaseQueryParamsDto,
    searchFields: string[],
  ): Promise<QueryResult<T>> {
    const {
      page = 1,
      perPage = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      isActive,
    } = queryParams;

    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.iLike]: `%${search}%` },
      }));
    }

    if (typeof isActive === 'boolean') {
      whereClause.isActive = isActive;
    }

    const { rows: data, count } = await this.model.findAndCountAll({
      where: whereClause,
      order: [[sort, order]],
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    return {
      data,
      count,
      page,
      perPage,
    };
  }
}
