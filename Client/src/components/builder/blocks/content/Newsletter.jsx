import { useState } from "react";
import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from "@/components/builder/atoms/StyledText";

export default function Newsletter({
  title,
  subtitle,
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  showPrivacyPolicy = true,
  privacyText = "We respect your privacy. Unsubscribe at any time.",
  layout = "centered",
  backgroundColor = "background",
  textColor = "text",
  showDecorativeElements = true,
  globalStyles,
  blockId
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  
  const getColor = (colorKey) => {
    return resolveColor(colorKey, globalStyles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    
    setTimeout(() => {
      setMessage('Thank you for subscribing!');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  const renderCentered = () => (
    <section className="py-20 px-4 md:px-8 relative overflow-hidden" style={{ backgroundColor: getColor(backgroundColor) }} id={blockId} data-block-id={blockId} data-control="container">
      {showDecorativeElements && (
        <>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: getColor('primary') }}></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') }}></div>
          </div>
          <div className="absolute top-10 right-10 w-16 h-16 border-2 rounded-full opacity-20" style={{ borderColor: getColor('primary') }}></div>
        </>
      )}

      <div className="max-w-2xl mx-auto text-center relative">
        {showDecorativeElements && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ backgroundColor: getColor('primary'), color: getColor('onPrimary') }} data-control="newsletter-badge" data-block-id={blockId}>
            <span className="w-2 h-2 bg-current rounded-full"></span>
            Newsletter
          </div>
        )}
        {title && (
          <StyledText
            tag="h2"
            className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            styleConfig={{
              fontFamily: globalStyles?.typography?.headingFont,
              color: getColor(textColor),
            }}
            dataControl="newsletter-title"
            dataBlockId={blockId}
          >
            <span style={{ background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              {title}
            </span>
          </StyledText>
        )}
        {subtitle && (
          <StyledText
            tag="p"
            className="text-xl mb-12 leading-relaxed"
            styleConfig={{ color: getColor('muted') }}
            dataControl="newsletter-subtitle"
            dataBlockId={blockId}
          >
            {subtitle}
          </StyledText>
        )}
        <div className="max-w-md mx-auto" data-control="newsletter-form" data-block-id={blockId}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full px-6 py-4 text-lg rounded-full border-2 focus:outline-none focus:ring-4 transition-all duration-300"
                style={{
                  borderColor: getColor('muted'),
                  backgroundColor: getColor('surface'),
                  color: getColor(textColor),
                  fontFamily: globalStyles?.typography?.bodyFont
                }}
                onFocus={(e) => e.target.style.borderColor = getColor('primary')}
                onBlur={(e) => e.target.style.borderColor = getColor('muted')}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6" style={{ color: getColor('muted') }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`,
                color: getColor('onPrimary')
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Subscribing...
                </div>
              ) : (
                buttonText
              )}
            </button>
          </form>
          {message && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: getColor('primary') + '10', color: getColor('primary') }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {message}
              </div>
            </div>
          )}
          {showPrivacyPolicy && (
            <StyledText
              tag="p"
              className="mt-6 text-sm"
              styleConfig={{ color: getColor('muted') }}
              dataControl="newsletter-privacy"
              dataBlockId={blockId}
            >
              {privacyText}
            </StyledText>
          )}
        </div>
      </div>
    </section>
  );

  const renderInline = () => (
    <section className="py-16 px-4 md:px-8" style={{ backgroundColor: getColor(backgroundColor) }} id={blockId} data-block-id={blockId} data-control="container">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1" data-control="newsletter-content" data-block-id={blockId}>
            {title && (
              <StyledText
                tag="h2"
                className="text-3xl lg:text-4xl font-bold mb-4 leading-tight"
                styleConfig={{
                  fontFamily: globalStyles?.typography?.headingFont,
                  color: getColor(textColor),
                }}
                dataControl="newsletter-title"
                dataBlockId={blockId}
              >
                {title}
              </StyledText>
            )}
            {subtitle && (
              <StyledText
                tag="p"
                className="text-lg mb-6 leading-relaxed"
                styleConfig={{ color: getColor('muted') }}
                dataControl="newsletter-subtitle"
                dataBlockId={blockId}
              >
                {subtitle}
              </StyledText>
            )}
          </div>
          <div className="flex-1 max-w-md" data-control="newsletter-form" data-block-id={blockId}>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  borderColor: getColor('muted'),
                  backgroundColor: getColor('surface'),
                  color: getColor(textColor)
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{
                  backgroundColor: getColor('primary'),
                  color: getColor('onPrimary')
                }}
              >
                {isSubmitting ? '...' : buttonText}
              </button>
            </form>

            {showPrivacyPolicy && (
              <StyledText
                tag="p"
                className="mt-3 text-sm"
                styleConfig={{ color: getColor('muted') }}
                dataControl="newsletter-privacy"
                dataBlockId={blockId}
              >
                {privacyText}
              </StyledText>
            )}

            {message && (
              <StyledText tag="p" className="mt-3 text-sm" styleConfig={{ color: getColor('primary') }}>
                {message}
              </StyledText>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderCard = () => (
    <section className="py-20 px-4 md:px-8" style={{ backgroundColor: getColor(backgroundColor) }} id={blockId} data-block-id={blockId} data-control="container">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl shadow-xl p-12 text-center" style={{ backgroundColor: getColor('surface') }}>
          {title && (
            <StyledText
              tag="h2"
              className="text-3xl lg:text-4xl font-bold mb-4 leading-tight"
              styleConfig={{
                fontFamily: globalStyles?.typography?.headingFont,
                color: getColor(textColor),
              }}
              dataControl="newsletter-title"
              dataBlockId={blockId}
            >
              {title}
            </StyledText>
          )}
          {subtitle && (
            <StyledText
              tag="p"
              className="text-lg mb-8 leading-relaxed"
              styleConfig={{ color: getColor('muted') }}
              dataControl="newsletter-subtitle"
              dataBlockId={blockId}
            >
              {subtitle}
            </StyledText>
          )}

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4" data-control="newsletter-form" data-block-id={blockId}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                borderColor: getColor('muted'),
                backgroundColor: getColor('background'),
                color: getColor(textColor)
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              style={{
                backgroundColor: getColor('primary'),
                color: getColor('onPrimary')
              }}
            >
              {isSubmitting ? 'Subscribing...' : buttonText}
            </button>
          </form>

          {message && (
            <StyledText tag="p" className="mt-4 text-sm" styleConfig={{ color: getColor('primary') }}>
              {message}
            </StyledText>
          )}

          {showPrivacyPolicy && (
            <StyledText
              tag="p"
              className="mt-4 text-sm"
              styleConfig={{ color: getColor('muted') }}
              dataControl="newsletter-privacy"
              dataBlockId={blockId}
            >
              {privacyText}
            </StyledText>
          )}
        </div>
      </div>
    </section>
  );

  
  switch (layout) {
    case "inline":
      return renderInline();
    case "card":
      return renderCard();
    case "centered":
    default:
      return renderCentered();
  }
}
