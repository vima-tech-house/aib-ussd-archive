import { QueryInterface, QueryTypes } from 'sequelize';

interface UserFeatureAction {
  user_id: string;
  feature_id: string;
  action_id: string;
  created_at: Date;
  updated_at: Date;
}

interface SuperAdmin {
  user_id: string;
}

interface FeatureAction {
  feature_id: string;
  action_id: string;
}

export default {
  async up(queryInterface: QueryInterface) {
    const superAdmins: SuperAdmin[] = await queryInterface.sequelize.query(
      'SELECT user_id FROM users WHERE role = :role',
      {
        replacements: { role: 'super_admin' },
        type: QueryTypes.SELECT,
      }
    );

    const featureActions: FeatureAction[] = await queryInterface.sequelize.query(
      'SELECT feature_id, action_id FROM feature_actions',
      { type: QueryTypes.SELECT }
    );

    const userFeatureActionData: UserFeatureAction[] = [];

    superAdmins.forEach((superAdmin) => {
      featureActions.forEach((featureAction) => {
        userFeatureActionData.push({
          user_id: superAdmin.user_id,
          feature_id: featureAction.feature_id,
          action_id: featureAction.action_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    });

    await queryInterface.bulkInsert('user_feature_actions', userFeatureActionData);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('user_feature_actions', {});
  },
};
