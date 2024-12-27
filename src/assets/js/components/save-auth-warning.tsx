import { useEffect, useState } from 'react';

interface SaveAuthWarningProps {
  hostname: string;
  hidden: boolean;
}

export const SaveAuthWarning: React.FC<SaveAuthWarningProps> = ({ hostname, hidden }) => {
  const [currentHostname, setCurrentHostname] = useState<string>('');

  useEffect(() => {
    setCurrentHostname(hostname);
  }, [hostname]);

  return (
    <div className="mt-2" id="with-auth-check-info" hidden={hidden}>
      <div className="alert alert-warning">
        <p className="mb-0">
          Warning: a determined attacker with physical access to your digital sign could extract these saved credentials for
          <span
            className="break-anywhere text-monospace"
            id="hostname"
          >
            <strong>
              {` ${currentHostname} `}
            </strong>
          </span>
          and gain access to your account.
        </p>
      </div>
    </div>
  );
};