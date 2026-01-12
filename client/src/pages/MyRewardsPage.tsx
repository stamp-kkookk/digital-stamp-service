import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { redemptionApi } from '../api/redemption';
import type { RewardInstanceResponse } from '../api/redemption';

export default function MyRewardsPage() {
  const navigate = useNavigate();

  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ['redemption', 'rewards'],
    queryFn: redemptionApi.getMyRewards,
  });

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
            리워드 목록을 불러오는데 실패했습니다.
          </Alert>
          <Button variant="outlined" fullWidth onClick={() => navigate('/wallet/home')}>
            지갑으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  const isExpired = (reward: RewardInstanceResponse) => {
    if (!reward.expiresAt) return false;
    return new Date(reward.expiresAt) < new Date();
  };

  const getDaysRemaining = (reward: RewardInstanceResponse) => {
    if (!reward.expiresAt) return null;
    const days = Math.ceil((new Date(reward.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            내 리워드
          </Typography>
          <Button variant="outlined" size="small" onClick={() => navigate('/wallet/home')}>
            지갑으로
          </Button>
        </Box>

        {!rewards || rewards.length === 0 ? (
          <Alert severity="info">
            사용 가능한 리워드가 없습니다.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                elevation={3}
                sx={{
                  border: isExpired(reward) ? '1px solid' : 'none',
                  borderColor: 'warning.main',
                  opacity: isExpired(reward) ? 0.7 : 1,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {reward.storeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reward.stampCardTitle}
                      </Typography>
                    </Box>
                    {isExpired(reward) && (
                      <Chip label="만료됨" color="warning" size="small" />
                    )}
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: isExpired(reward) ? 'grey.200' : 'success.light',
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      🎁 {reward.rewardName}
                    </Typography>
                  </Box>

                  {reward.expiresAt && (
                    <Typography variant="caption" color={isExpired(reward) ? 'error' : 'text.secondary'}>
                      {isExpired(reward)
                        ? '만료됨'
                        : `${getDaysRemaining(reward)}일 남음 (${new Date(reward.expiresAt).toLocaleDateString('ko-KR')})`}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={isExpired(reward)}
                    onClick={() => navigate(`/redemption/${reward.id}`)}
                  >
                    사용하기
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}
