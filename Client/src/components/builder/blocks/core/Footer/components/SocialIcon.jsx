import { resolveColor } from '@/components/builder/utils/colorUtils';

const SocialIcon = ({ social, idx, cfg, globalStyles, resolvedTextColor, blockId }) => {
  const iconStyle = {
    fontSize: `${cfg.socialLinksStyle?.iconSize || 20}px`,
    color: resolveColor(cfg.socialLinksStyle?.color || resolvedTextColor, globalStyles) || resolvedTextColor,
    backgroundColor: cfg.socialLinksStyle?.backgroundColor
      ? resolveColor(cfg.socialLinksStyle.backgroundColor, globalStyles)
      : "transparent",
    borderRadius: `${cfg.socialLinksStyle?.borderRadius || 0}px`,
    padding: cfg.socialLinksStyle?.backgroundColor ? "8px" : "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const handleMouseEnter = (e) => {
    if (cfg.socialLinksStyle?.hoverColor) {
      e.currentTarget.style.color = resolveColor(cfg.socialLinksStyle.hoverColor, globalStyles) || resolvedTextColor;
      const svg = e.currentTarget.querySelector('svg');
      if (svg) {
        svg.style.color = resolveColor(cfg.socialLinksStyle.hoverColor, globalStyles) || resolvedTextColor;
      }
    }
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.color = iconStyle.color;
    const svg = e.currentTarget.querySelector('svg');
    if (svg) {
      svg.style.color = iconStyle.color;
    }
  };

  return (
    <a
      key={idx}
      href={social.url || "#"}
      target="_blank"
      rel="noreferrer"
      title={social.name}
      className="transition-all duration-200 hover:scale-110 cursor-pointer"
      style={iconStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.preventDefault();
      }}
      data-control={`social-icon-${idx}`}
      data-block-id={blockId}
    >
      {social.icon}
    </a>
  );
};

export default SocialIcon;