import PleaseSignIn from '../components/PleaseSignin'
import OrderList from '../components/OrderList'

const OrderPage = props => {
  return (
    <div>
      <PleaseSignIn>
        <OrderList />
      </PleaseSignIn>
    </div>
  )
}

export default OrderPage
