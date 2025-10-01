import React, { createContext, useContext, useState } from 'react'

const ComparisonContext = createContext()

export const useComparison = () => useContext(ComparisonContext)

export const ComparisonProvider = ({ children }) => {
  const [tickersToCompare, setTickersToCompare] = useState([])

  const value = { tickersToCompare, setTickersToCompare }

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>
}

export default ComparisonContext
