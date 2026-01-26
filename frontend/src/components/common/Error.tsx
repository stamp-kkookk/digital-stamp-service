interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error = ({ message = '오류가 발생했습니다.', onRetry }: ErrorProps) => {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <p className="text-lg text-red-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          재시도
        </button>
      )}
    </div>
  );
};

export default Error;
