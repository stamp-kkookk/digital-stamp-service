import { useParams } from 'react-router-dom';
import StoreSummaryContainer from './StoreSummaryContainer';

const CustomerStorePage = () => {
  const { storeId } = useParams<{ storeId: string }>();

  if (!storeId) {
    // In a real app, you might want a more sophisticated error page
    return <div>잘못된 접근입니다.</div>;
  }

  return <StoreSummaryContainer storeId={storeId} />;
};

export default CustomerStorePage;
