import React from 'react';
import { useEffect, useState } from 'react';

export const SaveAuthWarning = (props) => {
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    setHostname(props.hostname);
  });

  return (
      <div class='mt-2' id='with-auth-check-info' hidden={props.hidden}>
        <div class='alert alert-warning'>
          <p class='mb-0'>
            Warning: a determined attacker with physical access to your digital sign could extract these saved credentials for
            <span
              class='break-anywhere text-monospace'
              id='hostname'
            >
              <strong>
                {` ${hostname} `}
              </strong>
            </span>

            and gain access to your account.
          </p>
        </div>
      </div>
  );
};
