import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { storeApi } from '../api/store';
import { stampCardApi } from '../api/stampcard';
import { useToast } from '../contexts/ToastContext';
import type { CreateStampCardRequest } from '../types/stampcard';

const createStampCardSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자를 초과할 수 없습니다.'),
  description: z.string().max(1000, '설명은 1000자를 초과할 수 없습니다.').optional(),
  themeColor: z.string().max(50, '테마 색상은 50자를 초과할 수 없습니다.').optional(),
  stampGoal: z.number().min(1, '목표 스탬프는 최소 1개 이상이어야 합니다.'),
  rewardName: z.string().max(200, '리워드 이름은 200자를 초과할 수 없습니다.').optional(),
  rewardExpiresInDays: z.number().min(1, '유효기간은 최소 1일 이상이어야 합니다.').optional(),
});

type CreateStampCardFormData = z.infer<typeof createStampCardSchema>;

export function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStampCardFormData>({
    resolver: zodResolver(createStampCardSchema),
    defaultValues: {
      stampGoal: 10,
      rewardExpiresInDays: 30,
    },
  });

  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storeApi.getStore(Number(storeId)),
    enabled: !!storeId,
  });

  const { data: stampCard, isLoading: stampCardLoading } = useQuery({
    queryKey: ['stampCard', 'store', storeId],
    queryFn: () => stampCardApi.getActiveStampCardByStore(Number(storeId)),
    enabled: !!storeId,
  });

  const createStampCardMutation = useMutation({
    mutationFn: stampCardApi.createStampCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stampCard', 'store', storeId] });
      showToast('스탬프 카드가 생성되었습니다.', 'success');
      setCreateDialogOpen(false);
      reset();
    },
  });

  const handleCreateStampCard = (data: CreateStampCardFormData) => {
    const request: CreateStampCardRequest = {
      storeId: Number(storeId),
      title: data.title,
      description: data.description || undefined,
      themeColor: data.themeColor || undefined,
      stampGoal: data.stampGoal,
      rewardName: data.rewardName || undefined,
      rewardExpiresInDays: data.rewardExpiresInDays || undefined,
    };
    createStampCardMutation.mutate(request);
  };

  if (storeLoading || stampCardLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (storeError || !store) {
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              스탬프 카드
            </Typography>
            {!stampCard && (
              <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
                스탬프 카드 생성
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />

          {stampCard ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  {stampCard.title}
                </Typography>
                <Chip
                  label={stampCard.status}
                  color={stampCard.status === 'ACTIVE' ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {stampCard.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {stampCard.description}
                </Typography>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    목표 스탬프 수
                  </Typography>
                  <Typography variant="body1">{stampCard.stampGoal}개</Typography>
                </Box>

                {stampCard.rewardName && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      리워드
                    </Typography>
                    <Typography variant="body1">{stampCard.rewardName}</Typography>
                  </Box>
                )}

                {stampCard.rewardExpiresInDays && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      리워드 유효기간
                    </Typography>
                    <Typography variant="body1">{stampCard.rewardExpiresInDays}일</Typography>
                  </Box>
                )}

                {stampCard.themeColor && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      테마 색상
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: stampCard.themeColor,
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body1">{stampCard.themeColor}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              스탬프 카드가 아직 생성되지 않았습니다. 첫 스탬프 카드를 생성해보세요!
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Create StampCard Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>스탬프 카드 생성</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              {...register('title')}
              label="제목"
              fullWidth
              margin="normal"
              required
              error={!!errors.title}
              helperText={errors.title?.message}
              placeholder="예: 커피 10잔 적립 이벤트"
            />

            <TextField
              {...register('description')}
              label="설명"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              placeholder="스탬프 카드에 대한 설명을 입력하세요"
            />

            <TextField
              {...register('stampGoal', { valueAsNumber: true })}
              label="목표 스탬프 수"
              type="number"
              fullWidth
              margin="normal"
              required
              error={!!errors.stampGoal}
              helperText={errors.stampGoal?.message}
              InputProps={{ inputProps: { min: 1 } }}
            />

            <TextField
              {...register('rewardName')}
              label="리워드 이름"
              fullWidth
              margin="normal"
              error={!!errors.rewardName}
              helperText={errors.rewardName?.message}
              placeholder="예: 아메리카노 1잔 무료"
            />

            <TextField
              {...register('rewardExpiresInDays', { valueAsNumber: true })}
              label="리워드 유효기간 (일)"
              type="number"
              fullWidth
              margin="normal"
              error={!!errors.rewardExpiresInDays}
              helperText={errors.rewardExpiresInDays?.message}
              InputProps={{ inputProps: { min: 1 } }}
            />

            <TextField
              {...register('themeColor')}
              label="테마 색상"
              fullWidth
              margin="normal"
              error={!!errors.themeColor}
              helperText={errors.themeColor?.message}
              placeholder="예: #6366f1"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleSubmit(handleCreateStampCard)}
            variant="contained"
            disabled={createStampCardMutation.isPending}
          >
            {createStampCardMutation.isPending ? '생성 중...' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
