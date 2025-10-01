import React from 'react'
import { Card, CardHeader, CardContent, CardActions, Typography, Box, Chip, Button, IconButton } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useComparison } from '../contexts/ComparisonContext.jsx'

const MAX_VISIBLE_ETFS = 3

const PortfolioCard = ({ portfolio }) => {
  const navigate = useNavigate()
  const { setTickersToCompare } = useComparison()

  const visibleEtfs = portfolio.etfs.slice(0, MAX_VISIBLE_ETFS)
  const hiddenCount = Math.max(0, portfolio.etfs.length - visibleEtfs.length)

  const handleCompareClick = () => {
    const tickers = (portfolio.etfs || []).map((e) => e.ticker)
    setTickersToCompare(tickers)
    navigate('/etf-compare')
  }

  return (
    <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            {portfolio.title}
          </Typography>
        }
        action={
          <Box>
            <IconButton size="small" aria-label="edit" sx={{ color: '#9aa4d4' }}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="delete" sx={{ color: '#9aa4d4' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography sx={{ color: '#9aa4d4', mb: 1 }}>{portfolio.description}</Typography>
        <Typography variant="body2" sx={{ color: '#9aa4d4', mb: 1 }}>ETF {portfolio.etfs.length}개</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {visibleEtfs.map((etf) => (
            <Chip key={etf.ticker} size="small" label={etf.name} sx={{ backgroundColor: '#0a0e27', color: 'white' }} />
          ))}
          {hiddenCount > 0 && (
            <Typography variant="caption" sx={{ color: '#9aa4d4', alignSelf: 'center' }}>+ {hiddenCount}개 더</Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button fullWidth variant="contained" onClick={handleCompareClick}>전체 비교하기</Button>
      </CardActions>
    </Card>
  )
}

export default PortfolioCard
