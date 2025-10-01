import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import StrategyAnalysisPage from './components/StrategyAnalysisPage'
import MyIndexPage from './components/MyIndexPage'
import MyPortfoliosPage from './components/MyPortfoliosPage'
import EtfComparePage from './components/EtfComparePage'
import CustomerSupportPage from './pages/CustomerSupportPage'
import SettingsPage from './pages/SettingsPage'
import AccountManagementPage from './pages/AccountManagementPage'
import { ComparisonProvider } from './contexts/ComparisonContext.jsx'

// 다크 테마 설정
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#0a0e27',
      paper: '#1a1f3a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ComparisonProvider>
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/strategy" element={<StrategyAnalysisPage />} />
              <Route path="/my-index" element={<MyIndexPage />} />
              <Route path="/my-portfolios" element={<MyPortfoliosPage />} />
              <Route path="/etf-compare" element={<EtfComparePage />} />
              <Route path="/customer-support" element={<CustomerSupportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/account-management" element={<AccountManagementPage />} />
            </Routes>
          </Box>
        </Box>
      </ComparisonProvider>
    </ThemeProvider>
  )
}

export default App

