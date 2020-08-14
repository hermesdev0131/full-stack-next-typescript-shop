import React from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import NProgress from 'nprogress'
import gql from 'graphql-tag'
import Error from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'
import calcTotalPrice from '../lib/calcTotalPrice'

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
}

class TakeMyMoney extends React.Component {
  onToken = async (res, createOrder) => {
    NProgress.start()
    // manually call the mutation once we have the stripe token
    const order = await createOrder({
      variables: {
        token: res.id,
      },
    }).catch(err => {
      alert(err.message)
    })
    Router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id },
    })
  }

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {createOrder => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="Sick Fits"
                description={`Order of ${totalItems(me.cart)} items!`}
                image={
                  me.cart.length &&
                  me.cart[0].item &&
                  me.cart[0].item &&
                  me.cart[0].item.image
                }
                token={res => this.onToken(res, createOrder)}
                stripeKey="pk_test_51HEr8KIdnvxtqnlp2GfIG5y6vPUr1Fj13MxVdPQa6vAGOeaktqAiAroig5TSNBTrIXJg4CSPgjuZNiMhCtr5ZsAS00VFjV10HJ"
                currency="USD"
                email={me.email}
              >
                <p>{this.props.children}</p>
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    )
  }
}

export default TakeMyMoney
