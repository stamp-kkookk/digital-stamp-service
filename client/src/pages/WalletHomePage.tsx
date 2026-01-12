import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography } from '@mui/material';

export default function WalletHomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('walletSessionToken');
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            내 지갑
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            스탬프 카드 목록이 여기에 표시됩니다.
          </Typography>

          <Button variant="outlined" fullWidth onClick={handleLogout}>
            로그아웃
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
