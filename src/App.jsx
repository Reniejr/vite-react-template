/* eslint-disable-next-line no-unused-vars */
import React from 'react'
//* Router
/* eslint-disable-next-line no-unused-vars */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' 

const AppWrapper = () => {
  return(
    <>
      <Routes>
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