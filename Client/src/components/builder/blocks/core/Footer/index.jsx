import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import { resolveColor } from "@/components/builder/utils/colorUtils";
import StyledText from "@/components/builder/atoms/StyledText";
import SocialIcon from "@/components/builder/blocks/core/Footer/components/SocialIcon";
import ContactInfo from "@/components/builder/blocks/core/Footer/components/ContactInfo";
import OpeningHours from "@/components/builder/blocks/core/Footer/components/OpeningHours";
import { useContainerQuery } from "@/components/builder/hooks/useContainerQuery";


export default function FooterBlock({
  config,
  variant = "multi-col",
  paddingY = "medium",
  backgroundColor,
  textColor = "text",
  globalStyles,
  blockId,
  restaurantData = {},
  socialIcons = [],
  openingHours = [],
  showQuickLinks,
  showContactInfo,
  showSocialLinks,
}) {
  const { typography } = globalStyles || { colors: {}, typography: {}, palette: {} };
  const cfg = config || { variant, paddingY, backgroundColor, textColor };

  const { containerRef, isMobile, isTablet } = useContainerQuery();
  const isSmall = isMobile;

  const finalShowQuickLinks = showQuickLinks !== undefined ? showQuickLinks : cfg.showQuickLinks !== undefined ? cfg.showQuickLinks : true;
  const finalShowContactInfo = showContactInfo !== undefined ? showContactInfo : cfg.showContactInfo !== undefined ? cfg.showContactInfo : true;
  const finalShowSocialLinks = showSocialLinks !== undefined ? showSocialLinks : cfg.showSocialLinks !== undefined ? cfg.showSocialLinks : true;
  const bgColor = resolveColor(cfg.backgroundColor || "secondary", globalStyles) || "#1f2937";
  const secondaryResolved = resolveColor("secondary", globalStyles) || "#1f2937";
  const resolvedTextColor = resolveColor(cfg.textColor || (bgColor === secondaryResolved ? "onSecondary" : "text"), globalStyles) || "#ffffff";
  const resolvedBtnBg = resolveColor(cfg.subscribe?.buttonColor || "primary", globalStyles) || "#F97316";

  const paddingClass = {
    small: "pt-8 pb-8",
    medium: "pt-16 pb-8",
    large: "pt-20 pb-12",
  }[cfg.paddingY || paddingY] || "pt-16 pb-8";

  const defaultLinks = [
    { label: "Menu", url: "#menu" },
    { label: "About", url: "#about" },
    { label: "Locations", url: "#location" },
  ];
  const displayLinks = cfg.links.length > 0 ? cfg.links : defaultLinks;

  return (
    <footer
      ref={containerRef}
      className={`w-full ${paddingClass} px-6 mt-auto relative`}
      style={{ backgroundColor: bgColor, color: resolvedTextColor, fontFamily: typography?.bodyFont }}
      data-block-id={blockId}
    >
      <div className="max-w-7xl mx-auto">
        {cfg.variant === "multi-col" && (
          <div className="mb-12">
            {cfg.showOpeningHours ? (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-12`}>
                <div className="space-y-8">
                  <div>
                    <StyledText
                      tag="h3"
                      className="mb-4"
                      dataControl="footer-company"
                      dataBlockId={blockId}
                      styleConfig={{
                        ...cfg.companyNameStyle,
                        fontSize: cfg.companyNameStyle?.fontSize || 24,
                        fontWeight: cfg.companyNameStyle?.fontWeight || 700,
                        color: resolveColor(cfg.companyNameStyle?.color || resolvedTextColor, globalStyles),
                        fontFamily: typography?.headingFont,
                      }}
                    >
                      {restaurantData.name}
                    </StyledText>
                    <StyledText
                      tag="p"
                      className="mb-6"
                      dataControl="footer-description"
                      dataBlockId={blockId}
                      styleConfig={{
                        ...cfg.companyDescStyle,
                        fontSize: cfg.companyDescStyle?.fontSize || 14,
                        fontWeight: cfg.companyDescStyle?.fontWeight || 400,
                        color: resolveColor(cfg.companyDescStyle?.color || resolvedTextColor, globalStyles),
                        fontFamily: typography?.bodyFont,
                      }}
                    >
                      {restaurantData.description}
                    </StyledText>
                    {finalShowSocialLinks && (
                      <div className="flex gap-4 mt-4" data-control="footer-social" data-block-id={blockId}>
                        {socialIcons.map((social, idx) => (
                          <SocialIcon key={idx} social={social} idx={idx} cfg={cfg} globalStyles={globalStyles} resolvedTextColor={resolvedTextColor} blockId={blockId} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {finalShowQuickLinks && (
                      <div>
                        <StyledText tag="h4" className="text-lg font-bold mb-4">Quick Links</StyledText>
                        <ul className="space-y-2 text-sm opacity-80" data-control="footer-links" data-block-id={blockId}>
                          {displayLinks.map((link, index) => (
                            <li key={index} data-control={`footer-link-${index}`} data-block-id={blockId} className="cursor-pointer p-2 rounded hover:bg-white/5">
                              <a href={link.url || "#"} className="hover:underline">
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {finalShowContactInfo && (
                      <div>
                        <StyledText tag="h4" className="text-lg font-bold mb-4">Contact Us</StyledText>
                        <ContactInfo addr={restaurantData.address} ph={restaurantData.phone} email={restaurantData.email} blockId={blockId} />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${resolvedBtnBg}20` }}>
                      <FaClock className="w-6 h-6" style={{ color: resolvedBtnBg }} />
                    </div>
                    <StyledText tag="h4" className="text-xl font-bold">Opening Hours</StyledText>
                  </div>
                  <OpeningHours sortedHoursArray={openingHours} resolvedBtnBg={resolvedBtnBg} bgColor={bgColor} secondaryResolved={secondaryResolved} blockId={blockId} />
                </div>
              </div>
            ) : (
              <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-8 lg:gap-12`}>
                <div className="space-y-4">
                  <StyledText
                    tag="h3"
                    dataControl="footer-company"
                    dataBlockId={blockId}
                    styleConfig={{
                      ...cfg.companyNameStyle,
                      fontSize: cfg.companyNameStyle?.fontSize || 24,
                      fontWeight: cfg.companyNameStyle?.fontWeight || 700,
                      color: resolveColor(cfg.companyNameStyle?.color || resolvedTextColor, globalStyles),
                      fontFamily: typography?.headingFont,
                    }}
                  >
                    {restaurantData.name}
                  </StyledText>
                  <StyledText
                    tag="p"
                    dataControl="footer-description"
                    dataBlockId={blockId}
                    styleConfig={{
                      ...cfg.companyDescStyle,
                      fontSize: cfg.companyDescStyle?.fontSize || 14,
                      fontWeight: cfg.companyDescStyle?.fontWeight || 400,
                      color: resolveColor(cfg.companyDescStyle?.color || resolvedTextColor, globalStyles),
                      fontFamily: typography?.bodyFont,
                    }}
                  >
                    {restaurantData.description}
                  </StyledText>
                  {finalShowContactInfo && <ContactInfo addr={restaurantData.address} ph={restaurantData.phone} email={restaurantData.email} blockId={blockId} />}
                </div>
                {finalShowSocialLinks && (
                  <div className="space-y-4">
                    <StyledText tag="h4" className="text-lg font-bold mb-4">Follow Us</StyledText>
                    <div className="flex gap-4" data-control="footer-social" data-block-id={blockId}>
                      {socialIcons.map((social, idx) => (
                        <SocialIcon key={idx} social={social} idx={idx} cfg={cfg} globalStyles={globalStyles} resolvedTextColor={resolvedTextColor} blockId={blockId} />
                      ))}
                    </div>
                  </div>
                )}
                {finalShowQuickLinks && (
                  <div className="space-y-4">
                    <StyledText tag="h4" className="text-lg font-bold mb-4">Quick Links</StyledText>
                    <ul className="space-y-2 text-sm opacity-80" data-control="footer-links" data-block-id={blockId}>
                      {displayLinks.map((link, index) => (
                        <li key={index} className="cursor-pointer hover:bg-white/5 p-1 rounded">
                          <a href={link.url}>{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {cfg.variant === "simple" && (
          <div className="flex flex-col items-center text-center mb-8">
            <StyledText
              tag="h3"
              className="mb-6"
              dataControl="footer-company"
              dataBlockId={blockId}
              styleConfig={{
                ...cfg.companyNameStyle,
                fontSize: cfg.companyNameStyle?.fontSize || 30,
                fontWeight: cfg.companyNameStyle?.fontWeight || 700,
                color: resolveColor(cfg.companyNameStyle?.color || resolvedTextColor, globalStyles),
                fontFamily: typography?.headingFont,
                textAlign: 'center'
              }}
            >
              {restaurantData.name}
            </StyledText>
            <StyledText
              tag="p"
              className="max-w-md mx-auto mb-6"
              dataControl="footer-description"
              dataBlockId={blockId}
              styleConfig={{
                ...cfg.companyDescStyle,
                fontSize: cfg.companyDescStyle?.fontSize || 14,
                fontWeight: cfg.companyDescStyle?.fontWeight || 400,
                color: resolveColor(cfg.companyDescStyle?.color || resolvedTextColor, globalStyles),
                fontFamily: typography?.bodyFont,
                textAlign: 'center'
              }}
            >
              {restaurantData.description}
            </StyledText>

            {finalShowQuickLinks && (
              <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm font-medium" data-control="footer-links" data-block-id={blockId}>
                {displayLinks.map((link, i) => (
                  <a key={i} href={link.url} className="hover:underline">{link.label}</a>
                ))}
              </div>
            )}

            {finalShowSocialLinks && (
              <div className="flex gap-4 mb-8" data-control="footer-social" data-block-id={blockId}>
                {socialIcons.map((social, idx) => (
                  <SocialIcon key={idx} social={social} idx={idx} cfg={cfg} globalStyles={globalStyles} resolvedTextColor={resolvedTextColor} blockId={blockId} />
                ))}
              </div>
            )}

            {finalShowContactInfo && (
              <div className="mt-8 opacity-80">
                <StyledText tag="p">{restaurantData.address} • {restaurantData.phone}</StyledText>
              </div>
            )}

            {cfg.showOpeningHours && (
              <div className="mt-12 w-full max-w-2xl mx-auto">
                <StyledText tag="h4" className="text-xl font-bold mb-4 text-center">Opening Hours</StyledText>
                <OpeningHours sortedHoursArray={openingHours} resolvedBtnBg={resolvedBtnBg} bgColor={bgColor} secondaryResolved={secondaryResolved} blockId={blockId} />
              </div>
            )}
          </div>
        )}
        {cfg.variant === "split" && (
          <div className={`mb-12 flex ${isSmall ? 'flex-col' : 'flex-row'} justify-between items-start gap-8`}>
            <div>
              <StyledText
                tag="h3"
                className="mb-4"
                dataControl="footer-company"
                dataBlockId={blockId}
                styleConfig={{
                  ...cfg.companyNameStyle,
                  fontSize: cfg.companyNameStyle?.fontSize || 24,
                  fontWeight: cfg.companyNameStyle?.fontWeight || 700,
                  color: resolveColor(cfg.companyNameStyle?.color || resolvedTextColor, globalStyles),
                  fontFamily: typography?.headingFont,
                }}
              >
                {restaurantData.name}
              </StyledText>
              {finalShowContactInfo && <ContactInfo addr={restaurantData.address} ph={restaurantData.phone} email={restaurantData.email} blockId={blockId} />}
            </div>
            <div className={isSmall ? 'text-left' : 'text-right'}>
              {finalShowSocialLinks && (
                <div className={`flex ${isSmall ? 'justify-start' : 'justify-end'} gap-4 mb-6`} data-control="footer-social" data-block-id={blockId}>
                  {socialIcons.map((social, idx) => (
                    <SocialIcon key={idx} social={social} idx={idx} cfg={cfg} globalStyles={globalStyles} resolvedTextColor={resolvedTextColor} blockId={blockId} />
                  ))}
                </div>
              )}
              {finalShowQuickLinks && (
                <ul className={`space-y-2 text-sm opacity-80 inline-block ${isSmall ? 'text-left' : 'text-right'}`} data-control="footer-links" data-block-id={blockId}>
                  {displayLinks.map((link, index) => (
                    <li key={index}><a href={link.url} className="hover:underline">{link.label}</a></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <div className={`border-t border-white/10 pt-6 flex ${isSmall ? 'flex-col' : 'flex-row'} justify-between items-center text-xs opacity-50`}>
          <StyledText tag="p">&copy; {new Date().getFullYear()} {restaurantData.name}. All rights reserved.</StyledText>
          <div className={`flex gap-4 ${isSmall ? 'mt-2' : 'mt-0'}`}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}