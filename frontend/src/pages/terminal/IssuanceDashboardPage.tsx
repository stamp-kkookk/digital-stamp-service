import { useParams } from 'react-router-dom';
import DashboardLayout from './components/issuance/DashboardLayout';
import KpiCards from './components/issuance/KpiCards';
import IssuanceRequestTable from './components/issuance/IssuanceRequestTable';
import DashboardEmptyView from './components/issuance/DashboardEmptyView';
import { useDashboardKpiQuery } from './hooks/useDashboardKpiQuery';
import { usePendingIssuancesQuery } from './hooks/usePendingIssuancesQuery';
import { useApproveIssuanceMutation } from './hooks/useApproveIssuanceMutation';
import { useRejectIssuanceMutation } from './hooks/useRejectIssuanceMutation';
import Error from '@/components/shared/Error';
import Loading from '@/components/shared/Loading';

const IssuanceDashboardPage = () => {
  const { storeId } = useParams<{ storeId: string }>();

  if (!storeId) {
    return (
      <DashboardLayout>
        <Error message="매장 ID가 유효하지 않습니다." />
      </DashboardLayout>
    );
  }

  const { data: kpiData, isLoading: isKpiLoading } = useDashboardKpiQuery(storeId);
  const { data: issuancesData, isLoading: isIssuancesLoading, refetch: refetchIssuances } = usePendingIssuancesQuery({ storeId });
  const approveMutation = useApproveIssuanceMutation(storeId);
  const rejectMutation = useRejectIssuanceMutation(storeId);
  
  const handleApprove = (requestId: string) => {
    approveMutation.mutate(requestId);
  };
  
  const handleReject = (requestId: string) => {
    rejectMutation.mutate(requestId);
  };

  const requests = issuancesData?.content || [];

  return (
    <DashboardLayout storeName={`매장 ${storeId}`} terminalId={`${storeId}-WEB`}>
      <KpiCards data={kpiData} isLoading={isKpiLoading} />
      {isIssuancesLoading && <Loading />}
      {!isIssuancesLoading && requests.length === 0 && <DashboardEmptyView />}
      {!isIssuancesLoading && requests.length > 0 && (
        <IssuanceRequestTable
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={refetchIssuances}
        />
      )}
    </DashboardLayout>
  );
};

export default IssuanceDashboardPage;
