import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Button,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
} from '@mui/icons-material'

const SettingsPage = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1, display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 2, fontSize: 32 }} />
          환경설정
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          ETF holic 환경을 맞춤 설정하세요
        </Typography>
      </Box>

      {/* 알림 설정 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>
          알림 설정
        </Typography>
        
        <Card sx={{ backgroundColor: 'background.paper' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Email 알림 */}
              <Box>
                <FormControlLabel
                  control={<Switch checked={true} sx={{ color: 'primary.main' }} />}
                  label={
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>
                        Email 알림
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        중요한 업데이트 뉴스를 이메일로 받아보세요.
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
              </Box>

              {/* 푸시 알림 */}
              <Box>
                <FormControlLabel
                  control={<Switch disabled={true} sx={{ color: 'primary.main' }} />}
                  label={
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 500 }}>
                        푸시 알림
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        브라우저 푸시 알림 (준비 중)
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 테마 설정 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>
          테마 설정
        </Typography>
        
        <Card sx={{ backgroundColor: 'background.paper' }}>
          <CardContent sx={{ p: 3 }}>
            <RadioGroup defaultValue="dark" sx={{ gap: 1 }}>
              <FormControlLabel
                value="light"
                control={<Radio sx={{ color: 'primary.main' }} />}
                label={
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                    라이트 모드
                  </Typography>
                }
              />
              <FormControlLabel
                value="dark"
                control={<Radio sx={{ color: 'primary.main' }} />}
                label={
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                    다크 모드
                  </Typography>
                }
              />
              <FormControlLabel
                value="system"
                control={<Radio sx={{ color: 'primary.main' }} />}
                label={
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                    시스템 설정 따름
                  </Typography>
                }
              />
            </RadioGroup>
          </CardContent>
        </Card>
      </Box>

      {/* 변경사항 저장 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          변경사항 저장
        </Button>
      </Box>
    </Box>
  )
}

export default SettingsPage
