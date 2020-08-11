import React from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import NProgress from 'nprogress'
import gql from 'graphql-tag'
import Error from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'
import calcTotalPrice from '../lib/calcTotalPrice'

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
}

class TakeMyMoney extends React.Component {
  onToken = res => {
    console.log('On Token Called!')
    console.log(res.id)
  }

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${totalItems(me.cart)} items!`}
            token={res => this.onToken(res)}
            stripeKey="pk_test_51HEr8KIdnvxtqnlp2GfIG5y6vPUr1Fj13MxVdPQa6vAGOeaktqAiAroig5TSNBTrIXJg4CSPgjuZNiMhCtr5ZsAS00VFjV10HJ"
            currency="USD"
            email={me.email}
          >
            <p>{this.props.children}</p>
          </StripeCheckout>
        )}
      </User>
    )
  }
}

export default TakeMyMoney
