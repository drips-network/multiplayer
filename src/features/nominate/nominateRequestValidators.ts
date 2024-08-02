import type { CustomValidator } from 'express-validator';
import { body, param } from 'express-validator';

const isType =
  (type: string): CustomValidator =>
  (value, { req }) =>
    req.body.nomination.type === type;

export const nominateRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('nomination.type').isIn(['address', 'project', 'dripList']).escape(),
  body('nomination.address')
    .if(isType('address'))
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
  body('nomination.url')
    .if(isType('project'))
    .isURL({ protocols: ['https'] }),
  body('nomination.accountId')
    .if(isType('dripList'))
    .isString()
    .isLength({ min: 36, max: 36 })
    .escape(),
  body('date').isISO8601().toDate(),
  body('signature').isString().not().isEmpty().escape(),
  body('nominatedBy').isString().isLength({ min: 42, max: 42 }).escape(),
  body('description').isString().isLength({ max: 200 }).escape(),
  body('impactMetrics').isArray().isLength({ min: 1 }),
  body('impactMetrics.*.key').isString().escape(),
  body('impactMetrics.*.value').isNumeric().escape(),
  body('impactMetrics.*.link').isURL({ protocols: ['https'] }),
];
