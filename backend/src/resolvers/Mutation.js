const Mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    )

    return item
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id
    const item = ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      },
      info
    })

    return item
  }
}

module.exports = Mutations
