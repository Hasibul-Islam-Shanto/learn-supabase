import Button from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';

interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  title = 'Delete post',
  message = 'Are you sure you want to delete this post? This action cannot be undone.',
}: DeleteConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">{message}</p>
    </Modal>
  );
}
