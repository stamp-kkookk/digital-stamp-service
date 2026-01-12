import { useQuery } from '@tanstack/react-query';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { pingApi } from '../api/ping';

export function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ping'],
    queryFn: pingApi.ping,
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          KKOOKK (꾸욱)
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          디지털 스탬프 서비스
        </Typography>

        <Box sx={{ mt: 4 }}>
          {isLoading && <CircularProgress />}

          {error && (
            <Alert severity="error">
              서버 연결에 실패했습니다.
            </Alert>
          )}

          {data && (
            <Alert severity="success">
              서버 상태: {data.message}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
}
