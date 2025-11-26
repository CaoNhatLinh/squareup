function TabButton({ name, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap transition-all ${
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
      }`}
    >
      {name}
    </button>
  );
}

export default TabButton;
