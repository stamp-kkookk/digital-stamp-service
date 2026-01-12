import { Container, Typography, Box, Paper } from '@mui/material';

export function OwnerLoginPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            사장님 로그인
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            로그인 폼은 추후 구현 예정
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
