import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";
import { useOrderNotification } from "@/hooks/useOrderNotification";

export default function MenuItem({ item, level = 0 }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  const { newOrderIds } = useOrderNotification(); 
  const hasActiveChild = React.useMemo(() => {
    if (!item.children) return false;
    const checkActive = (children) => {
      return children.some((child) => {
        if (child.to && location.pathname.startsWith(child.to)) return true;
        if (child.children) return checkActive(child.children);
        return false;
      });
    };
    return checkActive(item.children);
  }, [item.children, location.pathname]); 
  React.useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true);
    }
  }, [hasActiveChild]);
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = `${(level + 1) * 16}px`;
  if (!hasChildren && item.to) {
    const showBadge = item.badge && newOrderIds.length > 0;
    return (
      <NavLink
        to={item.to}
        onClick={item.onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
        style={{ paddingLeft }}
      >
        {Icon && (
          <Icon
            className={`w-5 h-5 flex-shrink-0 ${
              item.to && location.pathname.startsWith(item.to)
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          />
        )}
        <span className="flex-1">{item.label}</span>
        {showBadge && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-red-500 text-white rounded-full">
            {newOrderIds.length}
          </span>
        )}
      </NavLink>
    );
  }
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            hasActiveChild
              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
          style={{ paddingLeft }}
        >
          {Icon && (
            <Icon
              className={`w-5 h-5 flex-shrink-0 ${
                hasActiveChild ? "text-blue-600" : "text-gray-400"
              }`}
            />
          )}
          <span className="flex-1 text-left">{item.label}</span>
          <HiChevronRight
            className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 text-gray-400 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </button>
        {expanded && (
          <div className="mt-2 ml-4 space-y-1">
            {item.children.map((child, idx) => (
              <MenuItem key={idx} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}
