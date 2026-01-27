import AuthLayout from './components/AuthLayout';
import StoreSelectView from './components/store-select/StoreSelectView';
import { useOwnerStoresQuery } from './hooks/useOwnerStoresQuery';
import Loading from '@/components/shared/Loading';
import Error from '@/components/shared/Error';

const StoreSelectPage = () => {
  const { data: stores, isLoading, isError, refetch } = useOwnerStoresQuery();

  if (isLoading) {
    return <AuthLayout title="운영할 매장을 선택하세요"><Loading /></AuthLayout>;
  }

  if (isError || !stores) {
    return (
      <AuthLayout title="운영할 매장을 선택하세요">
        <Error message="매장 목록을 불러오는데 실패했습니다." onRetry={refetch} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="운영할 매장을 선택하세요">
      <StoreSelectView stores={stores} />
      <div className="text-center mt-6">
        <a href="/t/login" className="text-sm text-blue-600 hover:text-blue-500">
          다른 계정으로 로그인
        </a>
      </div>
    </AuthLayout>
  );
};

export default StoreSelectPage;
