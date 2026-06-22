import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirm({
  open,
  onClose,
  onConfirm,
}: DeleteConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete post"
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
      <p className="text-sm leading-relaxed text-muted">
        Are you sure you want to delete this post? This action cannot be undone.
      </p>
    </Modal>
  );
}
