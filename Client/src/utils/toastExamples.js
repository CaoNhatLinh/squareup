/**
 * Toast Usage Examples
 * 
 * Import the hook:
 * import { useToast } from '../../hooks/useToast';
 * 
 * In your component:
 * const { success, error, warning, info } = useToast();
 * 
 * Usage examples:
 * 
 * 1. Success notification:
 *    success("Order confirmed!");
 *    success("Item added to cart!", 5000); // Custom duration
 * 
 * 2. Error notification:
 *    error("Failed to load data. Please try again.");
 * 
 * 3. Warning notification:
 *    warning("Restaurant is currently closed.");
 * 
 * 4. Info notification:
 *    info("Your order is being prepared.");
 * 
 * All toast notifications:
 * - Auto-dismiss after 3 seconds (default) or custom duration
 * - Slide in from right with smooth animation
 * - Can be manually closed by clicking X button
 * - Color-coded by type (green/red/yellow/blue)
 * - Stacks vertically if multiple toasts
 * 
 * Examples in existing code:
 * - CheckoutSuccess.jsx - Shows success/error messages
 * - CartDrawer.jsx - Can add success("Item removed from cart")
 * - Orders.jsx - Can add success("Order status updated")
 */

export {};
