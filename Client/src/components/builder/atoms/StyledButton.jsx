export default function StyledButton({
  children,
  onClick,
  styleConfig = {},
  className = "",
  style = {},
  dataControl,
  dataBlockId,
  isCircle,
  buttonIcon,
  icon,
  ...rest
}) {
  
  const {
    style: btnType = "filled",
    color = "#F97316",
    textColor: customTextColor,
    radius,
    size = "md",
    shadow = true,
    circle = false
  } = styleConfig;

  const finalIsCircle = isCircle !== undefined ? isCircle : circle;
  const finalButtonIcon = buttonIcon !== undefined ? buttonIcon : true; 

  const isFilled = ["filled", "circle", "pill"].includes(btnType);
  const finalTextColor = customTextColor || (isFilled ? "#ffffff" : color);

  const baseClasses = [
    "inline-flex items-center justify-center",
    "font-semibold tracking-wide",
    "transition-all duration-200 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "active:scale-95",
    "border-2",
  ].join(" ");

  const sizeClasses = finalIsCircle
    ? ""
    : {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
      }[size] || "px-5 py-2.5 text-sm";

  let shapeClass = finalIsCircle ? "rounded-full" : "";
 
  let variantClass = "";
  if (shadow && btnType !== "text") {
    variantClass += " shadow-md hover:shadow-lg hover:-translate-y-0.5";
  }

  if (btnType === "text")
    variantClass += " border-transparent hover:bg-gray-50";
  else if (btnType === "outline")
    variantClass += " bg-transparent hover:bg-opacity-5";
  else variantClass += " border-transparent";

  const computedStyle = {
    "--tw-ring-color": color,
    color: finalTextColor,
    cursor: "pointer",
  };

  if (radius && !finalIsCircle) computedStyle.borderRadius = `${radius}px`;

  if (finalIsCircle) {
    computedStyle.width = "40px";
    computedStyle.height = "40px";
    computedStyle.padding = "0";
  }

  if (isFilled) {
    computedStyle.backgroundColor = color;
    if (/^#([0-9A-F]{6})$/i.test(color)) {
      computedStyle.backgroundImage = `linear-gradient(180deg, ${color}, ${shadeColor(
        color,
        -10
      )})`;
    }
    computedStyle.borderColor = "transparent";
  } else {
    computedStyle.backgroundColor = "transparent";
    computedStyle.borderColor = btnType === "outline" ? color : "transparent";
  }

  const finalStyle = { ...computedStyle, ...style };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses} ${shapeClass} ${variantClass} ${className}`}
      style={finalStyle}
      data-control={dataControl}
      data-block-id={dataBlockId}
      {...rest}
    >
      {finalButtonIcon && icon}
      {children}
    </button>
  );
}


function shadeColor(hex, percent) {
  try {
    const f = parseInt(hex.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff;
    return (
      "#" +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    );
  } catch {
    return hex;
  }
}
