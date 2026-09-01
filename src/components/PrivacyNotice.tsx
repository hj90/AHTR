import { ShieldCheck } from 'lucide-react';

interface PrivacyNoticeProps {
  variant?: 'compact' | 'strong';
}

export function PrivacyNotice({ variant = 'compact' }: PrivacyNoticeProps) {
  return (
    <div className={`privacy-notice privacy-notice--${variant}`}>
      <ShieldCheck aria-hidden="true" size={18} />
      <p>
        Information entered here is processed in this browser to create the PDF.
        This prototype does not save the information you enter or the completed PDF.
      </p>
    </div>
  );
}
