import Link from 'next/link'
import NavStyles from './styles/NavStyles'

const Nav = () => (
  <NavStyles>
    <Link href="/items">Items</Link>
    <Link href="/sell">Sell</Link>
    <Link href="/signup">Signup</Link>
    <Link href="/orders">Orders</Link>
    <Link href="/me">Account</Link>
  </NavStyles>
)

export default Nav
