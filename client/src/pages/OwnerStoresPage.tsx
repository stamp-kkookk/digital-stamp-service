import { Container, Typography, Box } from '@mui/material';

export function OwnerStoresPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          내 매장 목록
        </Typography>
        <Typography variant="body1" color="text.secondary">
          매장 관리 기능은 추후 구현 예정
        </Typography>
      </Box>
    </Container>
  );
}
