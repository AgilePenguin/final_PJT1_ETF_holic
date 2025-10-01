import React, { useState } from 'react'
import { Box, Typography, Grid, Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import PortfolioCard from './PortfolioCard'
import AddPortfolioModal from './AddPortfolioModal'

const mockPortfolioList = [
  {
    id: 'p1',
    title: '반도체 매니아',
    description: '반도체만 집중 투자하는 포트폴리오',
    etfs: [
      { name: 'KODEX 반도체', ticker: 'KODEX반도체' },
      { name: 'TIGER 필라델피아반도체', ticker: 'TIGER필라델피아반도체' },
    ],
  },
  {
    id: 'p2',
    title: '대형 지수 추종',
    description: '미국과 한국의 대표 지수를 추종',
    etfs: [
      { name: 'KODEX 코스피200', ticker: 'KODEX200' },
      { name: 'TIGER 미국나스닥100', ticker: 'TIGER나스닥100' },
    ],
  },
  {
    id: 'p3',
    title: '2024년 9월 투자',
    description: '성장주 위주의 투자 이력',
    etfs: [
      { name: 'KODEX 코스피200', ticker: 'KODEX200' },
      { name: 'TIGER 미국나스닥100', ticker: 'TIGER나스닥100' },
      { name: 'KODEX 반도체', ticker: 'KODEX반도체' },
      { name: 'TIGER 2차전지테마', ticker: 'TIGER2차전지테마' },
    ],
  },
]

const MyPortfoliosPage = () => {
  const [open, setOpen] = useState(false)
  const [portfolioList, setPortfolioList] = useState(mockPortfolioList)

  const handleAddPortfolio = (newPortfolioData) => {
    const newItem = {
      id: `p${portfolioList.length + 1}`,
      title: newPortfolioData.name || '새 포트폴리오',
      description:
        newPortfolioData.method === 'dca' ? '적립식 포트폴리오' : '거치식 포트폴리오',
      etfs: (newPortfolioData.assets || [])
        .filter((a) => a.ticker)
        .map((a) => ({ ticker: a.ticker, name: a.name || a.ticker })),
    }
    setPortfolioList([...portfolioList, newItem])
    setOpen(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            나만의 포트폴리오
          </Typography>
          <Typography sx={{ color: '#9aa4d4' }}>
            ETF Holic으로 나만의 ETF 컬렉션을 만들고 관리하세요
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          새 포트폴리오 만들기
        </Button>
      </Box>

      <Grid container spacing={3}>
        {portfolioList.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <PortfolioCard portfolio={p} />
          </Grid>
        ))}
      </Grid>

      <AddPortfolioModal open={open} onClose={() => setOpen(false)} onSave={handleAddPortfolio} />
    </Box>
  )
}

export default MyPortfoliosPage
