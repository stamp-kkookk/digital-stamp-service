import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { publicApi } from '../api/public';

export function CustomerLandingPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['public', 'store', storeId],
    queryFn: () => publicApi.getStore(Number(storeId)),
    enabled: !!storeId,
  });

  const { data: stampCard, isLoading: stampCardLoading, error: stampCardError } = useQuery({
    queryKey: ['public', 'stampcard', storeId],
    queryFn: () => publicApi.getActiveStampCard(Number(storeId)),
    enabled: !!storeId,
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

  if (storeError || !store) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            매장 정보를 찾을 수 없습니다.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* 매장 헤더 */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 3,
            textAlign: 'center',
            background: stampCard?.themeColor
              ? `linear-gradient(135deg, ${stampCard.themeColor}22 0%, ${stampCard.themeColor}44 100%)`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {store.name}
          </Typography>

          {store.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {store.description}
            </Typography>
          )}

          {store.address && (
            <Typography variant="body2" color="text.secondary">
              📍 {store.address}
            </Typography>
          )}
        </Paper>

        {/* 스탬프 카드 정보 */}
        {stampCardError ? (
          <Alert severity="info">
            현재 진행 중인 스탬프 적립 이벤트가 없습니다.
          </Alert>
        ) : stampCard ? (
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {stampCard.title}
              </Typography>

              {stampCard.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {stampCard.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {/* 스탬프 목표 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  스탬프 목표
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {stampCard.stampGoal}개
                </Typography>
              </Box>

              {/* 리워드 */}
              {stampCard.rewardName && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    달성 시 혜택
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    🎁 {stampCard.rewardName}
                  </Typography>
                </Box>
              )}

              {/* 유효기간 */}
              {stampCard.rewardExpiresInDays && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    리워드 유효기간
                  </Typography>
                  <Typography variant="body1">
                    {stampCard.rewardExpiresInDays}일
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* 액션 버튼 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ py: 1.5 }}
            disabled={!stampCard}
          >
            스탬프 적립하기
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            sx={{ py: 1.5 }}
            disabled
          >
            내 스탬프 확인하기
          </Button>
        </Box>

        {/* 안내 메시지 */}
        <Alert severity="info" sx={{ mt: 3 }}>
          스탬프 적립 및 확인 기능은 추후 구현 예정입니다.
        </Alert>
      </Box>
    </Container>
  );
}
