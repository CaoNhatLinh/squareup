import { useState } from "react";
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';

export default function InviteStaffModal({ visible, onClose, roles = [], onInvite }) {
  const [form, setForm] = useState({ email: '', roleId: '' });

  const submit = (e) => {
    e.preventDefault();
    onInvite(form);
  };

  return (
    <Modal
      isOpen={visible}
      onClose={onClose}
      title="Invite Staff Member"
      size="small"
    >
      <p className="text-sm text-gray-600 mb-4">Send an invitation to join your restaurant team.</p>

      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="staff@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <Dropdown
          label="Role"
          placeholder="Select a role"
          options={roles.map(r => ({ value: r.id, label: r.name }))}
          value={form.roleId}
          onChange={(value) => setForm({ ...form, roleId: value })}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
