import FieldRenderer from "@/components/builder/ui/FieldRenderer";
import { Card } from "@/components/ui/Card";

function shouldShowGroupFields(groupEntry, activeControl, hasActiveGroupElement, forceShowGroupElements = false) {
  if (forceShowGroupElements && groupEntry.isGroupElement) return true;
  if (groupEntry.isGroupElement === false) {
    return !hasActiveGroupElement || (activeControl && groupEntry.highlightControlId === activeControl.controlId);
  }
  if (!activeControl) return !groupEntry.highlightControlId && !groupEntry.elementSchema;
  if (groupEntry.highlightControlId === activeControl.controlId) return true;
  if (groupEntry.elementSchema && activeControl.controlId.startsWith(groupEntry.elementSchema.controlIdPrefix)) return true;
  if (groupEntry.highlightControlId || groupEntry.elementSchema) return false;
  return true;
}

export default function SchemaRenderer({
  schema,
  data,
  onChange,
  globalStyles,
  excludeFields = [],
  activeControl,
  forceShowGroupElements = false,
  setActiveControl,
  selectedSection,
}) {

  const hasActiveGroupElement = activeControl && schema.some(entry =>
    entry.isGroupElement && (
      entry.highlightControlId === activeControl.controlId ||
      (entry.elementSchema && activeControl.controlId.startsWith(entry.elementSchema.controlIdPrefix))
    )
  );

  return (
    <div className="space-y-4">
      {schema.map((entry, index) => {
        if (excludeFields.includes(entry.name)) return null;

        if (entry.group) {
          const showFields = shouldShowGroupFields(entry, activeControl, hasActiveGroupElement, forceShowGroupElements);
          const visibleFields = (entry.fields || []).filter(f => !excludeFields.includes(f.name));
          if (!visibleFields.length) return null;
          if (!showFields) return null;

          return (
            <Card
              key={entry.group + index}
              className="hover:border-red-300 transition-colors"
              padding="small"
            >
              <h4
                className="text-sm font-semibold mb-3 cursor-pointer select-none hover:text-red-600 transition-colors"
                onClick={() => {
                  if (setActiveControl && entry.highlightControlId) {
                    setActiveControl({
                      blockId: selectedSection === 'header' ? 'HEADER' : selectedSection === 'footer' ? 'FOOTER' : null,
                      controlId: entry.highlightControlId
                    });
                  }
                }}
              >
                {entry.group}
              </h4>

              {showFields && (
                <FieldRenderer
                  fields={visibleFields}
                  data={data}
                  onChange={onChange}
                  globalStyles={globalStyles}
                  excludeFields={[]}
                />
              )}
            </Card>
          );
        }

        return (
          <FieldRenderer
            key={entry.name || index}
            fields={[entry]}
            data={data}
            onChange={onChange}
            globalStyles={globalStyles}
          />
        );
      })}
    </div>
  );
}
