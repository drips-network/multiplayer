import { body } from 'express-validator';

export const startVotingRoundRequestRequestValidators = [
  body('schedule').isObject(),
  body('schedule.voting').isObject(),
  body('schedule.voting.startsAt')
    .if((_, { req }) => req.body.schedule.startsAt)
    .isISO8601()
    .toDate(),
  body('schedule.voting.endsAt').isISO8601().toDate(),
  body('schedule.nomination.startsAt')
    .if((_, { req }) => req.body.schedule.nomination.startsAt)
    .isISO8601()
    .toDate(),
  body('schedule.nomination.endsAt')
    .if((_, { req }) => req.body.schedule.nomination.endsAt)
    .isISO8601()
    .toDate(),
  body('date').isISO8601().toDate(),
  body('areVotesPrivate').isBoolean(),
  body('signature').isString().not().isEmpty().escape(),
  body('dripListId')
    .if((value, { req }) => !req.body.name && !req.body.description)
    .isString()
    .isLength({ min: 36 })
    .escape(),
  body('dripListId')
    .if((value, { req }) => req.body.name || req.body.description)
    .custom((value) => !value)
    .withMessage(
      'dripListId must be empty when name or description are provided.',
    )
    .escape(),
  body('name')
    .if((value, { req }) => !req.body.dripListId)
    .isString()
    .isLength({ max: 50 })
    .escape(),
  body('description')
    .if((value, { req }) => req.body.description)
    .isString()
    .isLength({ max: 200 })
    .escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
  body('collaborators').isArray().isLength({ min: 1 }),
  body('collaborators.*').isString().isLength({ max: 42 }).escape(),
];
