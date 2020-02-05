import React from 'react'
import Signin from '../components/Signin'
import Signup from '../components/Signup'
import RequestReset from '../components/RequestReset'
import styled from 'styled-components'

const Colmuns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`

const SignupPage = () => (
  <Colmuns>
    <Signup />
    <Signin />
    <RequestReset />
  </Colmuns>
)

export default SignupPage
