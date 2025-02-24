import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from 'interfaces/response.interface';
import { handleErrors } from 'utils/error.handler';
import { createPagination } from 'utils/pagination.handler';
import { Op } from 'sequelize';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';
import { EnrichedAction } from 'interfaces/action-response.interface';
import { Feature } from '@database/models/feature.model';
import { Action } from '@database/models/action.model';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature)
    private readonly featureTypeModel: typeof Feature,
    @InjectModel(Action)
    private readonly actionModel: typeof Action,
  ) {}

  async findByPath(path: string): Promise<Feature | null> {
    return this.featureTypeModel.findOne({
      where: { path },
    });
  }

  async findAll(queryParams: BaseQueryParamsDto): Promise<Response<Feature[]>> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        sort,
        order = 'asc',
        isActive,
      } = queryParams;
      const where: any = {};

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      if (typeof isActive !== 'undefined') {
        where.isActive = isActive;
      }
      const offset = (page - 1) * perPage;
      const { count, rows } = await this.featureTypeModel.findAndCountAll({
        where,
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
        include: [
          {
            model: Action,
            through: { attributes: [] },
          },
        ],
        distinct: true,
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Features retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }

  async findAllActionsOnFeature(
    featureId: string,
  ): Promise<Response<EnrichedAction[]>> {
    try {
      const feature = await this.featureTypeModel.findByPk(featureId, {
        include: [
          {
            model: Action,
            through: { attributes: [] },
          },
        ],
      });

      if (!feature) {
        return {
          status: 'error',
          pagination: null,
          message: 'Feature not found',
          response: null,
          errors: null,
        };
      }

      const allActions = await this.actionModel.findAll();

      const linkedActionIds = feature.actions.map((action) => action.id);
      const actionsWithStatus = allActions.map((action) => ({
        ...action.toJSON(),
        isSet: linkedActionIds.includes(action.id),
      }));

      return {
        status: 'success',
        message: 'Actions on a feature retrieved successfully',
        pagination: null,
        response: actionsWithStatus,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAllActionsOnFeature');
    }
  }

  async findAllActions(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<Action[]>> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        sort,
        order = 'asc',
        isActive,
      } = queryParams;
      const where: any = {};

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      if (typeof isActive !== 'undefined') {
        where.isActive = isActive;
      }
      const offset = (page - 1) * perPage;
      const { count, rows } = await this.actionModel.findAndCountAll({
        where,
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Actions retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }

  async removeAddActions(
    featureId: string,
    addActionIds: string[],
    removeActionIds: string[],
  ): Promise<Response<string>> {
    try {
      const feature = await this.featureTypeModel.findByPk(featureId, {
        include: [Action],
      });

      if (!feature) {
        return {
          status: 'error',
          message: 'Feature not found',
          pagination: null,
          response: null,
          errors: null,
        };
      }

      const allActions = await this.actionModel.findAll();
      const allActionIds = allActions.map((action) => action.id);

      // Validate add and remove action IDs
      const invalidAddIds = addActionIds.filter(
        (id) => !allActionIds.includes(id),
      );
      const invalidRemoveIds = removeActionIds.filter(
        (id) => !allActionIds.includes(id),
      );
      if (invalidAddIds.length > 0 || invalidRemoveIds.length > 0) {
        return {
          status: 'error',
          message: 'Some actions are not found',
          pagination: null,
          response: null,
          errors: {
            invalidAddIds,
            invalidRemoveIds,
          },
        };
      }

      const currentActionIds = feature.actions.map((action) => action.id);
      const actionsToAdd = addActionIds.filter(
        (id) => !currentActionIds.includes(id),
      );

      const actionsToRemove = removeActionIds.filter((id) =>
        currentActionIds.includes(id),
      );

      if (actionsToAdd.length > 0) {
        await feature.$add('actions', actionsToAdd);
      }
      if (actionsToRemove.length > 0) {
        await feature.$remove('actions', actionsToRemove);
      }

      return {
        status: 'success',
        message: 'Feature updated successfully',
        pagination: null,
        response: null,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'removeAddActions');
    }
  }
}
