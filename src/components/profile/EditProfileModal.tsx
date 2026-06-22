import { useState } from 'react';
import type { Profile } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import TextField from '../ui/TextField';
import type { EditableProfileFields } from './types';

interface EditProfileModalProps {
  open: boolean;
  profile: Profile;
  saving: boolean;
  onClose: () => void;
  onSave: (values: EditableProfileFields) => void;
}

export default function EditProfileModal({
  open,
  profile,
  saving,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [form, setForm] = useState<EditableProfileFields>(() => ({
    full_name: profile.full_name ?? '',
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    location: profile.location ?? '',
  }));

  const updateField = <K extends keyof EditableProfileFields>(
    key: K,
    value: EditableProfileFields[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => onSave(form)}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={form.full_name}
          onChange={(e) => updateField('full_name', e.target.value)}
        />
        <TextField
          label="Username"
          type="text"
          placeholder="username"
          value={form.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-brand">
            Bio
          </label>
          <textarea
            rows={3}
            placeholder="Tell people about yourself"
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            className="w-full resize-none rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-brand placeholder:text-muted focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <TextField
          label="Location"
          type="text"
          placeholder="City, Country"
          value={form.location}
          onChange={(e) => updateField('location', e.target.value)}
        />
      </div>
    </Modal>
  );
}
