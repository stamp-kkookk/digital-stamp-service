import { Card } from '@/components/ui/Card';

const DashboardEmptyView = () => {
  return (
    <Card padding="lg" className="text-center py-12 mt-4">
      <h3 className="text-lg font-semibold text-kkookk-navy">모든 요청이 처리되었습니다.</h3>
      <p className="mt-2 text-sm text-kkookk-steel">
        새로운 스탬프 발급 요청이 들어오면 여기에 표시됩니다.
      </p>
    </Card>
  );
};

export default DashboardEmptyView;
