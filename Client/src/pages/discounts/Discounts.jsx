import { useState, useEffect } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { HiPlus, HiTag } from "react-icons/hi2";
import { useToast } from "@/hooks/useToast";
import { fetchDiscounts, deleteDiscount } from "@/api/discounts.js";
import SearchBar from "@/components/common/SearchBar";
import ActionMenu from "@/components/common/ActionMenu";

export default function Discounts() {
  const { restaurantId } = useParams();
  const loaderData = useLoaderData();
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [discounts, setDiscounts] = useState(loaderData?.discounts || []);
  const [discountMenus, setDiscountMenus] = useState({});

  useEffect(() => {
    if (loaderData?.discounts) {
      setDiscounts(loaderData.discounts);
    }
  }, [loaderData]);

  const loadDiscounts = async () => {
    try {
      const data = await fetchDiscounts(restaurantId);
      setDiscounts(Object.values(data || {}));
    } catch (err) {
      console.error("Failed to load discounts:", err);
      error("Failed to load discounts");
    }
  };
  const handleDelete = async (discountId, discountName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete discount "${discountName}"?`
      )
    )
      return;

    try {
      await deleteDiscount(restaurantId, discountId);
      success(`Discount "${discountName}" deleted successfully!`);
      loadDiscounts();
    } catch (err) {
      console.error("Failed to delete discount:", err);
      error("Failed to delete discount");
    }
  };

  const filteredDiscounts = discounts.filter((discount) =>
    discount.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAmountDisplay = (discount) => {
    if (discount.amountType === "percentage") {
      return `${discount.amount}%`;
    } else if (discount.amountType === "fixed") {
      return `₫${discount.amount}`;
    } else if (discount.amountType === "variable_amount") {
      return "Variable amount";
    } else if (discount.amountType === "variable_percentage") {
      return "Variable %";
    }
    return "-";
  };

  return (
    <div className="p-8 pb-24 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <HiTag className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl font-extrabold text-gray-900">Discounts</h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search discounts..."
            className="w-72"
          />
          <Link
            to={`/${restaurantId}/discounts/new`}
            className="px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <HiPlus className="w-5 h-5" /> Create Discount
          </Link>
        </div>
      </div>

      {filteredDiscounts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <HiTag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No discounts yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first discount to start offering promotions to your
            customers.
          </p>
          <Link
            to={`/${restaurantId}/discounts/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            <HiPlus className="w-5 h-5" /> Create Your First Discount
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Discount Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Automatic
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDiscounts.map((discount) => (
                <tr
                  key={discount.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {discount.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 capitalize">
                    {discount.amountType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {getAmountDisplay(discount)}
                  </td>
                  <td className="px-6 py-4">
                    {discount.automaticDiscount ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Active
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 w-16"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      <ActionMenu
                        isOpen={discountMenus[discount.id]}
                        onToggle={(open) =>
                          setDiscountMenus({ ...discountMenus, [discount.id]: open })
                        }
                        editPath={`/${restaurantId}/discounts/${discount.id}/edit`}
                        onDelete={() => handleDelete(discount.id, discount.name)}
                        itemName={discount.name}
                      />
                    </div>
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
