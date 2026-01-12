import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { storeApi } from '../api/store';

export function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storeApi.getStore(Number(storeId)),
    enabled: !!storeId,
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !store) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">매장 정보를 불러오는데 실패했습니다.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {store.name}
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            매장 정보
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {store.description && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                설명
              </Typography>
              <Typography variant="body1">{store.description}</Typography>
            </Box>
          )}

          {store.address && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                주소
              </Typography>
              <Typography variant="body1">{store.address}</Typography>
            </Box>
          )}

          {store.phoneNumber && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                전화번호
              </Typography>
              <Typography variant="body1">{store.phoneNumber}</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            스탬프 카드 관리
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            스탬프 카드 관리 기능은 추후 구현 예정
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
