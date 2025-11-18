import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { getTables, deleteTable } from "@/api/tables";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Plus, Users, Printer, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { printKitchenOrder } from "@/utils/printUtils";
import MergeTablesModal from "./components/MergeTablesModal";

export default function TableListPage() {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // Load tables
  const loadTables = async () => {
    if (!restaurant?.id) return;
    
    setLoading(true);
    try {
      const data = await getTables(restaurant.id);
      setTables(data);
    } catch (error) {
      console.error("Failed to load tables:", error);
      showError("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);

  // Handle create new table
  const handleCreateTable = () => {
    navigate(`/pos/table/new`);
  };

  // Handle open table
  const handleOpenTable = (tableId) => {
    navigate(`/pos/table/${tableId}`);
  };

  // Handle delete table
  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tableToDelete) return;

    try {
      await deleteTable(restaurant.id, tableToDelete.id);
      showSuccess("Table deleted successfully");
      loadTables();
    } catch (error) {
      console.error("Failed to delete table:", error);
      showError(error.response?.data?.error || "Failed to delete table");
    } finally {
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  // Handle print kitchen order
  const handlePrintKitchenOrder = (table) => {
    if (!table.items || table.items.length === 0) {
      showError("No items to print");
      return;
    }

    try {
      printKitchenOrder({
        tableName: table.name,
        items: table.items,
        restaurantName: restaurant.name,
      });
      showSuccess("Kitchen order sent to printer");
    } catch (error) {
      console.error("Failed to print kitchen order:", error);
      showError("Failed to print kitchen order");
    }
  };

  // Calculate table total
  const calculateTableTotal = (table) => {
    if (!table.items || table.items.length === 0) return 0;

    return table.items.reduce((total, item) => {
      const basePrice = item.price * item.quantity;
      const modifiersPrice = (item.selectedModifiers || []).reduce(
        (sum, mod) => sum + (mod.price || 0) * item.quantity,
        0
      );
      return total + basePrice + modifiersPrice;
    }, 0);
  };

  // Get table status badge
  const getStatusBadge = (table) => {
    const hasItems = table.items && table.items.length > 0;
    
    if (!hasItems) {
      return <Badge variant="outline">Available</Badge>;
    }
    
    return <Badge variant="default">Occupied</Badge>;
  };

  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="text-gray-600 mt-1">Manage restaurant tables</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setMergeModalOpen(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Merge Tables
          </Button>
          <Button onClick={handleCreateTable}>
            <Plus className="h-4 w-4 mr-2" />
            Create Table
          </Button>
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tables yet</p>
          <Button onClick={handleCreateTable}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Table
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
            const total = calculateTableTotal(table);
            const itemCount = table.items?.length || 0;

            return (
              <Card
                key={table.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOpenTable(table.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{table.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {getStatusBadge(table)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintKitchenOrder(table);
                          }}
                          disabled={itemCount === 0}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Kitchen Order
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(table);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Table
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{itemCount}</span>
                    </div>
                    {itemCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">
                          ${(total / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Table"
        description={`Are you sure you want to delete "${tableToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />

      {/* Merge Tables Modal */}
      <MergeTablesModal
        open={mergeModalOpen}
        onOpenChange={setMergeModalOpen}
        tables={tables}
        restaurantId={restaurant?.id}
        onSuccess={loadTables}
      />
    </div>
  );
}
