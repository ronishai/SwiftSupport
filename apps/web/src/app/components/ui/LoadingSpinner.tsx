export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-spin" />
          <div className="absolute inset-1 bg-surface-DEFAULT rounded-full" />
        </div>
        <p className="text-text-secondary font-medium">טוען...</p>
      </div>
    </div>
  );
}
