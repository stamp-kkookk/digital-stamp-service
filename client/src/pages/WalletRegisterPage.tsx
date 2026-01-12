import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletApi } from '../api/wallet';
import { useToast } from '../contexts/ToastContext';

const registerSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^\d{10,11}$/, '10-11자리 숫자로 입력해주세요'),
  otpCode: z.string().min(1, '인증번호를 입력해주세요'),
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  nickname: z.string().max(100).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function WalletRegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const phoneNumber = watch('phoneNumber');

  const sendOtpMutation = useMutation({
    mutationFn: () => walletApi.sendOtp({ phoneNumber }),
    onSuccess: (data) => {
      setOtpSent(true);
      setDevOtpCode(data.devOtpCode || null);
      showToast(data.message, 'success');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => walletApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('walletSessionToken', data.sessionToken);
      showToast('지갑이 등록되었습니다', 'success');
      navigate('/wallet/home');
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const handleSendOtp = () => {
    if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
      showToast('올바른 전화번호를 입력해주세요', 'error');
      return;
    }
    sendOtpMutation.mutate();
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            고객 등록
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            전화번호로 지갑을 등록하여 스탬프를 적립하세요
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2 }}>
              <TextField
                {...register('phoneNumber')}
                label="전화번호"
                fullWidth
                placeholder="01012345678"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                disabled={otpSent}
              />
            </Box>

            {!otpSent && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                sx={{ mb: 2 }}
              >
                {sendOtpMutation.isPending ? '발송 중...' : '인증번호 발송'}
              </Button>
            )}

            {devOtpCode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                [DEV 모드] 인증번호: {devOtpCode}
              </Alert>
            )}

            {otpSent && (
              <>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    {...register('otpCode')}
                    label="인증번호"
                    fullWidth
                    error={!!errors.otpCode}
                    helperText={errors.otpCode?.message}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    {...register('name')}
                    label="이름"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    {...register('nickname')}
                    label="닉네임 (선택)"
                    fullWidth
                    error={!!errors.nickname}
                    helperText={errors.nickname?.message}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? '등록 중...' : '등록하기'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setOtpSent(false)}
                  sx={{ mt: 1 }}
                >
                  전화번호 다시 입력
                </Button>
              </>
            )}
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/wallet/access')}
            >
              이미 등록하셨나요? 지갑 접속하기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
