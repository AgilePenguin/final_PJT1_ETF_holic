import React from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  CompareArrows,
  BarChart,
  Star,
  StarBorder,
  Visibility,
  Person,
  Logout,
} from '@mui/icons-material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'

const Sidebar = () => {
  const location = useLocation()
  const menuItems = [
    { text: 'ETF 비교', icon: <CompareArrows />, to: '/' },
    { text: '전략 분석', icon: <BarChart />, to: '/strategy' },
    { text: '나만의 지수', icon: <Star />, to: '/my-index' },
    { text: '나만의 포트폴리오', icon: <StarBorder />, to: '/my-portfolios' },
  ]

  const visionItems = ['Innovate', 'Import', 'Indicate']

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: 3,
        boxSizing: 'border-box',
      }}
    >
      {/* 로고 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              position: 'relative',
            }}
          >
            <Visibility sx={{ color: 'white', fontSize: 30 }} />
            <Typography
              sx={{
                position: 'absolute',
                fontSize: '8px',
                color: 'white',
                fontWeight: 'bold',
                transform: 'rotate(-90deg)',
                right: -15,
                top: '50%',
                transformOrigin: 'center',
              }}
            >
              ETF HOLIC
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', lineHeight: 1 }}>
              ETF holic
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '12px', mt: 0.5 }}>
              깊은 투자 인사이트 플랫폼
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 메뉴 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', mb: 2, fontSize: '16px' }}>
          메뉴
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={RouterLink}
              to={item.to}
              sx={{
                px: 0,
                py: 1,
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 1,
                backgroundColor: location.pathname === item.to ? '#eef3ff' : 'transparent',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* 사용자 편의 메뉴 */}
      <Divider sx={{ my: 1 }} />
      <List>
        <ListItem 
          component={RouterLink}
          to="/customer-support"
          sx={{ 
            px: 0,
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 1,
            backgroundColor: location.pathname === '/customer-support' ? '#eef3ff' : 'transparent',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
            <HelpOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="고객센터" sx={{ '& .MuiListItemText-primary': { color: '#333', fontSize: '14px', fontWeight: 500 } }} />
        </ListItem>
        <ListItem 
          component={RouterLink}
          to="/settings"
          sx={{ 
            px: 0,
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 1,
            backgroundColor: location.pathname === '/settings' ? '#eef3ff' : 'transparent',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="환경설정" sx={{ '& .MuiListItemText-primary': { color: '#333', fontSize: '14px', fontWeight: 500 } }} />
        </ListItem>
        <ListItem 
          component={RouterLink}
          to="/account-management"
          sx={{ 
            px: 0,
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 1,
            backgroundColor: location.pathname === '/account-management' ? '#eef3ff' : 'transparent',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText primary="계정관리" sx={{ '& .MuiListItemText-primary': { color: '#333', fontSize: '14px', fontWeight: 500 } }} />
        </ListItem>
      </List>

      {/* 사용자 프로필 */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, backgroundColor: '#1976d2', mr: 2 }}>
            <Person />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
              coolvvithu@gmail.com
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#666', cursor: 'pointer', '&:hover': { color: '#1976d2' } }}>
          <Logout sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            로그아웃
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
