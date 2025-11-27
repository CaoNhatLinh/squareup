import { useShop } from '@/context/ShopContext';
import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledButton from '@/components/builder/atoms/StyledButton';
import StyledText from '@/components/builder/atoms/StyledText';

export default function HeroBannerBlock({
  variant = 'overlay',
  title,
  subtitle,
  imageURL,
  height = 'medium',
  overlayOpacity = 0.5,
  textAlignment = 'center',
  textColor = '#ffffff',
  backgroundColor,
  showButton = true,
  buttonText,
  buttonTextColor,
  buttonColor,
  buttonSize = 'lg',
  buttonStyle = 'pill',
  titleStyle,
  subtitleStyle,
  themeColor,
  badgeText = '',
  globalStyles,
  blockId,
  anchorId,
  isPublic = false,
  onElementClick,
  
}) {
  const { shop } = useShop();
  const displayTitle = title || shop?.name || 'Welcome to Our Restaurant';

  const heightClasses = {
    auto: 'py-20',
    medium: 'min-h-[400px]',
    large: 'min-h-[600px]',
    full: 'min-h-screen'
  };

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  const resolvedTheme = resolveColor(themeColor || globalStyles?.palette?.primary || globalStyles?.colors?.primary, globalStyles) || '#F97316';
  const resolvedButtonColor = resolveColor(buttonColor || themeColor || globalStyles?.palette?.primary || globalStyles?.colors?.primary, globalStyles) || '#F97316';
  const resolvedText = resolveColor(textColor || globalStyles?.palette?.onPrimary || globalStyles?.colors?.text, globalStyles) || '#ffffff';
  const resolvedButtonText = resolveColor(buttonTextColor || globalStyles?.palette?.onPrimary || globalStyles?.colors?.text, globalStyles) || '#ffffff';
  const handleButtonClick = (e) => {
    if (!isPublic) {
      e.preventDefault();
      e.stopPropagation();
      if (onElementClick) {
        onElementClick("buttonText");
      }
      return;
    }
     else if (isPublic) {
        window.location.href = `/${window.location.pathname.split("/")[1]}/order`;
      };
  };

  const renderButton = () => {
    if (!showButton || !buttonText) return null;

    return (
      <StyledButton
        styleConfig={{
          style: buttonStyle === 'outline' ? 'outline' : 'filled',
          color: resolvedButtonColor,
          textColor: resolvedButtonText,
          rounded: buttonStyle === 'pill',
          size: buttonSize
        }}
        data-control="buttonText"
        data-focus="buttonText"
        data-block-id={blockId}
        onClick={handleButtonClick}
      >
        {buttonText}
      </StyledButton>
    );
  };

  if (variant === 'split') {
    return (
      <div className={`w-full flex flex-col md:flex-row ${heightClasses[height] || 'min-h-[500px]'}`} id={anchorId || 'hero'} >
        <div
          className={`flex-1 flex flex-col justify-center p-12 ${alignClasses[textAlignment] || 'items-center text-center'}`}
          style={{ backgroundColor: resolvedTheme }}
        >
          <StyledText
            tag="h1"
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            styleConfig={{ ...titleStyle, color: resolvedText }}
            data-control="title"
            data-block-id={blockId}
          >
            {displayTitle}
          </StyledText>
          {subtitle && (
            <StyledText
              tag="p"
              className="text-xl mb-8 max-w-lg"
              styleConfig={{ ...subtitleStyle, color: resolvedText }}
              data-control="subtitle"
              data-block-id={blockId}
            >
              {subtitle}
            </StyledText>
          )}
          {renderButton()}
        </div>

        <div className="flex-1 relative min-h-[300px] md:min-h-full">
          {(imageURL || imageURL === '') ? (
            <img
              src={imageURL || "https://placehold.co/800x600?text=No+Image"}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
              <span className="text-6xl">🖼️</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    const resolvedHeading = resolveColor(textColor || globalStyles?.palette?.onPrimary || globalStyles?.colors?.text, globalStyles) || '#111827';
    const resolvedBg = resolveColor(globalStyles?.palette?.background || globalStyles?.colors?.background, globalStyles) || '#ffffff';

    return (
      <div
        className={`w-full flex flex-col justify-center p-12 ${heightClasses[height] || 'py-24'} ${alignClasses[textAlignment] || 'items-center text-center'}`}
        style={{ backgroundColor: resolvedBg }}
        id={anchorId || 'hero'}

      >
        <StyledText
          tag="h1"
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
          styleConfig={{ ...titleStyle, color: resolvedHeading }}
          data-control="title"
          data-block-id={blockId}
        >
          {displayTitle}
        </StyledText>
        {subtitle && (
          <StyledText
            tag="p"
            className="text-2xl text-gray-600 mb-8 max-w-2xl font-light"
            styleConfig={{ ...subtitleStyle }}
            data-control="subtitle"
            data-block-id={blockId}
          >
            {subtitle}
          </StyledText>
        )}
        {renderButton()}
      </div>
    );
  }

  const resolvedBackground = resolveColor(backgroundColor || globalStyles?.palette?.background || globalStyles?.colors?.background, globalStyles) || resolvedTheme;

  return (
    <div
      className={`relative w-full flex flex-col justify-center p-6 ${heightClasses[height] || 'min-h-[400px]'} ${alignClasses[textAlignment] || 'items-center text-center'}`}
      style={{
        backgroundColor: resolvedBackground,
        backgroundImage: (imageURL || imageURL === '') ? `url(${imageURL || "https://placehold.co/800x600?text=No+Image"})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      id={anchorId || 'hero'}
    >
      {(imageURL || imageURL === '') && (
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ background: `linear-gradient(180deg, rgba(0,0,0,${overlayOpacity * 0.8}), rgba(0,0,0,${overlayOpacity}))` }}
        />
      )}

      <div className="relative z-10 max-w-4xl w-full">
        {badgeText && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold">
            <span className="bg-white/20 px-2 py-0.5 rounded-full">{badgeText}</span>
          </div>
        )}
        <StyledText
          tag="h1"
          className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          styleConfig={{ ...titleStyle, color: resolvedText }}
          data-control="title"
          data-block-id={blockId}
        >
          {displayTitle}
        </StyledText>
        {subtitle && (
          <StyledText
            tag="p"
            className="text-xl md:text-2xl mb-8 drop-shadow-md font-medium"
            styleConfig={{ ...subtitleStyle, color: resolvedText }}
            data-control="subtitle"
            data-block-id={blockId}
          >
            {subtitle}
          </StyledText>
        )}
        {renderButton()}
      </div>
    </div>
  );
}
