import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { logsApi } from '../api/logs';
import { storeApi } from '../api/store';
import type { EventLogResponse } from '../api/logs';

export default function OwnerLogsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [tab, setTab] = useState(0);

  const { data: stores } = useQuery({
    queryKey: ['owner', 'stores'],
    queryFn: storeApi.getStores,
  });

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['owner', 'logs', tab, selectedStoreId, walletId, fromDate, toDate],
    queryFn: () => {
      const params = {
        storeId: selectedStoreId || undefined,
        walletId: walletId ? Number(walletId) : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      };

      if (tab === 0) return logsApi.getAllLogs(params);
      if (tab === 1) return logsApi.getStampLogs(params);
      return logsApi.getRedeemLogs(params);
    },
    enabled: !!selectedStoreId,
  });

  const handleSearch = () => {
    refetch();
  };

  const handleReset = () => {
    setWalletId('');
    setFromDate('');
    setToDate('');
  };

  const getEventTypeColor = (eventType: string) => {
    return eventType === 'STAMP' ? 'primary' : 'success';
  };

  const getEventSubTypeLabel = (subType: string) => {
    switch (subType) {
      case 'ISSUED':
        return '적립';
      case 'MIGRATED':
        return '이전';
      case 'MANUAL_ADJUST':
        return '수동조정';
      case 'REDEEMED':
        return '사용';
      default:
        return subType;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          이벤트 로그
        </Typography>

        {/* 매장 선택 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
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

          {selectedStoreId && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="지갑 ID"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="시작일시"
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="종료일시"
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleSearch}>
                  검색
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  초기화
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {selectedStoreId && (
          <>
            {/* 탭 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
                <Tab label="전체" />
                <Tab label="스탬프" />
                <Tab label="리워드" />
              </Tabs>
            </Box>

            {/* 로그 테이블 */}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                로그를 불러오는데 실패했습니다.
              </Alert>
            )}

            {!isLoading && !error && logs && logs.length === 0 && (
              <Alert severity="info">조회된 로그가 없습니다.</Alert>
            )}

            {!isLoading && !error && logs && logs.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>타입</TableCell>
                      <TableCell>상세</TableCell>
                      <TableCell>지갑 ID</TableCell>
                      <TableCell>스탬프카드</TableCell>
                      <TableCell>내용</TableCell>
                      <TableCell>시간</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={`${log.eventType}-${log.id}`}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.eventType}
                            color={getEventTypeColor(log.eventType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getEventSubTypeLabel(log.eventSubType)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.walletId}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.stampCardTitle}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.storeName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.stampDelta && (
                            <Typography variant="body2">
                              스탬프: {log.stampDelta > 0 ? '+' : ''}
                              {log.stampDelta}
                            </Typography>
                          )}
                          {log.rewardName && (
                            <Typography variant="body2">
                              리워드: {log.rewardName}
                            </Typography>
                          )}
                          {log.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {log.notes}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(log.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!isLoading && !error && logs && logs.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  총 {logs.length}건의 로그
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
