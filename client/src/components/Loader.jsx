export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-leaf-200 rounded-full" />
        <div className="w-12 h-12 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-gray-500 animate-pulse-gentle">{text}</p>
    </div>
  );
}
