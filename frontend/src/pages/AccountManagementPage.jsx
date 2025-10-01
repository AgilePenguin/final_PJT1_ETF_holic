import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  ManageAccounts as ManageAccountsIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  CheckCircle as CheckCircleIcon,
  Diamond as DiamondIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
} from '@mui/icons-material'

const AccountManagementPage = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1, display: 'flex', alignItems: 'center' }}>
          <ManageAccountsIcon sx={{ mr: 2, fontSize: 32 }} />
          계정 관리
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          ETF holic 계정을 관리하세요
        </Typography>
      </Box>

      {/* 내 정보 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>
          내 정보
        </Typography>
        
        <Card sx={{ backgroundColor: 'background.paper' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  이메일 주소
                </Typography>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>
                  etfuser@gmail.com
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  이름
                </Typography>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>
                  사용자
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                비밀번호 변경
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    borderColor: 'error.dark',
                    backgroundColor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                로그아웃
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 구독 플랜 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>
          구독 플랜
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          현재 플랜: Free
        </Typography>
        
        <Card 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '2px solid',
            borderColor: 'primary.main',
            position: 'relative',
          }}
        >
          <Chip
            label="RECOMMENDED"
            color="primary"
            sx={{
              position: 'absolute',
              top: -10,
              right: 20,
              fontWeight: 'bold',
            }}
          />
          
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkspacePremiumIcon sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                ETF holic Pro
              </Typography>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              ₩2,900 / 월
            </Typography>
            
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="무제한 포트폴리오 생성"
                  sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="상세 AI 분석 리포트"
                  sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="데이터 실시간 업데이트"
                  sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="광고 제거"
                  sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                />
              </ListItem>
            </List>
            
            <Button
              variant="contained"
              startIcon={<DiamondIcon />}
              fullWidth
              sx={{
                py: 2,
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Pro로 업그레이드
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* 계정 삭제 섹션 */}
      <Box>
        <Card 
          sx={{ 
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'error.main',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                  계정 삭제
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="error"
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                회원 탈퇴
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default AccountManagementPage
