/* eslint-disable-next-line no-unused-vars */
import TestPage from 'pages/TestPage/TestPage'
import React from 'react'
//* Router
/* eslint-disable-next-line no-unused-vars */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' 

import * as LOGGER from './utilities/logger'

const AppWrapper = () => {

  return(
    <>
      <Routes>
        <Route path="/" element={<TestPage/>} />
      </Routes>
    </>
  )
}

const RouterWrapper = () => 
  <Router>
    <AppWrapper />
  </Router>

const App = () => 
  <RouterWrapper/>

export default App