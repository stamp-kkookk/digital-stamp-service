import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { migrationApi } from '../api/migration';
import { publicApi } from '../api/public';
import { useToast } from '../contexts/ToastContext';

export default function StampMigrationPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['public', 'store', storeId],
    queryFn: () => publicApi.getStore(Number(storeId)),
    enabled: !!storeId,
  });

  const { data: stampCard } = useQuery({
    queryKey: ['public', 'stampcard', storeId],
    queryFn: () => publicApi.getActiveStampCard(Number(storeId)),
    enabled: !!storeId,
  });

  const { data: myRequests } = useQuery({
    queryKey: ['migration', 'my'],
    queryFn: migrationApi.getMyMigrationRequests,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => migrationApi.uploadFile(file),
    onSuccess: (data) => {
      setUploadedFileName(data.fileName);
      showToast('사진이 업로드되었습니다', 'success');
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      migrationApi.createMigrationRequest({
        storeId: Number(storeId),
        photoFileName: uploadedFileName!,
      }),
    onSuccess: () => {
      showToast('이전 요청이 제출되었습니다', 'success');
      queryClient.invalidateQueries({ queryKey: ['migration', 'my'] });
      setSelectedFile(null);
      setUploadedFileName(null);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // 파일 크기 체크 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('파일 크기는 10MB 이하여야 합니다', 'error');
        return;
      }
      setSelectedFile(file);
      uploadMutation.mutate(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFileName) {
      showToast('사진을 먼저 업로드해주세요', 'error');
      return;
    }
    createMutation.mutate();
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
        return '검토 중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '반려됨';
      default:
        return status;
    }
  };

  // 이미 요청이 있는지 확인
  const existingRequest = myRequests?.find((req) => req.storeId === Number(storeId));

  if (storeLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!store || !stampCard) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">매장 정보를 찾을 수 없습니다.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            종이 스탬프 이전
          </Typography>

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              매장
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {store.name}
            </Typography>
          </Box>

          {existingRequest ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                이미 이전 요청을 제출하셨습니다.
              </Alert>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      요청 상태
                    </Typography>
                    <Chip
                      label={getStatusText(existingRequest.status)}
                      color={getStatusColor(existingRequest.status)}
                    />
                  </Box>

                  {existingRequest.photoUrl && (
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={existingRequest.photoUrl}
                        alt="Uploaded stamp"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </Box>
                  )}

                  {existingRequest.status === 'APPROVED' && (
                    <Alert severity="success">
                      {existingRequest.approvedStampCount}개의 스탬프가 승인되었습니다!
                    </Alert>
                  )}

                  {existingRequest.status === 'REJECTED' && existingRequest.rejectReason && (
                    <Alert severity="error">
                      반려 사유: {existingRequest.rejectReason}
                    </Alert>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    제출일: {new Date(existingRequest.createdAt).toLocaleString('ko-KR')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                종이 스탬프카드 사진을 업로드하시면, 매장 검토 후 스탬프가 등록됩니다.
              </Alert>

              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="stamp-photo-file"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="stamp-photo-file">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? '업로드 중...' : '사진 선택'}
                  </Button>
                </label>

                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    선택된 파일: {selectedFile.name}
                  </Typography>
                )}
              </Box>

              {uploadedFileName && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    업로드된 사진
                  </Typography>
                  <img
                    src={`/api/files/${uploadedFileName}`}
                    alt="Uploaded"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={!uploadedFileName || createMutation.isPending}
              >
                {createMutation.isPending ? '제출 중...' : '이전 요청 제출'}
              </Button>
            </Box>
          )}

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate(`/s/${storeId}`)}
          >
            돌아가기
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
