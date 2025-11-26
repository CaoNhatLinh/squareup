import { HiPencil, HiTrash } from 'react-icons/hi';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function RoleList({ roles, onEdit, onDelete }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((role) => (
        <Card key={role.id} hover className="transition-transform transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="pr-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
              {role.description && <p className="mt-1 text-sm text-gray-600">{role.description}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="small"
                icon={HiPencil}
                onClick={() => onEdit(role)}
                aria-label={`Edit ${role.name}`}
              >
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="danger"
                size="small"
                icon={HiTrash}
                onClick={() => onDelete(role)}
                aria-label={`Delete ${role.name}`}
              >
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(role.permissions || {}).map(([resource, perms]) => {
              const activePerms = Object.entries(perms)
                .filter(([, value]) => value)
                .map(([key]) => key);
              if (activePerms.length === 0) return null;
              return (
                <Badge key={resource} variant="primary" size="small">
                  <span className="capitalize mr-1">{resource.replace(/_/g, ' ')}</span>
                  <span className="opacity-75">({activePerms.join(', ')})</span>
                </Badge>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
