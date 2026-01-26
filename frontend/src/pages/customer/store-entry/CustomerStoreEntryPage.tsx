
import { useParams } from 'react-router-dom';
import StoreStampCardSummaryContainer from './components/StoreStampCardSummaryContainer';

const CustomerStoreEntryPage = () => {
  const { storeId } = useParams<{ storeId: string }>();

  if (!storeId) {
    // 이 경우는 React Router 설정이 잘못되지 않는 한 거의 발생하지 않음
    return <div className="text-center text-red-500 p-8">잘못된 접근입니다. 매장 정보가 없습니다.</div>;
  }
  
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md mx-auto">
            <StoreStampCardSummaryContainer storeId={storeId} />
        </div>
    </main>
  );
};

export default CustomerStoreEntryPage;
