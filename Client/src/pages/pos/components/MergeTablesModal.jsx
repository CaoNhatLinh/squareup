import { useState } from "react";
import { mergeTables } from "@/api/tables";
import useAppStore from '@/store/useAppStore';
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Label, Input, Checkbox, Dropdown } from "@/components/ui";
export default function MergeTablesModal({
  open,
  onOpenChange,
  tables,
  onSuccess,
}) {
  const restaurantId = useAppStore(s => s.restaurantId);
  const { success: showSuccess, error: showError } = useToast();
  const [selectedTables, setSelectedTables] = useState([]);
  const [targetTableId, setTargetTableId] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleToggleTable = (tableId, checked) => {
    setSelectedTables((prev) => {
      // If we receive an explicit boolean from the checkbox event
      if (typeof checked === "boolean") {
        return checked ? (prev.includes(tableId) ? prev : [...prev, tableId]) : prev.filter((id) => id !== tableId);
      }
      // fallback: toggle behavior
      return prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId];
    });
  };
  const handleMerge = async () => {
    if (selectedTables.length === 0) {
      showError("Please select at least one table to merge");
      return;
    }
    if (!targetTableId) {
      showError("Please select a target table");
      return;
    }
    if (selectedTables.includes(targetTableId)) {
      showError("Source tables cannot include the target table");
      return;
    }
    setIsSubmitting(true);
    try {
      const expectedMap = {};
      for (const id of [...selectedTables, targetTableId]) {
        const found = tables.find(t => t.id === id);
        expectedMap[id] = found?.updatedAt || 0;
      }
      await mergeTables(restaurantId, {
        sourceTableIds: selectedTables,
        targetTableId,
        newTableName: newTableName.trim() || undefined,
      }, { expectedUpdatedAt: expectedMap });
      showSuccess("Tables merged successfully");
      setSelectedTables([]);
      setTargetTableId("");
      setNewTableName("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to merge tables:", error);
      showError(error.response?.data?.error || "Failed to merge tables");
    } finally {
      setIsSubmitting(false);
    }
  };
  const availableTables = tables.filter((t) => t.status !== "deleted");
  const targetTable = availableTables.find((t) => t.id === targetTableId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Merge Tables</DialogTitle>
          <DialogDescription>
            Select tables to merge into a target table. All items will be
            combined.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Select Tables to Merge (Source)
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {availableTables.map((table) => (
                <div key={table.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`table-${table.id}`}
                    checked={selectedTables.includes(table.id)}
                    onChange={(e) => handleToggleTable(table.id, e.target.checked)}
                    disabled={table.id === targetTableId}
                    label={`${table.name} (${table.items?.length || 0} items)`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="targetTable" className="text-base font-semibold">
              Target Table (Keep This Table)
            </Label>
            <Dropdown
              id="targetTable"
              value={targetTableId}
              onChange={(v) => {
                setTargetTableId(v);
                setSelectedTables((prev) => prev.filter((id) => id !== v));
              }}
              placeholder="Select target table..."
              options={availableTables.filter(t => !selectedTables.includes(t.id)).map(t => ({ value: t.id, label: `${t.name} (${t.items?.length || 0} items)` }))}
            />
          </div>
          <div>
            <Label htmlFor="newTableName">
              New Table Name (Optional)
            </Label>
            <Input
              id="newTableName"
              type="text"
              placeholder={targetTable?.name || "Enter new name..."}
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="mt-2"
            />
          </div>
          {!selectedTables.length || !targetTableId ? (
            <p className="text-sm text-gray-500">Please select at least one source table and a target table to enable merging.</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={!selectedTables.length || !targetTableId || isSubmitting} title={!selectedTables.length || !targetTableId ? 'Select source and target tables to merge' : ''}>
            {isSubmitting ? "Merging..." : "Merge Tables"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
