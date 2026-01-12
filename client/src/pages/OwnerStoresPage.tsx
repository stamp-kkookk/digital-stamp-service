import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storeApi } from '../api/store';
import { useToast } from '../contexts/ToastContext';
import type { CreateStoreRequest } from '../types/store';

const createStoreSchema = z.object({
  name: z.string().min(1, '매장명을 입력해주세요.').max(200, '매장명은 200자를 초과할 수 없습니다.'),
  description: z.string().max(500, '매장 설명은 500자를 초과할 수 없습니다.').optional(),
  address: z.string().max(500, '주소는 500자를 초과할 수 없습니다.').optional(),
  phoneNumber: z.string().max(20, '전화번호는 20자를 초과할 수 없습니다.').optional(),
});

type CreateStoreFormData = z.infer<typeof createStoreSchema>;

export function OwnerStoresPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSchema),
  });

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores'],
    queryFn: storeApi.getStores,
  });

  const createStoreMutation = useMutation({
    mutationFn: storeApi.createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      showToast('매장이 생성되었습니다.', 'success');
      setCreateDialogOpen(false);
      reset();
    },
  });

  const handleCreateStore = (data: CreateStoreFormData) => {
    const request: CreateStoreRequest = {
      name: data.name,
      description: data.description || undefined,
      address: data.address || undefined,
      phoneNumber: data.phoneNumber || undefined,
    };
    createStoreMutation.mutate(request);
  };

  const handleStoreClick = (storeId: number) => {
    navigate(`/owner/stores/${storeId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">매장 목록을 불러오는데 실패했습니다.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            내 매장 목록
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/owner/terminal')}
            >
              승인 터미널
            </Button>
            <Button
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
            >
              매장 추가
            </Button>
          </Box>
        </Box>

        {stores && stores.length === 0 ? (
          <Alert severity="info">
            아직 등록된 매장이 없습니다. 첫 매장을 추가해보세요!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {stores?.map((store) => (
              <Grid item xs={12} sm={6} md={4} key={store.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {store.name}
                    </Typography>
                    {store.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {store.description}
                      </Typography>
                    )}
                    {store.address && (
                      <Typography variant="body2" color="text.secondary">
                        📍 {store.address}
                      </Typography>
                    )}
                    {store.phoneNumber && (
                      <Typography variant="body2" color="text.secondary">
                        📞 {store.phoneNumber}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleStoreClick(store.id)}>
                      관리하기
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create Store Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 매장 추가</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              {...register('name')}
              label="매장명"
              fullWidth
              margin="normal"
              required
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('description')}
              label="매장 설명"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <TextField
              {...register('address')}
              label="주소"
              fullWidth
              margin="normal"
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <TextField
              {...register('phoneNumber')}
              label="전화번호"
              fullWidth
              margin="normal"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleSubmit(handleCreateStore)}
            variant="contained"
            disabled={createStoreMutation.isPending}
          >
            {createStoreMutation.isPending ? '생성 중...' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
