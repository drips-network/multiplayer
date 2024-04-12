import { body, param } from 'express-validator';

export const nominateRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('nomination.type').isIn(['address', 'project', 'dripList']).escape(),
  body('nomination.accountId').isString().isLength({ min: 36 }).escape(),
  body('date').isISO8601(),
  body('signature').isString().not().isEmpty().escape(),
  body('nominatedBy').isString().isLength({ min: 42, max: 42 }).escape(),
  body('description').isString().isLength({ max: 200 }).escape(),
  body('impactMetrics').isObject(),
  body('impactMetrics.key').isString().escape(),
  body('impactMetrics.value').isNumeric().escape(),
  body('impactMetrics.link')
    .isURL({ protocols: ['https'] })
    .escape(),
];
