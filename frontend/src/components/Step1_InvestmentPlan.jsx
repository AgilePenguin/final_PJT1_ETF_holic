import React from 'react'
import { Box, TextField, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material'

const Step1_InvestmentPlan = ({ data, onChange }) => {
  const set = (patch) => onChange({ ...data, ...patch })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="포트폴리오 이름"
        value={data.name}
        onChange={(e) => set({ name: e.target.value })}
      />

      <Box>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>투자 방식</Typography>
        <RadioGroup row value={data.method} onChange={(e) => set({ method: e.target.value })}>
          <FormControlLabel value="lumpSum" control={<Radio />} label="거치식 (Lump Sum)" />
          <FormControlLabel value="dca" control={<Radio />} label="적립식 (DCA)" />
        </RadioGroup>
      </Box>

      {data.method === 'lumpSum' ? (
        <TextField
          fullWidth
          label="총 투자금액"
          type="number"
          value={data.totalSeed}
          onChange={(e) => set({ totalSeed: e.target.value })}
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <TextField
            label="적립 금액 (원씩)"
            type="number"
            value={data.dcaAmount}
            onChange={(e) => set({ dcaAmount: e.target.value })}
          />
          <TextField
            label="적립 주기 (일마다)"
            type="number"
            value={data.dcaIntervalDays}
            onChange={(e) => set({ dcaIntervalDays: e.target.value })}
          />
          <TextField
            label="적립 기간 (년 동안)"
            type="number"
            value={data.dcaYears}
            onChange={(e) => set({ dcaYears: e.target.value })}
          />
        </Box>
      )}
    </Box>
  )
}

export default Step1_InvestmentPlan
