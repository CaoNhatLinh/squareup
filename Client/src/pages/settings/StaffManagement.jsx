import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStaffMembers, inviteStaff, removeStaff, updateStaffRole } from '@/api/staff';
import { getRoles } from '@/api/roles';
import { useToast } from '@/hooks/useToast';
import { HiPlus } from 'react-icons/hi';
import InviteStaffModal from '@/components/settings/InviteStaffModal';
import StaffList from '@/components/settings/StaffList';
import Table from '@/components/ui/Table';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Dropdown from '@/components/ui/Dropdown';
import Avatar from '@/components/ui/Avatar';

export default function StaffManagement() {
  const { restaurantId } = useParams();
  const { success, error } = useToast();
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const fetchData = async (opts = {}) => {
    try {
      setLoading(true);
      const [staffData, rolesData] = await Promise.all([
        getStaffMembers(restaurantId, { page: opts.page || page, limit: opts.limit || limit }),
        getRoles(restaurantId),
      ]);
      setStaff(staffData.staff || []);
      setRoles(rolesData.roles || []);
      setTotal((staffData.meta && staffData.meta.total) || 0);
    } catch (err) {
      console.error('Error fetching data:', err);
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);
  const handleInviteSubmit = async (form) => {
    if (!form.email || !form.roleId) {
      error('Please fill in all fields');
      return;
    }

    try {
      await inviteStaff(restaurantId, form);
      success('Invitation sent successfully');
      setShowInviteModal(false);
      fetchData();
    } catch (err) {
      console.error('Error inviting staff:', err, err?.response?.data);
      error(err.response?.data?.error || 'Failed to send invitation');
    }
  };

  const handleRemove = async (staffId, displayName) => {
    if (!window.confirm(`Are you sure you want to remove ${displayName}?`)) {
      return;
    }

    try {
      await removeStaff(restaurantId, staffId);
      success('Staff member removed successfully');
      fetchData();
    } catch (err) {
      console.error('Error removing staff:', err, err?.response?.data);
      error(err.response?.data?.error || 'Failed to remove staff member');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();

    if (!selectedStaff?.newRoleId) {
      error('Please select a role');
      return;
    }

    try {
      await updateStaffRole(restaurantId, selectedStaff.id, selectedStaff.newRoleId);
      success('Role updated successfully');
      setShowEditModal(false);
      setSelectedStaff(null);
      fetchData();
    } catch (err) {
      console.error('Error updating role:', err, err?.response?.data);
      error(err.response?.data?.error || 'Failed to update role');
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Staff Management"
        subtitle="Manage your restaurant staff members and their roles"
        rightChildren={(
          <Button
            variant="primary"
            size="medium"
            icon={HiPlus}
            onClick={() => setShowInviteModal(true)}
          >
            Invite Staff
          </Button>
        )}
      />

      {staff.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by inviting your first staff member.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              size="medium"
              icon={HiPlus}
              onClick={() => setShowInviteModal(true)}
            >
              Invite Staff
            </Button>
          </div>
        </div>
      ) : (
        <Table
          columns={[
            { key: 'name', title: 'Name', render: (r) => (
              <div className="flex items-center gap-4">
                <Avatar name={r.displayName || r.email} size="small" />
                <div>
                  <div className="font-semibold">{r.displayName || r.email}</div>
                  <div className="text-sm text-gray-500">{r.email}</div>
                </div>
              </div>
            )},
            { key: 'role', title: 'Role', render: (r) => <div className="text-sm font-medium">{r.roleName || r.roleId}</div> },
            { key: 'joinedAt', title: 'Joined', render: (r) => (r.joinedAt ? new Date(r.joinedAt).toLocaleString() : '-') },
            { key: 'actions', title: '', render: (r) => (
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="small" onClick={() => { setSelectedStaff({ ...r, newRoleId: r.roleId }); setShowEditModal(true); }}>Edit</Button>
                <Button variant="danger" size="small" onClick={() => handleRemove(r.id, r.displayName || r.email)}>Remove</Button>
              </div>
            )},
          ]}
          data={staff}
          loading={loading}
          rowKey={'id'}
          pagination={{ page, limit, total }}
          onPageChange={(p) => { setPage(p); fetchData({ page: p, limit }); }}
          onLimitChange={(l) => { setLimit(l); setPage(1); fetchData({ page: 1, limit: l }); }}
        />
      )}

      <InviteStaffModal
        visible={showInviteModal}
        onClose={() => {
            setShowInviteModal(false);
          }}
        roles={roles}
        onInvite={handleInviteSubmit}
      />

      <Modal
        isOpen={showEditModal && selectedStaff}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStaff(null);
        }}
        title={`Update Role for ${selectedStaff?.displayName || selectedStaff?.email || ''}`}
        size="small"
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <Dropdown
            label="Role"
            placeholder="Select a role"
            options={roles.map(role => ({ value: role.id, label: role.name }))}
            value={selectedStaff?.newRoleId || ''}
            onChange={(value) => setSelectedStaff({ ...selectedStaff, newRoleId: value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedStaff(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
