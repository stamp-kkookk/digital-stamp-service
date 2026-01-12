import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { issuanceApi } from '../api/issuance';
import { publicApi } from '../api/public';
import { useToast } from '../contexts/ToastContext';

export default function IssuanceRequestPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['public', 'store', storeId],
    queryFn: () => publicApi.getStore(Number(storeId)),
    enabled: !!storeId,
  });

  const { data: stampCard, isLoading: stampCardLoading } = useQuery({
    queryKey: ['public', 'stampcard', storeId],
    queryFn: () => publicApi.getActiveStampCard(Number(storeId)),
    enabled: !!storeId,
  });

  const createRequestMutation = useMutation({
    mutationFn: () => {
      const clientRequestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return issuanceApi.createRequest({
        storeId: Number(storeId),
        clientRequestId,
      });
    },
    onSuccess: (data) => {
      showToast('적립 요청이 생성되었습니다', 'success');
      navigate(`/issuance/${data.id}/wait`);
    },
    onError: () => {
      showToast('적립 요청 생성에 실패했습니다', 'error');
    },
  });

  if (storeLoading || stampCardLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!store || !stampCard) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            매장 정보 또는 스탬프 카드를 찾을 수 없습니다.
          </Alert>
        </Box>
      </Container>
    );
  }

  // 세션 토큰 확인
  const sessionToken = localStorage.getItem('walletSessionToken');
  if (!sessionToken) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            지갑에 로그인이 필요합니다.
          </Alert>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/wallet/register')}
          >
            지갑 등록하기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            스탬프 적립 요청
          </Typography>

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              매장
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {store.name}
            </Typography>
          </Box>

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              스탬프 카드
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {stampCard.title}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            적립 요청을 생성하면 매장 직원이 승인할 때까지 대기합니다.
            요청은 90초 후 자동으로 만료됩니다.
          </Alert>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => createRequestMutation.mutate()}
            disabled={createRequestMutation.isPending}
          >
            {createRequestMutation.isPending ? '요청 생성 중...' : '적립 요청하기'}
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate(`/s/${storeId}`)}
          >
            취소
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
