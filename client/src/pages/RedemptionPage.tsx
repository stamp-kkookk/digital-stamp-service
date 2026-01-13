import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material';
import { redemptionApi } from '../api/redemption';
import { useToast } from '../contexts/ToastContext';

export default function RedemptionPage() {
  const { rewardId } = useParams<{ rewardId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [redeemSessionToken, setRedeemSessionToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(45);

  // 리워드 조회
  const { data: rewards } = useQuery({
    queryKey: ['redemption', 'rewards'],
    queryFn: redemptionApi.getMyRewards,
  });

  const reward = rewards?.find((r) => r.id === Number(rewardId));

  // OTP 발송
  const sendOtpMutation = useMutation({
    mutationFn: () => {
      // 실제로는 지갑의 전화번호를 사용해야 하지만, 여기서는 임시로 고정값 사용
      // 프로덕션에서는 세션에서 전화번호를 가져와야 합니다
      return redemptionApi.sendOtpForStepUp('01012345678');
    },
    onSuccess: (data) => {
      setDevOtpCode(data.devOtpCode || null);
      setOtpDialogOpen(true);
      showToast('인증번호가 발송되었습니다', 'success');
    },
  });

  // OTP 검증
  const verifyOtpMutation = useMutation({
    mutationFn: () => redemptionApi.verifyStepUpOtp(otpCode),
    onSuccess: () => {
      setOtpDialogOpen(false);
      showToast('인증이 완료되었습니다', 'success');
      // OTP 검증 후 RedeemSession 생성
      createSessionMutation.mutate();
    },
  });

  // RedeemSession 생성
  const createSessionMutation = useMutation({
    mutationFn: () => {
      const clientRequestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return redemptionApi.createRedeemSession({
        rewardId: Number(rewardId),
        clientRequestId,
      });
    },
    onSuccess: (data) => {
      setRedeemSessionToken(data.sessionToken);
      setConfirmDialogOpen(true);
      setTimeLeft(45);
    },
  });

  // 리워드 사용 완료
  const completeRedemptionMutation = useMutation({
    mutationFn: () => redemptionApi.completeRedemption(redeemSessionToken!),
    onSuccess: () => {
      showToast('리워드가 사용되었습니다', 'success');
      navigate('/wallet/rewards');
    },
  });

  // 타이머
  useEffect(() => {
    if (!confirmDialogOpen || !redeemSessionToken) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setConfirmDialogOpen(false);
          showToast('사용 시간이 만료되었습니다', 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [confirmDialogOpen, redeemSessionToken, showToast]);

  if (!reward) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">리워드를 찾을 수 없습니다.</Alert>
        </Box>
      </Container>
    );
  }

  const handleStartRedemption = () => {
    sendOtpMutation.mutate();
  };

  const handleVerifyOtp = () => {
    verifyOtpMutation.mutate();
  };

  const handleConfirmRedemption = () => {
    completeRedemptionMutation.mutate();
  };

  const progress = (timeLeft / 45) * 100;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            리워드 사용
          </Typography>

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              매장
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {reward.storeName}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              bgcolor: 'success.light',
              borderRadius: 2,
              my: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              🎁 {reward.rewardName}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            리워드 사용은 취소할 수 없습니다. 반드시 매장 직원과 확인 후 사용하세요.
          </Alert>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleStartRedemption}
            disabled={sendOtpMutation.isPending}
          >
            {sendOtpMutation.isPending ? '처리 중...' : '리워드 사용하기'}
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate('/wallet/rewards')}
          >
            취소
          </Button>
        </Paper>

        {/* OTP 입력 다이얼로그 */}
        <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>본인 인증</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              리워드 사용을 위해 본인 인증이 필요합니다.
            </Typography>

            {devOtpCode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                [DEV 모드] 인증번호: {devOtpCode}
              </Alert>
            )}

            <TextField
              label="인증번호"
              fullWidth
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOtpDialogOpen(false)}>취소</Button>
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={!otpCode || verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? '확인 중...' : '확인'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 최종 확인 다이얼로그 */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>리워드 사용 확인</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 3 }}>
              이 작업은 취소할 수 없습니다. 매장 직원과 확인하셨습니까?
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" align="center" color="primary">
                {timeLeft}초
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>

            <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>
              {reward.storeName}
            </Typography>
            <Typography variant="h6" color="success.main">
              🎁 {reward.rewardName}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>취소</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmRedemption}
              disabled={completeRedemptionMutation.isPending}
            >
              {completeRedemptionMutation.isPending ? '처리 중...' : '사용 완료'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
