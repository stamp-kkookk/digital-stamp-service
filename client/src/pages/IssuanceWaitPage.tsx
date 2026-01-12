import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { issuanceApi } from '../api/issuance';

export default function IssuanceWaitPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(90);

  const { data: request, isLoading, refetch } = useQuery({
    queryKey: ['issuance', requestId],
    queryFn: () => issuanceApi.getRequest(Number(requestId)),
    enabled: !!requestId,
    refetchInterval: (data) => {
      // PENDING 상태일 때만 2초마다 폴링
      if (data?.status === 'PENDING') {
        return 2000;
      }
      return false;
    },
  });

  // 타이머 업데이트
  useEffect(() => {
    if (!request || request.status !== 'PENDING') return;

    const expiresAt = new Date(request.expiresAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        refetch();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request, refetch]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">요청을 찾을 수 없습니다.</Alert>
        </Box>
      </Container>
    );
  }

  const progress = (timeLeft / 90) * 100;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          {request.status === 'PENDING' && (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <CircularProgress size={80} />
              </Box>

              <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                승인 대기 중
              </Typography>

              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                매장 직원이 요청을 확인하고 있습니다
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" align="center" fontWeight="bold" color="primary">
                  {timeLeft}초
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                매장 직원에게 화면을 보여주세요
              </Alert>
            </>
          )}

          {request.status === 'APPROVED' && (
            <>
              <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="success.main">
                ✓ 적립 완료!
              </Typography>

              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                스탬프가 성공적으로 적립되었습니다
              </Typography>

              <Box sx={{ my: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  매장
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {request.storeName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  스탬프 카드
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {request.stampCardTitle}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/wallet/home')}
              >
                내 지갑 보기
              </Button>
            </>
          )}

          {request.status === 'REJECTED' && (
            <>
              <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="error.main">
                ✗ 요청 거부됨
              </Typography>

              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                매장에서 요청을 거부했습니다
              </Typography>

              {request.rejectionReason && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {request.rejectionReason}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate(`/s/${request.storeId}`)}
              >
                돌아가기
              </Button>
            </>
          )}

          {request.status === 'EXPIRED' && (
            <>
              <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="warning.main">
                ⏱ 요청 만료됨
              </Typography>

              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                요청 시간이 초과되었습니다
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate(`/s/${request.storeId}`)}
              >
                다시 시도하기
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
