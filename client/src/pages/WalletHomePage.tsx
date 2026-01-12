import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { walletApi } from '../api/wallet';
import type { WalletStampCardResponse } from '../api/wallet';

export default function WalletHomePage() {
  const navigate = useNavigate();

  const { data: stampCards, isLoading, error } = useQuery({
    queryKey: ['wallet', 'stamp-cards'],
    queryFn: walletApi.getMyStampCards,
  });

  const handleLogout = () => {
    localStorage.removeItem('walletSessionToken');
    navigate('/');
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            스탬프 카드 목록을 불러오는데 실패했습니다.
          </Alert>
          <Button variant="outlined" fullWidth onClick={handleLogout}>
            로그아웃
          </Button>
        </Box>
      </Container>
    );
  }

  const getProgress = (card: WalletStampCardResponse) => {
    return (card.stampCount / card.stampGoal) * 100;
  };

  const isCompleted = (card: WalletStampCardResponse) => {
    return card.stampCount >= card.stampGoal;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            내 스탬프 카드
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLogout}>
            로그아웃
          </Button>
        </Box>

        {!stampCards || stampCards.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              아직 적립한 스탬프가 없습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              QR 코드를 스캔하여 스탬프를 적립해보세요!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stampCards.map((card) => (
              <Card
                key={card.id}
                elevation={3}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                  border: isCompleted(card) ? '2px solid' : 'none',
                  borderColor: 'success.main',
                }}
                onClick={() => navigate(`/s/${card.storeId}`)}
              >
                <CardContent>
                  {/* 헤더 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {card.storeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.stampCardTitle}
                      </Typography>
                    </Box>
                    {isCompleted(card) && (
                      <Chip
                        label="완료!"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 진행 상황 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        진행 상황
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {card.stampCount} / {card.stampGoal}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(getProgress(card), 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: isCompleted(card) ? 'success.main' : card.themeColor || 'primary.main',
                        },
                      }}
                    />
                  </Box>

                  {/* 리워드 정보 */}
                  {card.rewardName && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: isCompleted(card) ? 'success.light' : 'grey.100',
                        borderRadius: 2,
                        mt: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {isCompleted(card) ? '획득한 리워드' : '목표 달성 시'}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        🎁 {card.rewardName}
                      </Typography>
                      {card.rewardExpiresInDays && (
                        <Typography variant="caption" color="text.secondary">
                          유효기간: {card.rewardExpiresInDays}일
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* 주소 */}
                  {card.storeAddress && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      📍 {card.storeAddress}
                    </Typography>
                  )}

                  {/* 마지막 업데이트 */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    마지막 업데이트: {new Date(card.updatedAt).toLocaleDateString('ko-KR')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* 안내 */}
        <Alert severity="info" sx={{ mt: 3 }}>
          스탬프 카드를 클릭하면 해당 매장 페이지로 이동합니다.
        </Alert>
      </Box>
    </Container>
  );
}
