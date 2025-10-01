import React, { useMemo, useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material'
import Step1_InvestmentPlan from './Step1_InvestmentPlan'
import Step2_Allocation from './Step2_Allocation'

const initialData = {
  name: '',
  method: 'lumpSum',
  totalSeed: '',
  dcaAmount: '',
  dcaIntervalDays: '',
  dcaYears: '',
  allocationMode: 'ratio',
  assets: [], // { ticker:'QQQ', value: 20 }
}

const AddPortfolioModal = ({ open, onClose, onSave, initialETFs = [] }) => {
  const [step, setStep] = useState(1)
  const [portfolioData, setPortfolioData] = useState(initialData)

  // initialETFs가 변경될 때 포트폴리오 데이터 초기화
  useEffect(() => {
    if (initialETFs.length > 0) {
      const initialAssets = initialETFs.map(etf => ({
        market: etf.market === '해외' ? 'overseas' : 'domestic',
        ticker: etf.ticker,
        name: etf.name,
        value: etf.percentage || (100 / initialETFs.length).toFixed(1)
      }))
      
      setPortfolioData({
        ...initialData,
        assets: initialAssets
      })
    } else {
      setPortfolioData(initialData)
    }
  }, [initialETFs])

  const handleClose = () => {
    setStep(1)
    setPortfolioData(initialData)
    onClose?.()
  }

  const canProceedStep1 = useMemo(() => {
    if (!portfolioData.name) return false
    if (portfolioData.method === 'lumpSum') return !!portfolioData.totalSeed
    return !!(portfolioData.dcaAmount && portfolioData.dcaIntervalDays && portfolioData.dcaYears)
  }, [portfolioData])

  const title = step === 1 ? '새 포트폴리오 만들기 (1/2단계: 투자 계획)' : '새 포트폴리오 만들기 (2/2단계: 자산 구성)'

  const handleSave = () => {
    onSave?.(portfolioData)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {step === 1 ? (
            <Step1_InvestmentPlan data={portfolioData} onChange={setPortfolioData} />
          ) : (
            <Step2_Allocation data={portfolioData} onChange={setPortfolioData} initialETFs={initialETFs} />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        {step === 2 && (
          <Button onClick={() => setStep(1)}>뒤로</Button>
        )}
        {step === 1 ? (
          <Button variant="contained" disabled={!canProceedStep1} onClick={() => setStep(2)}>
            다음
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={!portfolioData.__allocationValid}
            onClick={handleSave}
          >
            저장하기
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AddPortfolioModal
