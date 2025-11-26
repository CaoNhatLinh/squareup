export default function SettingsGroup({ title, description, children }) {
  return (
    <div className="p-4 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}
