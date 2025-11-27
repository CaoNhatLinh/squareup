import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import useAppStore from '@/store/useAppStore';
import { useToast } from '@/hooks/useToast';
import { fetchDiscount, updateDiscount } from '@/api/discounts';
import { fetchAllCategories } from '@/api/categories';
import { fetchAllItems } from '@/api/items';
import { HiXMark, HiCurrencyDollar, HiClock, HiCalendar, HiTag, HiShoppingCart, HiGift, HiSparkles, HiCheck } from 'react-icons/hi2';
import { MdPercent } from "react-icons/md";
import { Button, Input, Dropdown, Checkbox, LoadingSpinner } from '@/components/ui';
import { DAYS_OF_WEEK } from '@/constants/scheduleConstants';
export default function EditDiscount() {
  const navigate = useNavigate();
  const { discountId } = useParams();
  const restaurantId = useAppStore(s => s.restaurantId);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    amountType: 'percentage',
    amount: '',
    automaticDiscount: false,
    discountApplyTo: '',
    quantityRuleType: 'exact',
    purchaseQuantity: 2,
    discountQuantity: 1,
    purchaseCategories: [],
    purchaseItems: [],
    addAllItemsToPurchase: false,
    discountTargetCategories: [],
    discountTargetItems: [],
    addAllItemsToDiscount: false,
    copyEligibleItems: false,
    setSchedule: false,
    scheduleDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    scheduleTimeStart: '09:00',
    scheduleTimeEnd: '17:00',
    setDateRange: false,
    dateRangeStart: '',
    dateRangeEnd: '',
    timeRangeStart: '00:00',
    timeRangeEnd: '23:59',
    setMinimumSpend: false,
    minimumSubtotal: 0,
    setMaximumValue: false,
    maximumValue: 0,
  });

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [showDiscountTypeModal, setShowDiscountTypeModal] = useState(false);
  const [showPurchaseRuleModal, setShowPurchaseRuleModal] = useState(false);
  const [showItemCategorySelector, setShowItemCategorySelector] = useState(false);
  const [selectorMode, setSelectorMode] = useState('purchase'); 
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurantId && discountId) {
      Promise.all([
        fetchDiscount(restaurantId, discountId),
        fetchAllCategories(restaurantId),
        fetchAllItems(restaurantId)
      ]).then(([discountData, categoriesData, itemsData]) => {
        setFormData(discountData);
          setCategories(categoriesData?.categories || categoriesData || []);
          setItems(itemsData?.items || itemsData || []);
      }).catch(err => {
        console.error('Error loading data:', err);
        error('Failed to load discount data');
      }).finally(() => setLoading(false));
    }
  }, [restaurantId, discountId, error]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      error('Discount name is required');
      return;
    }
    
    if (!formData.amount && formData.amountType !== 'variable_amount' && formData.amountType !== 'variable_percentage') {
      error('Discount amount is required');
      return;
    }

    setSaving(true);
    try {
      await updateDiscount(restaurantId, discountId, formData);
      success(`Discount "${formData.name}" updated successfully!`);
      navigate(`/restaurant/discounts`);
    } catch (err) {
      console.error('Failed to update discount:', err);
      error('Failed to update discount: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const amountTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Amount (₫)' },
    { value: 'variable_amount', label: 'Variable amount (₫)' },
    { value: 'variable_percentage', label: 'Variable percentage (%)' },
  ];

  const renderAmountTypeDropdown = () => (
    <Dropdown
      label="Amount type"
      options={amountTypeOptions}
      value={formData.amountType}
      onChange={(val) => setFormData({ ...formData, amountType: val })}
    />
  );

  const renderAmountInput = () => {
    if (formData.amountType === 'variable_amount' || formData.amountType === 'variable_percentage') {
      return (
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <HiTag className="w-5 h-5 inline mr-2 text-blue-600" />
          Amount will be entered at the time of transaction
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {formData.amountType === 'percentage' ? 'Percentage' : 'Amount'}
        </label>
        <div className="relative">
          {formData.amountType === 'percentage' && (
            <MdPercent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          )}
          {formData.amountType === 'fixed' && (
            <HiCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          )}
          <Input
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            leftIcon={formData.amountType === 'percentage' ? MdPercent : (formData.amountType === 'fixed' ? HiCurrencyDollar : null)}
            className="pl-10"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner.Overlay message="Loading discount data..." />;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl my-8 rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Edit Discount</h2>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="medium" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" size="medium" onClick={handleSave} loading={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-4">
            <Input label="Name" placeholder="Name (required)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-lg font-semibold" />
            
            <div className="grid grid-cols-2 gap-4">
              {renderAmountTypeDropdown()}
              {renderAmountInput()}
            </div>
          </div>

          <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <HiSparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">Automatic Discount</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.automaticDiscount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked && !formData.discountApplyTo) {
                          setShowDiscountTypeModal(true);
                        }
                        setFormData({ ...formData, automaticDiscount: checked });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  🎯 <strong>Smart Promotions:</strong> Set up rules to automatically apply discounts based on purchase conditions like quantity, specific items, or categories. Perfect for "Buy 2 Get 1 Free" or category-specific deals!
                </p>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-semibold text-blue-900">⚠️ Important Rules:</p>
                  <p className="text-blue-800">
                    • <strong>No stacking:</strong> If multiple automatic discounts apply, only the <strong>greater discount</strong> will be used.
                  </p>
                  
                </div>
              </div>
            </div>

            {formData.automaticDiscount && (
              <div className="space-y-4 mt-6 pt-6 border-t-2 border-blue-200">
                {!formData.discountApplyTo ? (
                  <div className="text-center py-8">
                    <HiSparkles className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Choose how to apply automatic discount</p>
                    <Button variant="primary" size="medium" onClick={() => setShowDiscountTypeModal(true)}>Select Discount Type</Button>
                  </div>
                ) : formData.discountApplyTo === 'item_category' ? (
                  <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 hover:border-purple-400 transition-all">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <HiTag className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-gray-900">Item or Category</h4>
                            <p className="text-xs text-gray-600">Apply to specific items or categories</p>
                          </div>
                        </div>
                        <Button variant="link" size="small" onClick={() => setFormData({ ...formData, discountApplyTo: '', purchaseCategories: [], purchaseItems: [], addAllItemsToPurchase: false })} className="text-red-600">Change Type</Button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        {formData.addAllItemsToPurchase ? (
                          <p className="text-sm text-gray-700 font-medium">
                            <HiCheck className="w-4 h-4 inline text-green-600 mr-1" />
                            All items included
                          </p>
                        ) : (formData.purchaseCategories?.length > 0 || formData.purchaseItems?.length > 0) ? (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Selected:</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.purchaseCategories?.map((cat) => (
                                <span key={cat.id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                  📁 {cat.name}
                                  <Button variant="ghost" size="small" onClick={() => setFormData({ ...formData, purchaseCategories: formData.purchaseCategories.filter(c => c.id !== cat.id) })} icon={HiXMark} className="p-1" />
                                </span>
                              ))}
                              {formData.purchaseItems?.map((item) => (
                                <span key={item.id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  🍽️ {item.name}
                                  <Button variant="ghost" size="small" onClick={() => setFormData({ ...formData, purchaseItems: formData.purchaseItems.filter(i => i.id !== item.id) })} icon={HiXMark} className="p-1" />
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No items selected</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Button variant="primary" size="medium" onClick={() => { setShowItemCategorySelector(true); setSelectorMode('purchase'); }} className="flex-1">Select Items/Categories</Button>
                        <Checkbox checked={formData.addAllItemsToPurchase || false} onChange={(e) => setFormData({ ...formData, addAllItemsToPurchase: e.target.checked })} label="Add all items" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 hover:border-green-400 transition-all">
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <HiShoppingCart className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-gray-900">Quantity</h4>
                              <p className="text-xs text-gray-600">Apply when a number of items are purchased</p>
                            </div>
                          </div>
                          <Button variant="link" size="small" onClick={() => setFormData({ ...formData, discountApplyTo: '', quantityRuleType: 'exact', purchaseQuantity: 2, discountQuantity: 1, purchaseCategories: [], purchaseItems: [], addAllItemsToPurchase: false, discountTargetCategories: [], discountTargetItems: [], addAllItemsToDiscount: false, copyEligibleItems: false })} className="text-red-600">Change Type</Button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-3 space-y-3">
                          <div>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Rule Type:</strong> {
                                formData.quantityRuleType === 'exact' ? '📊 Exact Quantity' :
                                formData.quantityRuleType === 'minimum' ? '⬆️ Minimum Quantity' :
                                '🎁 Buy One Get One (BOGO)'
                              }
                            </p>
                            <Button variant="link" size="small" onClick={() => setShowPurchaseRuleModal(true)} className="text-blue-600">Change rule type</Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                {formData.quantityRuleType === 'bogo' ? 'Buy Quantity' : 
                                 formData.quantityRuleType === 'exact' ? 'Exact Quantity' : 
                                 'Minimum Quantity'}
                              </label>
                              <Input type="number" min={1} value={formData.purchaseQuantity} onChange={(e) => setFormData({ ...formData, purchaseQuantity: parseInt(e.target.value) || 1 })} className="w-full" />
                            </div>
                            {formData.quantityRuleType === 'bogo' && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Get Quantity</label>
                                <Input type="number" min={1} value={formData.discountQuantity} onChange={(e) => setFormData({ ...formData, discountQuantity: parseInt(e.target.value) || 1 })} className="w-full" />
                              </div>
                            )}
                          </div>

                          {formData.addAllItemsToPurchase ? (
                            <p className="text-sm text-gray-700 font-medium">
                              <HiCheck className="w-4 h-4 inline text-green-600 mr-1" />
                              All items included
                            </p>
                          ) : (formData.purchaseCategories?.length > 0 || formData.purchaseItems?.length > 0) ? (
                            <div className="flex flex-wrap gap-2">
                              {formData.purchaseCategories?.map((cat) => (
                                <span key={cat.id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                  📁 {cat.name}
                                  <button
                                    onClick={() => setFormData({
                                      ...formData,
                                      purchaseCategories: formData.purchaseCategories.filter(c => c.id !== cat.id)
                                    })}
                                    className="hover:text-purple-900"
                                  >
                                    <HiXMark className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              {formData.purchaseItems?.map((item) => (
                                <span key={item.id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  🍽️ {item.name}
                                  <button
                                    onClick={() => setFormData({
                                      ...formData,
                                      purchaseItems: formData.purchaseItems.filter(i => i.id !== item.id)
                                    })}
                                    className="hover:text-blue-900"
                                  >
                                    <HiXMark className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No items selected</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <Button variant="success" size="medium" onClick={() => { setShowItemCategorySelector(true); setSelectorMode('purchase'); }} className="flex-1">Select Items/Categories</Button>
                            <Checkbox checked={formData.addAllItemsToPurchase || false} onChange={(e) => setFormData({ ...formData, addAllItemsToPurchase: e.target.checked })} label="Add all items" />
                        </div>
                      </div>
                    </div>

                    {formData.quantityRuleType === 'bogo' && (
                      <div className="bg-white rounded-xl shadow-sm border-2 border-orange-200 hover:border-orange-400 transition-all">
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <HiGift className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-gray-900">Discount Applies To</h4>
                              <p className="text-xs text-gray-600">Which items get the discount?</p>
                              <p className="text-xs text-orange-700 font-medium mt-1">
                                ⚖️ BOGO Rule: Discount applies to item with <strong>equal or lesser value</strong>
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            {formData.copyEligibleItems ? (
                              <p className="text-sm text-gray-700 font-medium">
                                <HiCheck className="w-4 h-4 inline text-green-600 mr-1" />
                                Same items as purchase requirement (Classic BOGO)
                              </p>
                            ) : formData.addAllItemsToDiscount ? (
                              <p className="text-sm text-gray-700 font-medium">
                                <HiCheck className="w-4 h-4 inline text-green-600 mr-1" />
                                All items included
                              </p>
                            ) : (formData.discountTargetCategories?.length > 0 || formData.discountTargetItems?.length > 0) ? (
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">Selected:</p>
                                <div className="flex flex-wrap gap-2">
                                  {formData.discountTargetCategories?.map((cat) => (
                                    <span key={cat.id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                      📁 {cat.name}
                                      <Button variant="ghost" size="small" onClick={() => setFormData({ ...formData, discountTargetCategories: formData.discountTargetCategories.filter(c => c.id !== cat.id) })} icon={HiXMark} className="p-1" />
                                    </span>
                                  ))}
                                  {formData.discountTargetItems?.map((item) => (
                                    <span key={item.id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                      🍽️ {item.name}
                                      <Button variant="ghost" size="small" onClick={() => setFormData({ ...formData, discountTargetItems: formData.discountTargetItems.filter(i => i.id !== item.id) })} icon={HiXMark} className="p-1" />
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No items selected</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Button variant={formData.copyEligibleItems ? 'success' : 'secondary'} size="medium" onClick={() => setFormData({ ...formData, copyEligibleItems: !formData.copyEligibleItems })} className="w-full">{formData.copyEligibleItems ? '✓ Copy eligible items' : 'Copy eligible items'}</Button>
                            <div className="flex items-center justify-between gap-3">
                              <button
                                onClick={() => {
                                  setShowItemCategorySelector(true);
                                  setSelectorMode('discount');
                                }}
                                disabled={formData.copyEligibleItems}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Select Different Items
                              </button>
                              <Checkbox checked={formData.addAllItemsToDiscount || false} onChange={(e) => setFormData({ ...formData, addAllItemsToDiscount: e.target.checked })} label="Add all items" disabled={formData.copyEligibleItems} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="border border-gray-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox checked={formData.setSchedule} onChange={(e) => setFormData({ ...formData, setSchedule: e.target.checked })} label="" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <HiClock className="w-5 h-5 text-red-600" />
                  Set schedule
                </h3>
                <p className="text-sm text-gray-600">Set the days of the week and times of day this discount is available. (Example: Happy Hour)</p>
              </div>
            </div>

            {formData.setSchedule && (
              <div className="space-y-3 mt-4 border-t border-gray-200 pt-4">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    <Checkbox checked={formData.scheduleDays[day]} onChange={(e) => setFormData({ ...formData, scheduleDays: { ...formData.scheduleDays, [day]: e.target.checked } })} label="" />
                    <span className="w-24 capitalize font-medium text-gray-700">{day}</span>
                    <Input type="time" value={formData.scheduleTimeStart} onChange={(e) => setFormData({ ...formData, scheduleTimeStart: e.target.value })} disabled={!formData.scheduleDays[day]} className="px-3 py-2" />
                    <span className="text-gray-500">to</span>
                    <Input type="time" value={formData.scheduleTimeEnd} onChange={(e) => setFormData({ ...formData, scheduleTimeEnd: e.target.value })} disabled={!formData.scheduleDays[day]} className="px-3 py-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox checked={formData.setDateRange} onChange={(e) => setFormData({ ...formData, setDateRange: e.target.checked })} label="" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <HiCalendar className="w-5 h-5 text-red-600" />
                  Set date range
                </h3>
                <p className="text-sm text-gray-600">Set the dates this discount is available. (Example: Seasonal Sale)</p>
              </div>
            </div>

            {formData.setDateRange && (
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                  <Input type="date" value={formData.dateRangeStart} onChange={(e) => setFormData({ ...formData, dateRangeStart: e.target.value })} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">End Date</label>
                  <Input type="date" value={formData.dateRangeEnd} onChange={(e) => setFormData({ ...formData, dateRangeEnd: e.target.value })} className="w-full" />
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox checked={formData.setMinimumSpend} onChange={(e) => setFormData({ ...formData, setMinimumSpend: e.target.checked })} label="" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Set minimum spend</h3>
                <p className="text-sm text-gray-600">Require a minimum subtotal to qualify for discount (Example: Buy at least $50 and get $10 off)</p>
              </div>
            </div>

            {formData.setMinimumSpend && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum subtotal</label>
                <Input type="number" placeholder="40" value={formData.minimumSubtotal} onChange={(e) => setFormData({ ...formData, minimumSubtotal: parseFloat(e.target.value) || 0 })} />
              </div>
            )}
          </div>
          <div className="border border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
              <Checkbox checked={formData.setMaximumValue} onChange={(e) => setFormData({ ...formData, setMaximumValue: e.target.checked })} label="" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Set maximum discount value</h3>
                <p className="text-sm text-gray-600">Set the maximum discount value per purchase</p>
              </div>
            </div>

            {formData.setMaximumValue && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum value</label>
                <Input type="number" placeholder="40" value={formData.maximumValue} onChange={(e) => setFormData({ ...formData, maximumValue: parseFloat(e.target.value) || 0 })} />
                <p className="text-xs text-gray-500 mt-2">Maximum discount value can only apply to percentage-based discounts.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDiscountTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Choose how to apply discount</h3>
              <Button variant="ghost" size="small" onClick={() => setShowDiscountTypeModal(false)} icon={HiXMark} className="p-2" />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, discountApplyTo: 'item_category' });
                  setShowDiscountTypeModal(false);
                }}
                className={`w-full text-left p-5 border-2 rounded-xl hover:border-purple-500 transition-colors ${
                  formData.discountApplyTo === 'item_category' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <HiTag className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Item or category</h4>
                    <p className="text-sm text-gray-600">Apply to specific items or categories. (Ex: Holiday items)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setFormData({ ...formData, discountApplyTo: 'quantity' });
                  setShowDiscountTypeModal(false);
                }}
                className={`w-full text-left p-5 border-2 rounded-xl hover:border-green-500 transition-colors ${
                  formData.discountApplyTo === 'quantity' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <HiShoppingCart className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Quantity</h4>
                    <p className="text-sm text-gray-600">Apply when a number of items are purchased. (Ex: Buy one, get one)</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {showPurchaseRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Choose a discount type</h3>
              <Button variant="ghost" size="small" onClick={() => setShowPurchaseRuleModal(false)} icon={HiXMark} className="p-2" />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, quantityRuleType: 'exact' });
                  setShowPurchaseRuleModal(false);
                }}
                className={`w-full text-left p-4 border-2 rounded-xl hover:border-red-500 transition-colors ${
                  formData.quantityRuleType === 'exact' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                <h4 className="font-semibold">📊 Exact quantity</h4>
                <p className="text-sm text-gray-600">Apply discount to exact quantity of eligible items.</p>
              </button>

              <button
                onClick={() => {
                  setFormData({ ...formData, quantityRuleType: 'minimum' });
                  setShowPurchaseRuleModal(false);
                }}
                className={`w-full text-left p-4 border-2 rounded-xl hover:border-red-500 transition-colors ${
                  formData.quantityRuleType === 'minimum' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                <h4 className="font-semibold">⬆️ Minimum quantity</h4>
                <p className="text-sm text-gray-600">Apply discount to eligible items when a minimum quantity is met.</p>
              </button>

              <button
                onClick={() => {
                  setFormData({ ...formData, quantityRuleType: 'bogo' });
                  setShowPurchaseRuleModal(false);
                }}
                className={`w-full text-left p-4 border-2 rounded-xl hover:border-red-500 transition-colors ${
                  formData.quantityRuleType === 'bogo' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                <h4 className="font-semibold">🎁 Buy one, get one</h4>
                <p className="text-sm text-gray-600">Apply discount to an additional item of equal or lesser value.</p>
                <p className="text-xs text-orange-700 font-medium mt-2">
                  ⚖️ Example: Buy coffee ₫70k + ₫50k → Discount applies to ₫50k item (lesser value)
                </p>
              </button>
            </div>

            <Button variant="secondary" size="medium" onClick={() => setShowPurchaseRuleModal(false)} className="mt-6 w-full">Done</Button>
          </div>
        </div>
      )}

      {showItemCategorySelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Select Items & Categories {selectorMode === 'purchase' ? '(Purchase Requirements)' : '(Discount Target)'}
              </h3>
              <Button variant="ghost" size="small" onClick={() => setShowItemCategorySelector(false)} icon={HiXMark} className="p-2" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📁 Categories ({categories.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectorMode === 'purchase'
                      ? formData.purchaseCategories?.some(c => c.id === cat.id)
                      : formData.discountTargetCategories?.some(c => c.id === cat.id);
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          if (selectorMode === 'purchase') {
                            const current = formData.purchaseCategories || [];
                            const updated = isSelected
                              ? current.filter(c => c.id !== cat.id)
                              : [...current, cat];
                            setFormData({ ...formData, purchaseCategories: updated });
                          } else {
                            const current = formData.discountTargetCategories || [];
                            const updated = isSelected
                              ? current.filter(c => c.id !== cat.id)
                              : [...current, cat];
                            setFormData({ ...formData, discountTargetCategories: updated });
                          }
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{cat.name}</span>
                          {isSelected && <HiCheck className="w-5 h-5 text-purple-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  🍽️ Items ({items.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                    const isSelected = selectorMode === 'purchase'
                      ? formData.purchaseItems?.some(i => i.id === item.id)
                      : formData.discountTargetItems?.some(i => i.id === item.id);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (selectorMode === 'purchase') {
                            const current = formData.purchaseItems || [];
                            const updated = isSelected
                              ? current.filter(i => i.id !== item.id)
                              : [...current, item];
                            setFormData({ ...formData, purchaseItems: updated });
                          } else {
                            const current = formData.discountTargetItems || [];
                            const updated = isSelected
                              ? current.filter(i => i.id !== item.id)
                              : [...current, item];
                            setFormData({ ...formData, discountTargetItems: updated });
                          }
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm block">{item.name}</span>
                            <span className="text-xs text-gray-500">₫{item.price}</span>
                          </div>
                          {isSelected && <HiCheck className="w-5 h-5 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Selected: {selectorMode === 'purchase'
                  ? (formData.purchaseCategories?.length || 0) + (formData.purchaseItems?.length || 0)
                  : (formData.discountTargetCategories?.length || 0) + (formData.discountTargetItems?.length || 0)} items
              </div>
              <Button variant="primary" size="medium" onClick={() => setShowItemCategorySelector(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
