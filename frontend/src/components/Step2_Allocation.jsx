import React, { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography, ToggleButtonGroup, ToggleButton, IconButton, Autocomplete, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { Add, Delete } from '@mui/icons-material'

const Step2_Allocation = ({ data, onChange, initialETFs = [] }) => {
  const set = (patch) => onChange({ ...data, ...patch })

  const addRow = () => set({ assets: [...data.assets, { market: 'domestic', ticker: '', name: '', value: '' }] })
  const removeRow = (idx) => set({ assets: data.assets.filter((_, i) => i !== idx) })
  const updateRow = (idx, patch) => {
    const next = data.assets.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    set({ assets: next })
  }

  // Autocomplete options and debounced input
  const [options, setOptions] = useState({})
  const [inputValues, setInputValues] = useState({})
  const [loading, setLoading] = useState({})

  // 각 행별로 옵션을 가져오는 함수
  const fetchOptionsForRow = async (rowIndex, market, inputValue) => {
    if (!inputValue) {
      setOptions(prev => ({ ...prev, [rowIndex]: [] }))
      return
    }

    setLoading(prev => ({ ...prev, [rowIndex]: true }))
    
    // Fallback ETF lists when backend is unavailable
    const fallbackKoreanEtfs = [
      { ticker: '069500', name: 'KODEX 200' },
      { ticker: '371460', name: 'TIGER 미국필라델피아반도체나스닥' },
      { ticker: '272580', name: 'KODEX 2차전지산업' },
      { ticker: '091160', name: 'KODEX 반도체' },
      { ticker: '091170', name: 'KODEX 은행' },
      { ticker: '091180', name: 'KODEX 자동차' },
      { ticker: '091190', name: 'KODEX 화학' },
      { ticker: '091200', name: 'KODEX 철강' },
      { ticker: '091210', name: 'KODEX 건설' },
      { ticker: '091220', name: 'KODEX 에너지화학' }
    ]
    
    const fallbackOverseasEtfs = [
      { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
      { ticker: 'IVV', name: 'iShares CORE S&P 500 ETF' },
      { ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
      { ticker: 'QQQ', name: 'Invesco QQQ Trust' },
      { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF' },
      { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF' },
      { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF' },
      { ticker: 'EFA', name: 'iShares MSCI EAFE ETF' },
      { ticker: 'EEM', name: 'iShares MSCI Emerging Markets ETF' },
      { ticker: 'IWM', name: 'iShares Russell 2000 ETF' }
    ]
    
    const fallbackEtfs = market === 'domestic' ? fallbackKoreanEtfs : fallbackOverseasEtfs
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/search?market=${market}&keyword=${encodeURIComponent(inputValue)}`)
      const data = await response.json()
      setOptions(prev => ({ ...prev, [rowIndex]: Array.isArray(data) ? data : [] }))
    } catch (error) {
      // Fallback to local search when backend is unavailable
      const filteredEtfs = fallbackEtfs.filter(etf => 
        etf.ticker.toLowerCase().includes(inputValue.toLowerCase()) ||
        etf.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      setOptions(prev => ({ ...prev, [rowIndex]: filteredEtfs }))
    } finally {
      setLoading(prev => ({ ...prev, [rowIndex]: false }))
    }
  }

  // initialETFs가 있을 때 자동으로 자산 추가
  useEffect(() => {
    if (initialETFs.length > 0 && data.assets.length === 0) {
      const initialAssets = initialETFs.map(etf => ({
        market: etf.market === '해외' ? 'overseas' : 'domestic',
        ticker: etf.ticker,
        name: etf.name,
        value: etf.percentage || (100 / initialETFs.length).toFixed(1)
      }))
      set({ assets: initialAssets })
    }
  }, [initialETFs, data.assets.length, set])

  // 각 행의 입력값 변경에 대한 debounced 처리
  const handleInputChange = (rowIndex, market, newInputValue) => {
    setInputValues(prev => ({ ...prev, [rowIndex]: newInputValue }))
    
    // 기존 타이머 클리어
    if (window.inputTimers && window.inputTimers[rowIndex]) {
      clearTimeout(window.inputTimers[rowIndex])
    }
    
    // 새 타이머 설정
    if (!window.inputTimers) window.inputTimers = {}
    window.inputTimers[rowIndex] = setTimeout(() => {
      fetchOptionsForRow(rowIndex, market, newInputValue)
    }, 300)
  }

  // compute summary and validity
  const total = data.assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0)
  const target = data.allocationMode === 'ratio' ? 100 : parseFloat(data.totalSeed || 0)
  
  // 중복 티커 검사
  const tickers = data.assets.map(a => a.ticker).filter(t => t)
  const hasDuplicateTickers = tickers.length !== new Set(tickers).size
  
  // 빈 티커 검사
  const hasEmptyTickers = data.assets.some(a => !a.ticker)
  
  const valid = data.allocationMode === 'ratio' 
    ? total === 100 && !hasDuplicateTickers && !hasEmptyTickers
    : total <= target && total > 0 && !hasDuplicateTickers && !hasEmptyTickers

  useEffect(() => {
    set({ __allocationValid: valid })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, data.allocationMode, data.totalSeed])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>배분 기준 선택</Typography>
        <ToggleButtonGroup
          exclusive
          value={data.allocationMode}
          onChange={(_, v) => v && set({ allocationMode: v })}
          size="small"
        >
          <ToggleButton value="ratio">비율 (%) 로 입력</ToggleButton>
          <ToggleButton value="amount">금액 (원) 으로 입력</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>자산 선택 및 비중 입력</Typography>
          <Button startIcon={<Add />} onClick={addRow} variant="outlined" size="small">
            자산 추가
          </Button>
        </Box>

        {data.assets.map((row, idx) => (
          <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 150px 40px', gap: 1, mb: 1.5, alignItems: 'center' }}>
            {/* 시장 구분 드롭다운 */}
            <FormControl size="small">
              <Select
                value={row.market || 'domestic'}
                onChange={(e) => {
                  updateRow(idx, { market: e.target.value, ticker: '', name: '' })
                  // 시장 변경 시 옵션 초기화
                  setOptions(prev => ({ ...prev, [idx]: [] }))
                  setInputValues(prev => ({ ...prev, [idx]: '' }))
                }}
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="domestic">국내</MenuItem>
                <MenuItem value="overseas">해외</MenuItem>
              </Select>
            </FormControl>
            
            {/* 티커 선택 드롭다운 */}
            <Autocomplete
              options={options[idx] || []}
              loading={loading[idx] || false}
              value={options[idx]?.find((o) => o.ticker === row.ticker) || (row.ticker ? { ticker: row.ticker, name: row.name } : null)}
              onChange={(_, option) => {
                if (option) {
                  updateRow(idx, { ticker: option.ticker, name: option.name })
                } else {
                  updateRow(idx, { ticker: '', name: '' })
                }
              }}
              onInputChange={(_, newInput) => {
                handleInputChange(idx, row.market || 'domestic', newInput)
              }}
              isOptionEqualToValue={(opt, val) => opt?.ticker === val?.ticker}
              getOptionLabel={(option) => (option?.ticker ? `${option.ticker} (${option.name})` : '')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="티커 선택"
                  error={hasEmptyTickers && !row.ticker}
                  helperText={hasEmptyTickers && !row.ticker ? "티커를 선택해주세요" : ""}
                />
              )}
            />
            
            {/* 구성 비율 입력 */}
            <TextField
              placeholder="구성 비율 (%)"
              type="number"
              value={row.value}
              onChange={(e) => updateRow(idx, { value: e.target.value })}
              size="small"
            />
            
            {/* 삭제 버튼 */}
            <IconButton onClick={() => removeRow(idx)} size="small">
              <Delete />
            </IconButton>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 1 }}>
        {data.allocationMode === 'ratio' ? (
          <Typography sx={{ fontWeight: 600, color: total > 100 ? 'error.main' : 'inherit' }}>
            총 합계: [ {total}% ] / 100%
          </Typography>
        ) : (
          <Typography sx={{ fontWeight: 600, color: total > target ? 'error.main' : 'inherit' }}>
            총 합계: [ {total.toLocaleString()}원 ] / [ {Number(target).toLocaleString()}원 ]
          </Typography>
        )}
        
        {/* 경고 메시지 */}
        {hasDuplicateTickers && (
          <Typography sx={{ color: 'error.main', fontSize: '0.875rem', mt: 0.5 }}>
            ⚠️ 같은 ETF를 중복으로 선택할 수 없습니다.
          </Typography>
        )}
        {hasEmptyTickers && (
          <Typography sx={{ color: 'error.main', fontSize: '0.875rem', mt: 0.5 }}>
            ⚠️ 모든 자산의 티커를 선택해주세요.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default Step2_Allocation
