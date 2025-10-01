import React from 'react'
import { Box, Card, CardContent, Typography, Chip } from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts'

const StrategyResultCard = ({ strategyName, description, signal, confidence, direction = 'up', chartData, overlays = {} }) => {
  const IconComp = direction === 'up' ? ArrowUpward : ArrowDownward
  return (
    <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
          {strategyName}
        </Typography>
        <Typography sx={{ color: '#9aa4d4', mb: 2 }}>{description}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: direction === 'up' ? '#22C55E' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconComp sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography sx={{ color: 'white', fontWeight: 700 }}>{signal}</Typography>
          <Chip label={`신뢰도 ${confidence}`} size="small" sx={{ ml: 1 }} />
        </Box>

        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            {overlays.type === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid stroke="#2a2f55" strokeDasharray="3 3" />
                <XAxis dataKey="x" stroke="#9aa4d4" tickLine={false} axisLine={{ stroke: '#2a2f55' }} />
                <YAxis stroke="#9aa4d4" tickLine={false} axisLine={{ stroke: '#2a2f55' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #2a2f55', color: 'white' }} />
                <Area type="monotone" dataKey="price" stroke="#5B8DEF" fill="rgba(91,141,239,0.2)" strokeWidth={2} />
                {overlays.upper && <LineChart />}
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid stroke="#2a2f55" strokeDasharray="3 3" />
                <XAxis dataKey="x" stroke="#9aa4d4" tickLine={false} axisLine={{ stroke: '#2a2f55' }} />
                <YAxis stroke="#9aa4d4" tickLine={false} axisLine={{ stroke: '#2a2f55' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #2a2f55', color: 'white' }} />
                <Line type="monotone" dataKey="price" stroke="#5B8DEF" strokeWidth={2} dot={false} />
                {overlays.maShort && <Line type="monotone" dataKey="maShort" stroke="#22C55E" strokeWidth={2} dot={false} />}
                {overlays.maLong && <Line type="monotone" dataKey="maLong" stroke="#F59E0B" strokeWidth={2} dot={false} />}
                {overlays.upper && <Line type="monotone" dataKey="upper" stroke="#9ca3af" strokeDasharray="4 2" dot={false} />}
                {overlays.lower && <Line type="monotone" dataKey="lower" stroke="#9ca3af" strokeDasharray="4 2" dot={false} />}
                {overlays.resistance && <ReferenceLine y={overlays.resistance} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Resistance', fill: 'white' }} />}
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StrategyResultCard
