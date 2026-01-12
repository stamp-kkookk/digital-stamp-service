import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletApi } from '../api/wallet';
import { useToast } from '../contexts/ToastContext';

const accessSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^\d{10,11}$/, '10-11자리 숫자로 입력해주세요'),
  name: z.string().min(1, '이름을 입력해주세요').max(100),
});

type AccessFormData = z.infer<typeof accessSchema>;

export default function WalletAccessPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessFormData>({
    resolver: zodResolver(accessSchema),
  });

  const accessMutation = useMutation({
    mutationFn: (data: AccessFormData) => walletApi.access(data),
    onSuccess: (data) => {
      localStorage.setItem('walletSessionToken', data.sessionToken);
      showToast('지갑에 접속했습니다', 'success');
      navigate('/wallet/home');
    },
  });

  const onSubmit = (data: AccessFormData) => {
    accessMutation.mutate(data);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            지갑 접속
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            등록한 전화번호와 이름으로 지갑에 접속하세요
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={accessMutation.isPending}
            >
              {accessMutation.isPending ? '접속 중...' : '접속하기'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/wallet/register')}
            >
              처음이신가요? 지갑 등록하기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
