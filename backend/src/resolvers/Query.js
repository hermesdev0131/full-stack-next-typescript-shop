const { forwardTo } = require('prisma-binding')
const { hasPermission } = require('../utils')

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    )
  },
  async users(parent, args, ctx, info) {
    // 1. check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    // 2. Check if the user has the the permissions to query add the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    // 2.if they do, queryadd the users!
    return ctx.db.query.users({}, info)
  },
}

module.exports = Query
