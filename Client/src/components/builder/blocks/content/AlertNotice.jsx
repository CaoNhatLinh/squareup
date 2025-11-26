import { HiInformationCircle, HiExclamation, HiExclamationCircle } from 'react-icons/hi';
import StyledText from "@/components/builder/atoms/StyledText";

export default function AlertNoticeBlock({ message, type = 'info', isActive = true, globalStyles, blockId }) {
  if (!isActive) return null;

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return { 
          bg: 'bg-orange-50', 
          border: 'border-orange-200', 
          textColor: '#9a3412', 
          icon: HiExclamation 
        };
      case 'error':
        return { 
          bg: 'bg-red-50', 
          border: 'border-red-200', 
          textColor: '#991b1b', 
          icon: HiExclamationCircle 
        };
      case 'info':
      default:
        return { 
          bg: 'bg-blue-50', 
          border: 'border-blue-200', 
          textColor: '#1e40af', 
          icon: HiInformationCircle 
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div className={`w-full px-4 py-3 border-b ${styles.bg} ${styles.border}`} id={blockId} data-block-id={blockId} data-control="container">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Icon className="w-5 h-5" style={{ color: styles.textColor }} />
        <StyledText
          tag="p"
          className="text-sm font-medium"
          styleConfig={{ 
            fontFamily: globalStyles?.typography?.bodyFont,
            color: styles.textColor
          }}
          dataControl="alert-message"
          dataBlockId={blockId}
        >
          {message}
        </StyledText>
      </div>
    </div>
  );
}
