import EmptyState from './EmptyState';

interface LoadingPanelProps {
  message?: string;
}

export default function LoadingPanel({
  message = 'Loading…',
}: LoadingPanelProps) {
  return (
    <EmptyState>
      <span className="text-brand">{message}</span>
    </EmptyState>
  );
}
