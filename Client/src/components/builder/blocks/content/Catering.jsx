import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from '@/components/builder/atoms/StyledText';

export default function Catering({
  title,
  subtitle,
  packages = [],
  showPricing,
  ctaText,
  ctaUrl,
  layout = "grid",
  backgroundColor = "background",
  textColor = "text",
  accentColor = "primary",
  titleStyle = {},
  subtitleStyle = {},
  cardStyle = {},
  globalStyles,
  blockId
}) {
  
  const getColor = (colorKey) => {
    return resolveColor(colorKey, globalStyles);
  };

  const renderGrid = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {packages.map((pkg, index) => (
        <div
          key={index}
          className={`relative rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}
          style={{
            backgroundColor: getColor('surface'),
            borderColor: pkg.popular ? getColor(accentColor) : getColor('surface'),
            ...cardStyle
          }}
          data-control={`catering-package-${index}`}
          data-block-id={blockId}
        >
          {pkg.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-4 py-1 rounded-full text-sm font-medium shadow-lg" style={{ backgroundColor: getColor(accentColor), color: getColor('onPrimary') }}>
                Most Popular
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="text-center mb-6">
              <StyledText
                tag="h3"
                className="text-2xl font-bold mb-2"
                styleConfig={{
                  color: getColor(textColor),
                  fontFamily: globalStyles?.typography?.headingFont
                }}
                dataControl={`catering-package-name-${index}`}
                dataBlockId={blockId}
              >
                {pkg.name}
              </StyledText>
              
              {showPricing && (
                <div className="flex items-baseline justify-center gap-1">
                  <StyledText tag="span" className="text-4xl font-bold" styleConfig={{ color: getColor(accentColor) }}>{pkg.price}</StyledText>
                  {pkg.perPerson && <StyledText tag="span" className="text-sm" styleConfig={{ color: getColor('muted') }}>per person</StyledText>}
                </div>
              )}
              <StyledText
                tag="p"
                className="mt-2"
                styleConfig={{
                  color: getColor('muted'),
                  fontFamily: globalStyles?.typography?.bodyFont
                }}
                dataControl={`catering-package-desc-${index}`}
                dataBlockId={blockId}
              >
                {pkg.description}
              </StyledText>
            </div>

            <div className="space-y-3 mb-8">
              {pkg.features && pkg.features.map((featureItem, featureIndex) => {
                const featureText = typeof featureItem === 'object' ? featureItem.feature : featureItem;
                return (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getColor(accentColor) + '20' }}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: getColor(accentColor) }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <StyledText tag="span" styleConfig={{ color: getColor(textColor) }}>{featureText}</StyledText>
                  </div>
                );
              })}
            </div>

            <button 
              className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl`}
              style={{
                backgroundColor: pkg.popular ? getColor(accentColor) : getColor('surface'),
                color: pkg.popular ? getColor('onPrimary') : getColor(textColor),
                border: `1px solid ${pkg.popular ? 'transparent' : getColor('muted')}`
              }}
            >
              Choose Package
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 mb-12 max-w-4xl mx-auto">
      {packages.map((pkg, index) => (
        <div
          key={index}
          className="relative rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center"
          style={{
            backgroundColor: getColor('surface'),
            borderColor: pkg.popular ? getColor(accentColor) : getColor('muted'),
            ...cardStyle
          }}
          data-control={`catering-package-${index}`}
          data-block-id={blockId}
        >
          {pkg.popular && (
            <div className="absolute top-0 left-0 transform -translate-x-2 -translate-y-2">
              <div className="px-3 py-1 rounded-full text-xs font-bold shadow-md uppercase tracking-wider" style={{ backgroundColor: getColor(accentColor), color: getColor('onPrimary') }}>
                Popular
              </div>
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <StyledText
              tag="h3"
              className="text-2xl font-bold mb-2"
              styleConfig={{
                color: getColor(textColor),
                fontFamily: globalStyles?.typography?.headingFont
              }}
              dataControl={`catering-package-name-${index}`}
              dataBlockId={blockId}
            >
              {pkg.name}
            </StyledText>
            <StyledText
              tag="p"
              className="mb-4"
              styleConfig={{
                color: getColor('muted'),
                fontFamily: globalStyles?.typography?.bodyFont
              }}
              dataControl={`catering-package-desc-${index}`}
              dataBlockId={blockId}
            >
              {pkg.description}
            </StyledText>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
              {pkg.features && pkg.features.map((featureItem, featureIndex) => {
                const featureText = typeof featureItem === 'object' ? featureItem.feature : featureItem;
                return (
                  <div key={featureIndex} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: getColor(accentColor) }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <StyledText tag="span" styleConfig={{ color: getColor(textColor) }}>{featureText}</StyledText>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center flex-shrink-0 flex flex-col items-center gap-4 min-w-[180px]">
            {showPricing && (
              <div className="flex flex-col items-center">
                <StyledText tag="span" className="text-3xl font-bold" styleConfig={{ color: getColor(accentColor) }}>{pkg.price}</StyledText>
                {pkg.perPerson && <StyledText tag="span" className="text-xs uppercase tracking-wide" styleConfig={{ color: getColor('muted') }}>per person</StyledText>}
              </div>
            )}
            <button 
              className="w-full py-2 px-6 rounded-lg font-medium transition-all duration-200 shadow hover:shadow-md"
              style={{
                backgroundColor: pkg.popular ? getColor(accentColor) : 'transparent',
                color: pkg.popular ? getColor('onPrimary') : getColor(textColor),
                border: `2px solid ${getColor(accentColor)}`
              }}
            >
              Select
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section id={blockId} className="py-20 px-4 md:px-8 relative overflow-hidden" style={{ backgroundColor: getColor(backgroundColor) }} data-block-id={blockId} data-control="container">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-16 left-16 w-36 h-36 rounded-full blur-3xl" style={{ backgroundColor: getColor(accentColor) }}></div>
        <div className="absolute bottom-16 right-16 w-28 h-28 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: getColor(accentColor) + '20', color: getColor(accentColor) }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21H3a2 2 0 01-2-2V5a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
            Catering Services
          </div>

          {title && (
            <StyledText
              tag="h2"
              className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              styleConfig={{
                ...titleStyle,
                color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
                fontFamily: globalStyles?.typography?.headingFont
              }}
              dataControl="catering-title"
              dataBlockId={blockId}
            >
              <span style={{ 
                background: `linear-gradient(to right, ${getColor(accentColor)}, ${getColor('secondary')})`, 
                backgroundClip: 'text', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}>
                {title}
              </span>
            </StyledText>
          )}

          {subtitle && (
            <StyledText
              tag="p"
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              styleConfig={{
                ...subtitleStyle,
                color: subtitleStyle.color ? resolveColor(subtitleStyle.color, globalStyles) : getColor('muted'),
                fontFamily: globalStyles?.typography?.bodyFont
              }}
              dataControl="catering-subtitle"
              dataBlockId={blockId}
            >
              {subtitle}
            </StyledText>
          )}
        </div>
        {layout === 'list' ? renderList() : renderGrid()}
        {(ctaText || ctaUrl) && (
          <div className="text-center" data-control="catering-cta" data-block-id={blockId}>
            <button 
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${getColor(accentColor)}, ${getColor('secondary')})`,
                color: getColor('onPrimary')
              }}
            >
              {ctaText || "Book Catering"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}