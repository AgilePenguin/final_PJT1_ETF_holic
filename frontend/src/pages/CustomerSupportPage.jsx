import React from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  Send as SendIcon,
} from '@mui/icons-material'

const CustomerSupportPage = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1, display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon sx={{ mr: 2, fontSize: 32 }} />
          고객센터
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          ETF holic 이용에 도움이 필요하신가요?
        </Typography>
      </Box>

      {/* FAQ 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon sx={{ mr: 1.5, fontSize: 24 }} />
          자주 묻는 질문 (FAQ)
        </Typography>
        
        <Box sx={{ '& .MuiAccordion-root': { mb: 1 } }}>
          <Accordion sx={{ backgroundColor: 'background.paper' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiAccordionSummary-content': {
                  color: 'white',
                  fontWeight: 500,
                },
              }}
            >
              <Typography>Pro 플랜은 무엇이 다른가요?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'background.paper' }}>
              <Typography sx={{ color: 'text.secondary' }}>
                답변 내용이 여기에 표시됩니다.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ backgroundColor: 'background.paper' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiAccordionSummary-content': {
                  color: 'white',
                  fontWeight: 500,
                },
              }}
            >
              <Typography>데이터는 얼마나 자주 업데이트되나요?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'background.paper' }}>
              <Typography sx={{ color: 'text.secondary' }}>
                답변 내용이 여기에 표시됩니다.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ backgroundColor: 'background.paper' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiAccordionSummary-content': {
                  color: 'white',
                  fontWeight: 500,
                },
              }}
            >
              <Typography>비밀번호를 잊어버렸어요.</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'background.paper' }}>
              <Typography sx={{ color: 'text.secondary' }}>
                답변 내용이 여기에 표시됩니다.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* 문의하기 섹션 */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
          <SendIcon sx={{ mr: 1.5, fontSize: 24 }} />
          문의하기
        </Typography>
        
        <Card sx={{ backgroundColor: 'background.paper' }}>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="이메일 주소"
                variant="outlined"
                defaultValue="etfuser@gmail.com"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.default',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  },
                }}
              />
              
              <TextField
                label="문의 제목"
                variant="outlined"
                placeholder="문의 제목을 입력하세요"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.default',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  },
                }}
              />
              
              <TextField
                label="문의 내용"
                variant="outlined"
                placeholder="문의 내용을 상세히 작성해주세요"
                multiline
                rows={8}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.default',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
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
                  문의 제출
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default CustomerSupportPage