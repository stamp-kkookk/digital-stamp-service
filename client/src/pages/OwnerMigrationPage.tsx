import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
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
  Tabs,
  Tab,
} from '@mui/material';
import { migrationApi } from '../api/migration';
import { storeApi } from '../api/store';
import { useToast } from '../contexts/ToastContext';
import type { MigrationRequestResponse } from '../api/migration';

export default function OwnerMigrationPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MigrationRequestResponse | null>(null);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [rejectReason, setRejectReason] = useState('');
  const [tab, setTab] = useState(0);

  const { data: stores } = useQuery({
    queryKey: ['owner', 'stores'],
    queryFn: storeApi.getStores,
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['owner', 'migration', selectedStoreId, tab],
    queryFn: () =>
      tab === 0
        ? migrationApi.getSubmittedRequests(selectedStoreId!)
        : migrationApi.getAllRequests(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, count }: { id: number; count: number }) =>
      migrationApi.approveRequest(id, count),
    onSuccess: () => {
      showToast('요청이 승인되었습니다', 'success');
      queryClient.invalidateQueries({ queryKey: ['owner', 'migration'] });
      setApproveDialogOpen(false);
      setApprovedCount(0);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      migrationApi.rejectRequest(id, reason),
    onSuccess: () => {
      showToast('요청이 반려되었습니다', 'info');
      queryClient.invalidateQueries({ queryKey: ['owner', 'migration'] });
      setRejectDialogOpen(false);
      setRejectReason('');
    },
  });

  const openApproveDialog = (request: MigrationRequestResponse) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (request: MigrationRequestResponse) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest || approvedCount < 0) {
      showToast('올바른 스탬프 개수를 입력해주세요', 'error');
      return;
    }
    approveMutation.mutate({ id: selectedRequest.id, count: approvedCount });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    rejectMutation.mutate({ id: selectedRequest.id, reason: rejectReason || '반려됨' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return '검토 대기';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '반려됨';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          종이 스탬프 이전 관리
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
                <Tab label="검토 대기" />
                <Tab label="전체 요청" />
              </Tabs>
            </Box>

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!isLoading && requests && requests.length === 0 && (
              <Alert severity="info">요청이 없습니다.</Alert>
            )}

            {!isLoading && requests && requests.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {requests.map((request) => (
                  <Card key={request.id} elevation={3}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {request.stampCardTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            고객 지갑 ID: {request.walletId}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusText(request.status)}
                          color={getStatusColor(request.status)}
                        />
                      </Box>

                      {request.photoUrl && (
                        <Box sx={{ mb: 2 }}>
                          <img
                            src={request.photoUrl}
                            alt="Stamp migration"
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                          />
                        </Box>
                      )}

                      {request.status === 'APPROVED' && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          승인된 스탬프: {request.approvedStampCount}개
                        </Alert>
                      )}

                      {request.status === 'REJECTED' && request.rejectReason && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          반려 사유: {request.rejectReason}
                        </Alert>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        제출일: {new Date(request.createdAt).toLocaleString('ko-KR')}
                      </Typography>
                    </CardContent>

                    {request.status === 'SUBMITTED' && (
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => openRejectDialog(request)}
                        >
                          반려
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => openApproveDialog(request)}
                        >
                          승인
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}

        {/* 승인 다이얼로그 */}
        <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>이전 요청 승인</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              승인할 스탬프 개수를 입력해주세요.
            </Typography>

            <TextField
              label="승인 스탬프 개수"
              type="number"
              fullWidth
              value={approvedCount}
              onChange={(e) => setApprovedCount(Number(e.target.value))}
              inputProps={{ min: 0, max: selectedRequest?.stampCardGoal || 100 }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)}>취소</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={approveMutation.isPending || approvedCount < 0}
            >
              {approveMutation.isPending ? '처리 중...' : '승인'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 반려 다이얼로그 */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>이전 요청 반려</DialogTitle>
          <DialogContent>
            <TextField
              label="반려 사유"
              fullWidth
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
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
              {rejectMutation.isPending ? '처리 중...' : '반려'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
