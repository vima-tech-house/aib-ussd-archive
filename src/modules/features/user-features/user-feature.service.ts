import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from 'interfaces/response.interface';
import { handleErrors } from 'utils/error.handler';
import { createPagination } from 'utils/pagination.handler';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto'; // Assuming this exists
import { Op } from 'sequelize';
import { User } from '@database/models/user.model';
import { UserFeatureAction } from '@database/models/user-feature-action.model';
import { Action } from '@database/models/action.model';
import { Feature } from '@database/models/feature.model';

@Injectable()
export class UserFeatureService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(UserFeatureAction)
    private readonly userFeatureActionModel: typeof UserFeatureAction,
    @InjectModel(Action)
    private readonly actionModel: typeof Action,
    @InjectModel(Feature)
    private readonly featureModel: typeof Feature,
  ) {}
  async getAllUsersWithFeaturesAndActions(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<any>> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        sort,
        order = 'asc',
      } = queryParams;

      const where: any = {};

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      const offset = (page - 1) * perPage;

      const { count, rows } = await this.userModel.findAndCountAll({
        where,
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Feature,
            through: { attributes: [] },
          },
        ],
        distinct: true,
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Users retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'getAllUsersWithFeaturesAndActions');
    }
  }

  async findAllFeaturesAndActionsOfUser(
    userId: string,
  ): Promise<Response<any>> {
    try {
      const user = await this.userModel.findByPk(userId, {
        include: [
          {
            model: Feature,
            include: [
              {
                model: Action,
                through: { attributes: [] },
              },
            ],
            through: { attributes: [] },
          },
        ],
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return {
          status: 'error',
          pagination: null,
          message: 'User not found',
          response: null,
          errors: null,
        };
      }

      const userFeatureActions = await this.userFeatureActionModel.findAll({
        where: { user_id: userId },
      });

      const userFeatureActionSet = new Set(
        userFeatureActions.map((ufa) => `${ufa.feature_id}-${ufa.action_id}`),
      );

      const featuresWithActions = user.features.map((feature) => {
        const actionsWithStatus = feature.actions.map((action) => ({
          ...action.toJSON(),
          isSet: userFeatureActionSet.has(`${feature.id}-${action.id}`),
        }));

        return {
          ...feature.toJSON(),
          actions: actionsWithStatus,
        };
      });

      const userJson = {
        ...user.toJSON(),
        features: featuresWithActions,
      };

      return {
        status: 'success',
        message: 'Features and actions for the user retrieved successfully',
        pagination: null,
        response: userJson,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAllFeaturesAndActionsOfUser');
    }
  }

  async removeAddActionsForUser(
    userId: string,
    featuredActions: {
      featuredId: string;
      addActionIds: string[];
      removeActionIds: string[];
    }[],
  ): Promise<Response<string>> {
    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return {
          status: 'error',
          message: 'User not found',
          pagination: null,
          response: null,
          errors: null,
        };
      }

      // Fetch all valid actions and features once to avoid multiple queries
      const allActions = await this.actionModel.findAll({ attributes: ['id'] });
      const allFeatures = await this.featureModel.findAll({
        attributes: ['id'],
      });

      const allActionIds = new Set(allActions.map((action) => action.id));
      const allFeatureIds = new Set(allFeatures.map((feature) => feature.id));

      const invalidFeatureIds: string[] = [];
      const invalidActions: {
        addActionIds: string[];
        removeActionIds: string[];
      } = {
        addActionIds: [],
        removeActionIds: [],
      };

      // Validate feature and action IDs
      for (const {
        featuredId,
        addActionIds,
        removeActionIds,
      } of featuredActions) {
        if (!allFeatureIds.has(featuredId)) {
          invalidFeatureIds.push(featuredId);
        }
        invalidActions.addActionIds.push(
          ...addActionIds.filter((id) => !allActionIds.has(id)),
        );
        invalidActions.removeActionIds.push(
          ...removeActionIds.filter((id) => !allActionIds.has(id)),
        );
      }

      // Return an error if any invalid IDs are found
      if (
        invalidFeatureIds.length ||
        invalidActions.addActionIds.length ||
        invalidActions.removeActionIds.length
      ) {
        return {
          status: 'error',
          message: 'Some featureIds or actionIds do not exist',
          pagination: null,
          response: null,
          errors: { invalidFeatureIds, ...invalidActions },
        };
      }

      for (const {
        featuredId,
        addActionIds,
        removeActionIds,
      } of featuredActions) {
        // Fetch only the user's assigned actions for this feature
        const userFeatureActions = await this.userFeatureActionModel.findAll({
          where: { user_id: userId, feature_id: featuredId },
          attributes: ['action_id'],
        });

        const currentActionIds = new Set(
          userFeatureActions.map((ufa) => ufa.action_id),
        );

        // Determine actions to add (excluding those already assigned)
        const actionsToAdd = addActionIds.filter(
          (id) => !currentActionIds.has(id),
        );

        // Determine actions to remove (excluding those not currently assigned)
        const actionsToRemove = removeActionIds.filter((id) =>
          currentActionIds.has(id),
        );

        // Prevent removing actions that are being added in the same request
        const finalRemoveActions = actionsToRemove.filter(
          (id) => !actionsToAdd.includes(id),
        );

        // Perform additions
        if (actionsToAdd.length > 0) {
          const entriesToAdd = actionsToAdd.map((actionId) => ({
            user_id: userId,
            feature_id: featuredId,
            action_id: actionId,
          }));
          await this.userFeatureActionModel.bulkCreate(entriesToAdd as any);
        }

        // Perform removals
        if (finalRemoveActions.length > 0) {
          await this.userFeatureActionModel.destroy({
            where: {
              user_id: userId,
              feature_id: featuredId,
              action_id: { [Op.in]: finalRemoveActions },
            },
          });
        }
      }

      return {
        status: 'success',
        message: 'User actions updated successfully',
        pagination: null,
        response: null,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'removeAddActionsForUser');
    }
  }

  async findUserActionsForFeature(
    userId: string,
    featureId: string,
  ): Promise<string[]> {
    const userActions = await this.userFeatureActionModel.findAll({
      where: { user_id: userId, feature_id: featureId },
      include: [
        {
          model: this.actionModel,
          attributes: ['name'],
        },
      ],
    });
    return userActions.map((userAction) => userAction.action.name);
  }
}
