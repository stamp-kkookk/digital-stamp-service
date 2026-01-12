import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { issuanceApi } from '../api/issuance';
import { storeApi } from '../api/store';
import { useToast } from '../contexts/ToastContext';

export default function OwnerTerminalPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // 매장 목록 조회
  const { data: stores } = useQuery({
    queryKey: ['owner', 'stores'],
    queryFn: storeApi.getStores,
  });

  // 대기 중인 요청 조회 (2초마다 폴링)
  const { data: requests, isLoading } = useQuery({
    queryKey: ['owner', 'issuance', 'pending', selectedStoreId],
    queryFn: () => issuanceApi.getPendingRequests(selectedStoreId!),
    enabled: !!selectedStoreId,
    refetchInterval: 2000,
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => issuanceApi.approveRequest(requestId),
    onSuccess: () => {
      showToast('적립 요청을 승인했습니다', 'success');
      queryClient.invalidateQueries({ queryKey: ['owner', 'issuance', 'pending'] });
    },
    onError: () => {
      showToast('승인에 실패했습니다', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason: string }) =>
      issuanceApi.rejectRequest(requestId, reason),
    onSuccess: () => {
      showToast('적립 요청을 거부했습니다', 'info');
      queryClient.invalidateQueries({ queryKey: ['owner', 'issuance', 'pending'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: () => {
      showToast('거부에 실패했습니다', 'error');
    },
  });

  const handleReject = () => {
    if (selectedRequestId) {
      rejectMutation.mutate({
        requestId: selectedRequestId,
        reason: rejectionReason || '거부됨',
      });
    }
  };

  const openRejectDialog = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return `${remaining}초 남음`;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          스탬프 승인 터미널
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>매장 선택</InputLabel>
            <Select
              value={selectedStoreId || ''}
              onChange={(e) => setSelectedStoreId(Number(e.target.value))}
              label="매장 선택"
            >
              {stores?.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {selectedStoreId && (
          <>
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!isLoading && requests && requests.length === 0 && (
              <Alert severity="info">대기 중인 적립 요청이 없습니다.</Alert>
            )}

            {!isLoading && requests && requests.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {requests.map((request) => (
                  <Card key={request.id} elevation={3}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {request.stampCardTitle}
                        </Typography>
                        <Chip
                          label={getTimeRemaining(request.expiresAt)}
                          color="warning"
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        고객 지갑 ID: {request.walletId}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        요청 시간: {new Date(request.createdAt).toLocaleString('ko-KR')}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => openRejectDialog(request.id)}
                        disabled={rejectMutation.isPending}
                      >
                        거부
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending}
                      >
                        승인
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}

        {/* 거부 사유 입력 다이얼로그 */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>적립 요청 거부</DialogTitle>
          <DialogContent>
            <TextField
              label="거부 사유 (선택)"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>취소</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              거부
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
