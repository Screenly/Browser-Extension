import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import { AppDispatch } from '@/store';
import { getUserData, getUser } from '@/main';
import { PopupSpinner } from '@/components/popup-spinner';
import { navigateToProposal } from '@/utils/navigation';
import { handleSignOut } from '@/utils/auth';
import { HomeIcon } from '@/components/home-icon';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);

  const setUserData = async (): Promise<void> => {
    setIsViewLoading(true);

    const { token } = await getUser();

    try {
      const userData = await getUserData({ token });
      setFirstName(userData.first_name);
      setLastName(userData.last_name);
      setEmail(userData.email);
    } catch {
      setFirstName('');
      setLastName('');
      setEmail('');
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    setUserData();
  }, []);

  const handleHomeButtonClick = (): void => {
    navigateToProposal(dispatch);
  };

  if (isViewLoading) {
    return <PopupSpinner />;
  }

  return (
    <div className="page mt-3" id="success-page">
      <div className="d-flex flex-column">
        <section
          className={classNames(
            'align-items-center',
            'd-flex',
            'flex-grow-1',
            'justify-content-center',
            'border-bottom-0',
          )}
        >
          <div>
            <h3 className="text-center">
              You are already
              <br />
              signed in
            </h3>

            {(firstName || lastName || email) && (
              <p className="text-muted">
                You are signed in as{' '}
                <strong>
                  {firstName && lastName
                    ? `${firstName} ${lastName}`
                    : email
                      ? `${email}`
                      : `${firstName || lastName || ''}`}
                </strong>
                .
              </p>
            )}
          </div>
        </section>
        <section>
          <div className="d-flex">
            <button
              className="btn btn-primary w-100 me-1"
              onClick={(e) => handleSignOut(e, dispatch, setIsButtonLoading)}
            >
              {isButtonLoading ? (
                <span className="spinner spinner-border spinner-border-sm"></span>
              ) : (
                <span className="label">Sign Out</span>
              )}
            </button>
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center"
              onClick={handleHomeButtonClick}
            >
              <HomeIcon />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
