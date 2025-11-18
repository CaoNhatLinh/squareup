import { useState } from "react";
import { mergeTables } from "@/api/tables";
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function MergeTablesModal({
  open,
  onOpenChange,
  tables,
  restaurantId,
  onSuccess,
}) {
  const { success: showSuccess, error: showError } = useToast();
  const [selectedTables, setSelectedTables] = useState([]);
  const [targetTableId, setTargetTableId] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleTable = (tableId) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
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
      await mergeTables(restaurantId, {
        sourceTableIds: selectedTables,
        targetTableId,
        newTableName: newTableName.trim() || undefined,
      });

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
          {/* Select tables to merge */}
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
                    onCheckedChange={() => handleToggleTable(table.id)}
                    disabled={table.id === targetTableId}
                  />
                  <label
                    htmlFor={`table-${table.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {table.name} ({table.items?.length || 0} items)
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Select target table */}
          <div>
            <Label htmlFor="targetTable" className="text-base font-semibold">
              Target Table (Keep This Table)
            </Label>
            <select
              id="targetTable"
              className="w-full mt-2 p-2 border rounded-md"
              value={targetTableId}
              onChange={(e) => setTargetTableId(e.target.value)}
            >
              <option value="">Select target table...</option>
              {availableTables.map((table) => (
                <option
                  key={table.id}
                  value={table.id}
                  disabled={selectedTables.includes(table.id)}
                >
                  {table.name} ({table.items?.length || 0} items)
                </option>
              ))}
            </select>
          </div>

          {/* New table name (optional) */}
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={isSubmitting}>
            {isSubmitting ? "Merging..." : "Merge Tables"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
