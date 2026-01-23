interface EmptyProps {
  message?: string;
}

const Empty = ({ message = '데이터가 없습니다.' }: EmptyProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-gray-500">{message}</p>
    </div>
  );
};

export default Empty;
