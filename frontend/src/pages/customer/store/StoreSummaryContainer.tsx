import { useStoreSummaryQuery } from '@/hooks/queries/useStoreSummaryQuery';
import Loading from '@/components/shared/Loading';
import Error from '@/components/shared/Error';
import Empty from '@/components/shared/Empty';
import StoreSummary from './components/StoreSummary';

interface StoreSummaryContainerProps {
  storeId: string;
}

const StoreSummaryContainer = ({ storeId }: StoreSummaryContainerProps) => {
  const { data, isLoading, isError, error } = useStoreSummaryQuery(storeId);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // @ts-ignore
    const message = error.response?.data?.message || '매장 정보를 불러오는데 실패했습니다.';
    return <Error message={message} />;
  }

  if (!data || !data.stampCard) {
    const message = data ? '현재 진행 중인 스탬프 이벤트가 없습니다.' : '매장 정보를 찾을 수 없습니다.';
    return <Empty message={message} />;
  }

  return <StoreSummary storeName={data.storeName} stampCard={data.stampCard} />;
};

export default StoreSummaryContainer;
