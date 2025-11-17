import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoles, deleteRole } from '@/api/roles';
import { useToast } from '@/hooks/useToast';
import PageHeader from "@/components/common/PageHeader";
import RoleList from '@/components/settings/RoleList';
import Table from '@/components/ui/Table';
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [_error, setError] = useState(null);

  const fetchRoles = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoles(restaurantId, { page: opts.page || page, limit: opts.limit || limit });
      setRoles(data?.roles || []);
      setTotal((data.meta && data.meta.total) || 0);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, page, limit]);

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
        <Table
          columns={[
            { key: 'name', title: 'Role', render: (r) => <div className="font-semibold">{r.name}</div> },
            { key: 'description', title: 'Description', render: (r) => <div className="text-sm text-gray-600">{r.description}</div> },
            { key: 'permissions', title: 'Permissions', render: (r) => (
                <div className="flex flex-wrap gap-2">{Object.entries(r.permissions || {}).map(([resource, perms]) => { const activePerms = Object.entries(perms).filter(([, value]) => value).map(([key]) => key); if (activePerms.length === 0) return null; return (<span key={resource} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">{resource.replace(/_/g, ' ')} ({activePerms.join(',')})</span>); })}</div>
            )},
            { key: 'actions', title: '', render: (r) => (<div className="flex justify-end gap-2"><Button variant="secondary" size="small" onClick={() => handleEdit(r)}>Edit</Button><Button variant="danger" size="small" onClick={() => handleDelete(r)}>Delete</Button></div>) }
          ]}
          data={roles}
          loading={loading}
          rowKey={'id'}
          pagination={{ page, limit, total }}
          onPageChange={(p) => { setPage(p); fetchRoles({ page: p, limit }); }}
          onLimitChange={(l) => { setLimit(l); setPage(1); fetchRoles({ page: 1, limit: l }); }}
        />
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
