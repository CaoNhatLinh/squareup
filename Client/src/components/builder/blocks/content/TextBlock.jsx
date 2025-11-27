import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from '@/components/builder/atoms/StyledText';

export default function TextBlock({ content, alignment = 'left', backgroundColor = 'background', textColor = 'text', globalStyles, blockId }) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const resolvedBg = resolveColor(backgroundColor || (globalStyles?.palette?.background || '#ffffff'), globalStyles) || (backgroundColor || (globalStyles?.palette?.background || '#ffffff'));
  const resolvedText = resolveColor(textColor || (globalStyles?.palette?.text || '#111827'), globalStyles) || (textColor || (globalStyles?.palette?.text || '#111827'));

  return (
    <div 
      className="w-full py-8 px-6"
      style={{ backgroundColor: resolvedBg }}
    >
      <div className={`max-w-4xl mx-auto prose ${alignmentClasses[alignment] || 'text-left'}`}>
        <StyledText
          tag="div"
          dangerouslySetInnerHTML={{ __html: content || '<p>Add your text content here...</p>' }}
          className="text-gray-700"
          dataControl="text-content"
          dataBlockId={blockId}
          styleConfig={{ color: resolvedText }}
        />
      </div>
    </div>
  );
}
