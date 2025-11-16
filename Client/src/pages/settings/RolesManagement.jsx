import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoles, deleteRole } from '@/api/roles';
import { useToast } from '@/hooks/useToast';
import PageHeader from "@/components/common/PageHeader";
import RoleList from '@/components/settings/RoleList';
import ListEmpty from '@/components/common/ListEmpty';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { HiPlus } from 'react-icons/hi';
import { useEffect, useCallback } from 'react';

export default function RolesManagement() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoles(restaurantId);
      setRoles(data?.roles || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleDelete = async (role) => {
    setConfirmTarget(role);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return setConfirmOpen(false);
    try {
      await deleteRole(restaurantId, confirmTarget.id);
      showToast('Role deleted successfully', 'success');
      fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      showToast(err.response?.data?.error || 'Failed to delete role', 'error');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleEdit = (role) => {
    navigate(`/${restaurantId}/settings/roles/${role.id}/edit`);
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
        title="Roles & Permissions"
        subtitle="Manage roles and their permissions for your restaurant staff"
        actionLabel={<><HiPlus className="w-4 h-4 mr-1" />Create Role</>}
        onAction={() => navigate(`/${restaurantId}/settings/roles/create`)}
      />

      {roles.length === 0 ? (
        <ListEmpty
          title="No roles"
          subtitle="Get started by creating a new role."
          actionLabel="Create Role"
          onAction={() => navigate(`/${restaurantId}/settings/roles/create`)}
        />
      ) : (
        <RoleList roles={roles} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Role"
        message={confirmTarget ? `Are you sure you want to delete role "${confirmTarget.name}"?` : ''}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        confirmLabel="Delete"
      />
    </div>
  );
}
