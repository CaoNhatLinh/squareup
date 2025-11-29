import { Fragment } from "react";
import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from '@/components/builder/atoms/StyledText';
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';
export default function OurStory({
  title,
  content,
  image,
  layout = "elegant-split",
  showDecorativeElements = true,
  showCallToAction = true,
  callToActionText = "Learn More",
  backgroundColor = "background",
  textColor = "text",
  titleStyle = {},
  contentStyle = {},
  globalStyles,
  blockId,
  anchorId,
  sections = []
}) {
  const { containerRef, isTablet, isDesktop } = useContainerQuery();
  const getColor = (colorKey) => {
    return resolveColor(colorKey, globalStyles);
  };
  const renderElegantSplit = ({ title, content, image, showDecorativeElements, showCallToAction, callToActionText, isMain }) => (
    <section ref={containerRef} className={`py-24 ${isDesktop || isTablet ? 'px-8' : 'px-4'} relative overflow-hidden`} style={{ backgroundColor: getColor(backgroundColor) }} id={anchorId || 'ourstory'}>
      {showDecorativeElements && (
        <>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: getColor('primary') + '40' }}></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') + '40' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full blur-3xl opacity-30" style={{ backgroundColor: getColor('surface') + '60' }}></div>
          </div>
          <div className="absolute top-10 right-10 w-20 h-20 border-2 rounded-full opacity-20" style={{ borderColor: getColor('primary') }}></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 border rounded-full opacity-30" style={{ borderColor: getColor('secondary') }}></div>
        </>
      )}
      <div className="max-w-7xl mx-auto relative">
        <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} ${isDesktop ? 'gap-20' : 'gap-16'} items-center`}>
          <div className={isDesktop ? 'order-1' : 'order-2'} data-control={isMain ? "ourstory-content" : undefined} data-block-id={blockId}>
            <div className="relative">
              {showDecorativeElements && (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg border" style={{ backgroundColor: getColor('surface'), color: getColor(textColor), borderColor: getColor('primary') }} >
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: getColor('primary') }}></div>
                  Our Story
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: getColor('secondary') }}></div>
                </div>
              )}
              {title && (
                <StyledText
                  tag="h2"
                  className={`font-bold mb-8 leading-tight ${isDesktop ? 'text-6xl' : 'text-5xl'}`}
                  styleConfig={{
                    ...titleStyle,
                    color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
                    fontFamily: globalStyles?.typography?.headingFont
                  }}
                  dataControl={isMain ? "ourstory-title" : undefined}
                  dataBlockId={blockId}
                >
                  <span style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                    {title}
                  </span>
                </StyledText>
              )}
              {content && (
                <StyledText
                  tag="div"
                  className="prose prose-xl max-w-none text-gray-700 leading-relaxed mb-10"
                  styleConfig={{
                    ...contentStyle,
                    color: contentStyle.color ? resolveColor(contentStyle.color, globalStyles) : getColor('muted'),
                    fontFamily: globalStyles?.typography?.bodyFont
                  }}
                  dataControl={isMain ? "ourstory-content-text" : undefined}
                  dataBlockId={blockId}
                >
                  <div className="text-lg leading-relaxed whitespace-pre-line">
                    {content}
                  </div>
                </StyledText>
              )}
              {showCallToAction && (
                <div className="flex flex-col sm:flex-row gap-4" data-control={isMain ? "ourstory-cta" : undefined} data-block-id={blockId}>
                  <button className="inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2" style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`, color: getColor('onPrimary'), borderColor: getColor('surface') }}>
                    {callToActionText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl" style={{ borderColor: getColor('primary'), color: getColor('primary'), backgroundColor: getColor('surface') }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Us
                  </button>
                </div>
              )}
            </div>
          </div>
          {(image || image === '') && (
            <div className={`${isDesktop ? 'order-2' : 'order-1'} relative group`} data-control={isMain ? "ourstory-image" : undefined} data-block-id={blockId}>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-700 border-4" style={{ borderColor: getColor('surface') }}>
                <img
                  src={image || "/assets/image/no-image.png"}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: getColor('primary') + '10' }}></div>
              </div>
              {showDecorativeElements && (
                <>
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full opacity-80 shadow-lg animate-bounce" style={{ backgroundColor: getColor('primary') }}></div>
                  <div className="absolute -bottom-6 -right-6 w-8 h-8 rounded-full opacity-60 shadow-lg animate-bounce delay-1000" style={{ backgroundColor: getColor('secondary') }}></div>
                  <div className="absolute top-4 right-4 w-4 h-4 rounded-full opacity-70 shadow-md" style={{ backgroundColor: getColor('surface') }}></div>
                  <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full opacity-80 shadow-md" style={{ backgroundColor: getColor('primary') }}></div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
  const renderLuxuryCentered = ({ title, content, image, showDecorativeElements, showCallToAction, callToActionText, isMain }) => (
    <section ref={containerRef} className={`py-32 ${isDesktop || isTablet ? 'px-8' : 'px-4'} relative overflow-hidden`} style={{ background: `linear-gradient(to bottom right, ${getColor('background')}, ${getColor('surface')})` }} id={anchorId || 'ourstory'}>
      {showDecorativeElements && (
        <>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: getColor('primary') }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') }}></div>
          </div>
          <div className="absolute top-20 left-20 w-px h-32" style={{ background: `linear-gradient(to bottom, ${getColor('primary')}, transparent)` }}></div>
          <div className="absolute top-20 right-20 w-px h-32" style={{ background: `linear-gradient(to bottom, ${getColor('secondary')}, transparent)` }}></div>
          <div className="absolute bottom-20 left-20 w-px h-32" style={{ background: `linear-gradient(to top, ${getColor('primary')}, transparent)` }}></div>
          <div className="absolute bottom-20 right-20 w-px h-32" style={{ background: `linear-gradient(to top, ${getColor('secondary')}, transparent)` }}></div>
        </>
      )}
      <div className="max-w-4xl mx-auto relative text-center">
        {showDecorativeElements && (
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full text-sm font-bold mb-12 shadow-xl border-2" style={{ backgroundColor: getColor('surface'), color: getColor(textColor), borderColor: getColor('primary') }} >
            <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: getColor('primary') }}></div>
            <span className="text-lg">✨ Our Story</span>
            <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: getColor('secondary') }}></div>
          </div>
        )}
        {title && (
          <StyledText
            tag="h2"
            className={`font-bold mb-12 leading-tight ${isDesktop ? 'text-7xl' : 'text-6xl'}`}
            styleConfig={{
              ...titleStyle,
              color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
              fontFamily: globalStyles?.typography?.headingFont
            }}
            dataControl={isMain ? "ourstory-title" : undefined}
            dataBlockId={blockId}
          >
            <span style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              {title}
            </span>
          </StyledText>
        )}
        {(image || image === '') && (
          <div className="mb-16 relative group max-w-2xl mx-auto" data-control={isMain ? "ourstory-image" : undefined} data-block-id={blockId}>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-700 border-8" style={{ borderColor: getColor('surface') }}>
              <img
                src={image || "/assets/image/no-image.png"}
                alt={title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            {showDecorativeElements && (
              <>
                <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full opacity-80 shadow-2xl animate-bounce" style={{ backgroundColor: getColor('primary') }}></div>
                <div className="absolute -bottom-8 -right-8 w-12 h-12 rounded-full opacity-60 shadow-2xl animate-bounce delay-1000" style={{ backgroundColor: getColor('secondary') }}></div>
                <div className="absolute top-6 right-6 w-6 h-6 rounded-full opacity-70 shadow-lg" style={{ backgroundColor: getColor('surface') }}></div>
                <div className="absolute bottom-6 left-6 w-5 h-5 rounded-full opacity-80 shadow-lg" style={{ backgroundColor: getColor('primary') }}></div>
              </>
            )}
          </div>
        )}
        {content && (
          <StyledText
            tag="div"
            className="max-w-3xl mx-auto mb-16 prose prose-2xl max-w-none leading-relaxed text-center"
            styleConfig={{
              ...contentStyle,
              color: contentStyle.color ? resolveColor(contentStyle.color, globalStyles) : getColor('muted'),
              fontFamily: globalStyles?.typography?.bodyFont
            }}
            dataControl={isMain ? "ourstory-content-text" : undefined}
            dataBlockId={blockId}
          >
            <div className="text-xl leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </StyledText>
        )}
        {showCallToAction && (
          <div className="flex justify-center" data-control={isMain ? "ourstory-cta" : undefined} data-block-id={blockId}>
            <button className="inline-flex items-center gap-4 px-12 py-6 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 border-4" style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`, borderColor: getColor('surface'), color: getColor('onPrimary') }}>
              <span>{callToActionText}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
  const renderModernAsymmetric = ({ title, content, image, showDecorativeElements, showCallToAction, callToActionText, isMain }) => (
    <section ref={containerRef} className={`py-24 ${isDesktop || isTablet ? 'px-8' : 'px-4'} relative overflow-hidden`} style={{ backgroundColor: getColor('background') }} id={anchorId || 'ourstory'} data-block-id={blockId}>
      {showDecorativeElements && (
        <>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-1/3 h-full" style={{ background: `linear-gradient(to left, ${getColor('primary')}, transparent)` }}></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-2/3" style={{ background: `linear-gradient(to top, ${getColor('secondary')}, transparent)` }}></div>
          </div>
          <div className="absolute top-20 right-20 w-32 h-32 border-4 rounded-full opacity-20" style={{ borderColor: getColor('primary') }}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 transform rotate-45 opacity-30" style={{ borderColor: getColor('secondary') }}></div>
        </>
      )}
      <div className="max-w-7xl mx-auto relative">
        <div className={`grid ${isDesktop ? 'grid-cols-5' : 'grid-cols-1'} gap-16 items-center`}>
          <div className={isDesktop ? 'col-span-3' : ''} data-control={isMain ? "ourstory-content" : undefined} data-block-id={blockId}>
            <div className="relative">
              {showDecorativeElements && (
                <div className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-full text-sm font-medium mb-8" style={{ backgroundColor: getColor('primary') }} >
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Our Story
                </div>
              )}
              {title && (
                <StyledText
                  tag="h2"
                  className={`${isDesktop ? 'text-6xl' : 'text-5xl'} font-bold mb-8 leading-tight`}
                  styleConfig={{
                    ...titleStyle,
                    color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
                    fontFamily: globalStyles?.typography?.headingFont
                  }}
                  dataControl={isMain ? "ourstory-title" : undefined}
                  dataBlockId={blockId}
                >
                  <span style={{ background: `linear-gradient(to right, ${getColor('text')}, ${getColor('muted')})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                    {title}
                  </span>
                </StyledText>
              )}
              {content && (
                <StyledText
                  tag="div"
                  className="prose prose-xl max-w-none leading-relaxed mb-10"
                  styleConfig={{
                    ...contentStyle,
                    color: contentStyle.color ? resolveColor(contentStyle.color, globalStyles) : getColor('muted'),
                    fontFamily: globalStyles?.typography?.bodyFont
                  }}
                  dataControl={isMain ? "ourstory-content-text" : undefined}
                  dataBlockId={blockId}
                >
                  <div className="text-lg leading-relaxed whitespace-pre-line">
                    {content}
                  </div>
                </StyledText>
              )}
              {showCallToAction && (
                <div data-control={isMain ? "ourstory-cta" : undefined} data-block-id={blockId}>
                  <button className="inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105" style={{ backgroundColor: getColor('primary') }}>
                    {callToActionText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {(image || image === '') && (
            <div className={`${isDesktop ? 'col-span-2 col-start-4' : ''} relative group`} data-control={isMain ? "ourstory-image" : undefined} data-block-id={blockId}>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-500 -rotate-2 hover:rotate-0">
                <img
                  src={image || "/assets/image/no-image.png"}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {showDecorativeElements && (
                <>
                  <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-80" style={{ backgroundColor: getColor('primary') }}></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full opacity-60" style={{ backgroundColor: getColor('secondary') }}></div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
  const renderClassicOverlap = ({ title, content, image, showDecorativeElements, showCallToAction, callToActionText, isMain }) => (
    <section ref={containerRef} className={`py-24 ${isDesktop || isTablet ? 'px-8' : 'px-4'} relative overflow-hidden`} style={{ background: `linear-gradient(to bottom right, ${getColor('background')}, ${getColor('surface')})` }} id={anchorId || 'ourstory'} data-block-id={blockId}>
      {showDecorativeElements && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-16 w-36 h-36 rounded-full blur-3xl" style={{ backgroundColor: getColor('primary') }}></div>
          <div className="absolute bottom-16 right-16 w-28 h-28 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') }}></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto relative">
        <div className="relative">
          {(image || image === '') && (
            <div className={`absolute right-0 top-0 w-1/2 h-full transform translate-x-16 -translate-y-8 ${isDesktop ? 'block' : 'hidden'}`} data-control={isMain ? "ourstory-image" : undefined} data-block-id={blockId}>
              <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={image || "/assets/image/no-image.png"}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20"></div>
              </div>
            </div>
          )}
          <div className={`relative rounded-2xl shadow-xl p-12 ${isDesktop ? 'p-16 mr-32' : ''}`} style={{ backgroundColor: getColor('surface') }} data-control={isMain ? "ourstory-content" : undefined} data-block-id={blockId}>
            {showDecorativeElements && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: getColor('primary') + '20', color: getColor('primary') }} >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('primary') }}></span>
                Our Story
              </div>
            )}
            {title && (
              <StyledText
                tag="h2"
                className={`font-bold mb-6 leading-tight ${isDesktop ? 'text-5xl' : 'text-4xl'}`}
                styleConfig={{
                  ...titleStyle,
                  color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
                  fontFamily: globalStyles?.typography?.headingFont
                }}
                dataControl={isMain ? "ourstory-title" : undefined}
                dataBlockId={blockId}
              >
                <span style={{ background: `linear-gradient(to right, ${getColor('text')}, ${getColor('muted')})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                  {title}
                </span>
              </StyledText>
            )}
            {content && (
              <StyledText
                tag="div"
                className="prose prose-lg max-w-none leading-relaxed mb-8"
                styleConfig={{
                  ...contentStyle,
                  color: contentStyle.color ? resolveColor(contentStyle.color, globalStyles) : getColor('muted'),
                  fontFamily: globalStyles?.typography?.bodyFont
                }}
                dataControl={isMain ? "ourstory-content-text" : undefined}
                dataBlockId={blockId}
              >
                <div className="whitespace-pre-line">
                  {content}
                </div>
              </StyledText>
            )}
            {showCallToAction && (
              <div data-control={isMain ? "ourstory-cta" : undefined} data-block-id={blockId}>
                <button className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl" style={{ backgroundColor: getColor('primary') }}>
                  {callToActionText}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
  const renderMinimalist = ({ title, content, image, showDecorativeElements, showCallToAction, callToActionText, isMain }) => (
    <section ref={containerRef} className={`py-20 ${isDesktop || isTablet ? 'px-8' : 'px-4'}`} style={{ backgroundColor: getColor('background') }} id={anchorId || 'ourstory'} data-block-id={blockId}>
      <div className="max-w-4xl mx-auto text-center">
        {showDecorativeElements && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ backgroundColor: getColor('surface'), color: getColor('muted') }} >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('muted') }}></span>
            Our Story
          </div>
        )}
        {title && (
          <StyledText
            tag="h2"
            className={`font-bold mb-8 leading-tight ${isDesktop ? 'text-5xl' : 'text-4xl'}`}
            styleConfig={{
              ...titleStyle,
              color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
              fontFamily: globalStyles?.typography?.headingFont
            }}
            dataControl={isMain ? "ourstory-title" : undefined}
            dataBlockId={blockId}
          >
            {title}
          </StyledText>
        )}
        {(image || image === '') && (
          <div className="mb-12 relative group max-w-2xl mx-auto" data-control={isMain ? "ourstory-image" : undefined} data-block-id={blockId}>
            <div className="relative overflow-hidden rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <img
                src={image || "/assets/image/no-image.png"}
                alt={title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}
        {content && (
          <StyledText
            tag="div"
            className="max-w-2xl mx-auto mb-12 prose prose-lg max-w-none leading-relaxed"
            styleConfig={{
              ...contentStyle,
              color: contentStyle.color ? resolveColor(contentStyle.color, globalStyles) : getColor('muted'),
              fontFamily: globalStyles?.typography?.bodyFont
            }}
            dataControl={isMain ? "ourstory-content-text" : undefined}
            dataBlockId={blockId}
          >
            <div className="whitespace-pre-line">
              {content}
            </div>
          </StyledText>
        )}
        {showCallToAction && (
          <div data-control={isMain ? "ourstory-cta" : undefined} data-block-id={blockId}>
            <button className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full transition-colors duration-200" style={{ backgroundColor: getColor('text') }}>
              {callToActionText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
  const renderPremiumShowcase = ({ title, content, image, showDecorativeElements, showCallToAction, callToActionText, isMain }) => (
    <section ref={containerRef} className={`py-24 ${isDesktop || isTablet ? 'px-8' : 'px-4'} relative overflow-hidden`} style={{ background: `linear-gradient(to bottom right, ${getColor('background')}, ${getColor('surface')})` }} id={anchorId || 'ourstory'} data-block-id={blockId}>
      {showDecorativeElements && (
        <>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: getColor('primary') }}></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') }}></div>
          </div>
          <div className="absolute top-10 right-10 w-20 h-20 border-2 rounded-full opacity-20" style={{ borderColor: getColor('primary') }}></div>
        </>
      )}
      <div className="max-w-7xl mx-auto relative">
        <div className={`grid ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'} gap-16 items-center`}>
          <div className={isDesktop ? 'col-span-2' : ''} data-control={isMain ? "ourstory-content" : undefined} data-block-id={blockId}>
            <div className="relative">
              {showDecorativeElements && (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg" style={{ background: `linear-gradient(to right, ${getColor('surface')}, ${getColor('background')})`, color: getColor(textColor) }} >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor('primary') }}></div>
                  Our Story
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor('secondary') }}></div>
                </div>
              )}
              {title && (
                <StyledText
                  tag="h2"
                  className={`${isDesktop ? 'text-6xl' : 'text-5xl'} font-bold mb-8 leading-tight`}
                  styleConfig={{
                    ...titleStyle,
                    color: titleStyle.color ? resolveColor(titleStyle.color, globalStyles) : getColor(textColor),
                    fontFamily: globalStyles?.typography?.headingFont
                  }}
                  dataControl={isMain ? "ourstory-title" : undefined}
                  dataBlockId={blockId}
                >
                  <span style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                    {title}
                  </span>
                </StyledText>
              )}
              {content && (
                <StyledText
                  tag="div"
                  className="prose prose-xl max-w-none leading-relaxed mb-10"
                  styleConfig={{
                    ...contentStyle,
                    color: contentStyle.color ? resolveColor(contentStyle.color, globalStyles) : getColor('muted'),
                    fontFamily: globalStyles?.typography?.bodyFont
                  }}
                  dataControl={isMain ? "ourstory-content-text" : undefined}
                  dataBlockId={blockId}
                >
                  <div className="text-lg leading-relaxed whitespace-pre-line">
                    {content}
                  </div>
                </StyledText>
              )}
              {showCallToAction && (
                <div data-control={isMain ? "ourstory-cta" : undefined} data-block-id={blockId}>
                  <button className="inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105" style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})` }}>
                    {callToActionText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {(image || image === '') && (
            <div className="relative group" data-control={isMain ? "ourstory-image" : undefined} data-block-id={blockId}>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-700 border-4" style={{ borderColor: getColor('surface') }}>
                <img
                  src={image || "/assets/image/no-image.png"}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              {showDecorativeElements && (
                <>
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full opacity-80 shadow-lg" style={{ background: `linear-gradient(to bottom right, ${getColor('primary')}, ${getColor('secondary')})` }}></div>
                  <div className="absolute -bottom-6 -right-6 w-8 h-8 rounded-full opacity-60 shadow-lg" style={{ background: `linear-gradient(to bottom right, ${getColor('secondary')}, ${getColor('primary')})` }}></div>
                  <div className="absolute top-4 right-4 w-4 h-4 rounded-full opacity-70" style={{ backgroundColor: getColor('primary') }}></div>
                  <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full opacity-80" style={{ backgroundColor: getColor('secondary') }}></div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
  const renderLayout = (layoutName, data) => {
    switch (layoutName) {
      case 'luxury-centered':
        return renderLuxuryCentered(data);
      case 'modern-asymmetric':
        return renderModernAsymmetric(data);
      case 'classic-overlap':
        return renderClassicOverlap(data);
      case 'minimalist':
        return renderMinimalist(data);
      case 'premium-showcase':
        return renderPremiumShowcase(data);
      case 'elegant-split':
      default:
        return renderElegantSplit(data);
    }
  };
  const mainSectionData = {
    title,
    content,
    image,
    showDecorativeElements,
    showCallToAction,
    callToActionText,
    isMain: true
  };
  return (
    <>
      {renderLayout(layout, mainSectionData)}
      {sections && sections.map((section, index) => (
        <Fragment key={index}>
          {renderLayout(layout, {
            ...section,
            showDecorativeElements: false,
            showCallToAction: false,
            isMain: false
          })}
        </Fragment>
      ))}
    </>
  );
}
