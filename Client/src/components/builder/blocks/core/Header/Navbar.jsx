import StyledText from '@/components/builder/atoms/StyledText';
import { resolveColor } from '@/components/builder/utils/colorUtils';

export default function Navbar({ links = [], navGap = 24, navigation = {}, globalStyles = {}, blockId, mobile = false, isMobileView = false }) {
  // If mobile prop is true, we are rendering the mobile menu (vertical list).
  // If mobile prop is false, we are rendering the desktop navbar.

  // Logic:
  // 1. If mobile={true}, this is the dropdown menu. It should always be flex-col.
  //    Its visibility is controlled by the parent (Header) based on menuOpen state.
  //    However, previously it had 'md:hidden' to ensure it doesn't show on desktop.
  //    Now we rely on parent's conditional rendering or just use isMobileView to hide it if accidentally rendered?
  //    Actually, parent uses {menuOpen && isMobileView && ...} so we are safe.

  // 2. If mobile={false}, this is the desktop navbar.
  //    It should be hidden if isMobileView is true.
  //    It should be flex if isMobileView is false.

  const containerClass = mobile
    ? 'flex flex-col' // Mobile menu: always flex col. Parent controls visibility.
    : isMobileView ? 'hidden' : 'flex items-center'; // Desktop menu: hidden on mobile view.

  return (
    <nav data-control="nav-container" data-block-id={blockId} className={containerClass} style={mobile ? {} : { gap: `${navGap}px` }}>
      {links.map((link, i) => {
        const color = link.color || navigation?.color || globalStyles?.colors?.text;
        const fontSize = link.fontSize ?? navigation?.fontSize ?? 14;
        const isBold = link.bold ?? navigation?.bold ?? false;
        const fontWeight = isBold ? 700 : (link.fontWeight ?? navigation?.fontWeight ?? 600);
        const fontFamily = link.fontFamily ?? globalStyles?.typography?.bodyFont;
        const isItalic = link.italic ?? navigation?.italic ?? false;
        const isUnderline = link.underline ?? navigation?.underline ?? false;

        const inlineStyle = {
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: isUnderline ? 'underline' : 'none'
        };

        const itemSpacingStyle = !mobile && link.spacing ? { marginRight: `${link.spacing}px` } : {};

        return (
          <a key={i} href={link.url} data-control={`nav-${i}`} data-block-id={blockId} className={`transition-opacity hover:opacity-70 ${mobile ? 'px-4 py-2 border-b last:border-b-0' : ''}`} style={{ ...itemSpacingStyle, color: resolveColor(color, globalStyles) }}>
            <StyledText
              tag="span"
              dataControl={`nav-${i}`}
              dataBlockId={blockId}
              className="inline-block"
              styleConfig={{ fontSize, fontWeight, fontFamily, inlineStyle }}
            >
              {link.label}
            </StyledText>
          </a>
        );
      })}
    </nav>
  );
}
