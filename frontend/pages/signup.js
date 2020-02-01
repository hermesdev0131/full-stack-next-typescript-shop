import React from 'react'
import Signin from '../components/Signin'
import Signup from '../components/Signup'
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
  </Colmuns>
)

export default SignupPage
