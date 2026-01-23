interface ErrorProps {
  message?: string;
}

const Error = ({ message = '오류가 발생했습니다.' }: ErrorProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-red-500">{message}</p>
    </div>
  );
};

export default Error;
