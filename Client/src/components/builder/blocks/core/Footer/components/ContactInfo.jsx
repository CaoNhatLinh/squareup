import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const ContactInfo = ({ addr, ph, email, blockId }) => (
  <div data-control="footer-contact" data-block-id={blockId} className="space-y-3 text-sm opacity-90">
    <div className="flex items-start gap-3">
      <FaMapMarkerAlt className="w-4 h-4 mt-1 flex-shrink-0" />
      <span>{addr}</span>
    </div>
    <div className="flex items-center gap-3">
      <FaPhoneAlt className="w-4 h-4 flex-shrink-0" />
      <span>{ph}</span>
    </div>
    <div className="flex items-center gap-3">
      <FaEnvelope className="w-4 h-4 flex-shrink-0" />
      <span>{email}</span>
    </div>
  </div>
);

export default ContactInfo;