import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { storeApi } from '../api/store';

export function StoreQRPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storeApi.getStore(Number(storeId)),
    enabled: !!storeId,
  });

  const handlePrint = () => {
    window.print();
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

  if (error || !store) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">매장 정보를 불러오는데 실패했습니다.</Alert>
        </Box>
      </Container>
    );
  }

  // QR 코드가 가리킬 URL (고객용 랜딩 페이지)
  const qrUrl = `${window.location.origin}/s/${storeId}`;

  return (
    <>
      {/* 프린트 안 되는 부분 */}
      <Box className="no-print" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">QR 코드 출력</Typography>
            <Button variant="contained" onClick={handlePrint}>
              프린트
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 프린트될 부분 */}
      <Container maxWidth="md" className="print-area">
        <Box
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              width: '100%',
              maxWidth: 600,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              {store.name}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              디지털 스탬프 적립하기
            </Typography>

            {/* QR 코드 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                p: 3,
                backgroundColor: '#fff',
              }}
            >
              <QRCode
                value={qrUrl}
                size={256}
                level="H"
                style={{ height: 'auto', maxWidth: '100%', width: '256px' }}
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              스마트폰 카메라로 QR 코드를 스캔하세요
            </Typography>

            <Box
              sx={{
                mt: 4,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {qrUrl}
              </Typography>
            </Box>

            {store.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                {store.description}
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>

      {/* 프린트용 CSS */}
      <style>{`
        @media print {
          /* 프린트할 때 헤더/푸터 등 숨기기 */
          .no-print {
            display: none !important;
          }

          /* 프린트 영역만 표시 */
          body * {
            visibility: hidden;
          }

          .print-area, .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* 페이지 여백 최소화 */
          @page {
            margin: 1cm;
          }

          /* 배경색 프린트 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}
