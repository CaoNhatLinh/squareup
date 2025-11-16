import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRole, updateRole, getRole, getPermissionsStructure } from '@/api/roles';
import { useToast } from '@/hooks/useToast';
import PageHeader from "@/components/common/PageHeader";
import { LoadingSpinner, Input, Checkbox, Button, Card } from '@/components/ui';
export default function RoleForm() {
  const { restaurantId, roleId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const isEdit = Boolean(roleId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {},
  });
  const [resources, setResources] = useState([]);
  const [permissionTypes] = useState(['create', 'read', 'update', 'delete']);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const structure = await getPermissionsStructure();
        setResources(structure.resources || []);
        const initialPermissions = {};
        (structure.resources || []).forEach(resource => {
          initialPermissions[resource] = {
            create: false,
            read: false,
            update: false,
            delete: false,
          };
        });
        if (isEdit) {
          const data = await getRole(restaurantId, roleId);
          setFormData({
            name: data.role.name || '',
            description: data.role.description || '',
            permissions: { ...initialPermissions, ...data.role.permissions },
          });
        } else {
          setFormData(prev => ({ ...prev, permissions: initialPermissions }));
        }
      } catch (err) {
        console.error('Error initializing form:', err);
        error('Failed to load form data');
      } finally {
        setInitialLoading(false);
      }
    };

    initialize();
  }, [restaurantId, roleId, isEdit, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (resource, permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: {
          ...prev.permissions[resource],
          [permission]: !prev.permissions[resource]?.[permission],
        },
      },
    }));
  };

  const handleSelectAll = (resource) => {
    const allSelected = permissionTypes.every(
      perm => formData.permissions[resource]?.[perm]
    );

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: {
          create: !allSelected,
          read: !allSelected,
          update: !allSelected,
          delete: !allSelected,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      error('Role name is required');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateRole(restaurantId, roleId, formData);
        success('Role updated successfully');
      } else {
        await createRole(restaurantId, formData);
        success('Role created successfully');
      }
      navigate(`/${restaurantId}/settings/roles`);
    } catch (err) {
      console.error('Error saving role:', err);
      error(err.response?.data?.error || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title={isEdit ? 'Edit Role' : 'Create New Role'} subtitle="Define a role and its permissions for your staff members." onBack={() => navigate(`/${restaurantId}/settings/roles`)} />

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Role Name *
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Manager, Cashier, Cook"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                as="textarea"
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe this role's responsibilities"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Permissions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {resources.map(resource => (
                  <Card key={resource} padding="small" shadow="sm" className="mb-2">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900 capitalize">
                        {resource.replace(/_/g, ' ')}
                      </h5>
                      <Button
                        variant="link"
                        size="small"
                        type="button"
                        onClick={() => handleSelectAll(resource)}
                        className="text-xs text-indigo-600 hover:text-indigo-900"
                        aria-pressed={permissionTypes.every(perm => formData.permissions[resource]?.[perm])}
                        aria-label={permissionTypes.every(perm => formData.permissions[resource]?.[perm]) ? 'Deselect all permissions' : 'Select all permissions'}
                      >
                        {permissionTypes.every(perm => formData.permissions[resource]?.[perm]) ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {permissionTypes.map((perm) => (
                        <Checkbox
                          key={perm}
                          label={<span className="text-sm text-gray-700 capitalize">{perm}</span>}
                          checked={formData.permissions[resource]?.[perm] || false}
                          onChange={() => handlePermissionChange(resource, perm)}
                          size="small"
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/${restaurantId}/settings/roles`)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
              >
                {isEdit ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
