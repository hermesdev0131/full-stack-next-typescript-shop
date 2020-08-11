const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('./../mail')
const { hasPermission } = require('../utils')
const stripe = require('../stripe')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!')
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
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
        id: args.id,
      },
      info,
    })

    return item
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`)
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    )

    if (!ownsItem || !hasPermissions) {
      throw new Error('You dont have permission')
    }

    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    )

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 24 * 365, // 1 year cookie
    })

    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password!')
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 24 * 365,
    })

    return user
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } })

    if (!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }

    const randomBytesPromiseified = promisify(randomBytes)
    const resetToken = (await randomBytesPromiseified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    })

    const mailRes = await transport.sendMail({
      from: 'wes@wesbos.com',
      to: user.email,
      subject: `Your Password Rreset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>
      `,
    })

    return { message: 'Thanks!' }
  },

  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Yo Passwords don't match!")
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() <= 3600000,
      },
    })
    if (!user) {
      throw new Error('This token is either invalid or expired!')
    }

    const password = await bcrypt.hash(args.password, 10)
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })

    return updatedUser
  },

  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }

    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    )

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        here: {
          id: args.userId,
        },
      },
      info
    )
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    })

    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      )
    }

    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    )
  },

  async removeFromCart(parent, args, ctx, info) {
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{ id, user { id }}`
    )

    if (!cartItem) throw new Error('No CartItem Found!')

    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheatin huhhhh')
    }

    return ctx.db.mutation.deleteCartItem({
      where: {
        id: args.id,
      },
      info,
    })
  },

  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request
    if (!userId)
      throw new Error('You must be signed in to complete this order.')
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `
    {
    id
    name
    email
    cart {
      id
      quantity
      item { title price id description image largeImage }
      }}
    `
    )
    // 2. recalculate the total for the price
    const amount = user.cart.reduce((tally, cartItem) => {
      // when original item deleted, remove from cartItem.item
      if (!cartItem.item) return
      return tally + cartItem.item.price * cartItem.quantity
    }, 0)
    //console.log(`Going to charge for a totao of ${amount}`)

    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    })

    // 4. Convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      }
      delete orderItem.id
      return orderItem
    })

    // 5. create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    })

    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id)
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    })

    // 7. Return the Order to the client
    return order
  },
}

module.exports = Mutations
