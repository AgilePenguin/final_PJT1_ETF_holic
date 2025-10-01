import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { Construction } from '@mui/icons-material'

const VolumeTrendTab = ({ etfs = [], period = '1y' }) => {
  return (
    <Box sx={{ 
      backgroundColor: '#0f1430', 
      borderRadius: 2, 
      p: 4, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: 400,
      textAlign: 'center'
    }}>
      <Construction sx={{ fontSize: 64, color: '#5B8DEF', mb: 2 }} />
      
      <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
        거래량/거래대금 분석
      </Typography>
      
      <Chip 
        label="준비중" 
        sx={{ 
          backgroundColor: '#5B8DEF', 
          color: 'white', 
          fontWeight: 'bold',
          mb: 2
        }} 
      />
      
      <Typography variant="body1" sx={{ color: '#9aa4d4', mb: 1 }}>
        거래량 및 거래대금 추이 분석 기능이
      </Typography>
      <Typography variant="body1" sx={{ color: '#9aa4d4', mb: 3 }}>
        곧 출시될 예정입니다.
      </Typography>
      
      <Box sx={{ 
        backgroundColor: '#1a1f3a', 
        borderRadius: 1, 
        p: 2, 
        border: '1px solid #2a2f55',
        maxWidth: 400
      }}>
        <Typography variant="body2" sx={{ color: '#9aa4d4', mb: 1 }}>
          📊 예정 기능:
        </Typography>
        <Typography variant="body2" sx={{ color: '#9aa4d4', mb: 0.5 }}>
          • 일별/주별 거래량 추이 분석
        </Typography>
        <Typography variant="body2" sx={{ color: '#9aa4d4', mb: 0.5 }}>
          • 거래대금 비교 및 패턴 분석
        </Typography>
        <Typography variant="body2" sx={{ color: '#9aa4d4' }}>
          • 거래량 기반 투자 신호 제공
        </Typography>
      </Box>
    </Box>
  )
}

export default VolumeTrendTab
