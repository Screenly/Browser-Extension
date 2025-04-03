import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import { signOut } from '@/features/popup-slice';
import { AppDispatch } from '@/store';
import { getCompany, getUser } from '@/main';
import { PopupSpinner } from '@/components/popup-spinner';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);

  const getCompanyData = async (): Promise<void> => {
    setIsViewLoading(true);

    const { token } = await getUser();

    try {
      const company = await getCompany({ token });
      setCompanyName(company);
    } catch {
      setCompanyName('');
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    getCompanyData();
  }, []);

  const handleSignOut = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.preventDefault();
    setIsButtonLoading(true);
    dispatch(signOut());
    setIsButtonLoading(false);
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

            {companyName && (
              <p className="text-muted">
                You are signed in as a member of <strong>{companyName}</strong>.
              </p>
            )}
          </div>
        </section>
        <section>
          <button className="btn btn-primary w-100" onClick={handleSignOut}>
            {isButtonLoading ? (
              <span className="spinner spinner-border spinner-border-sm"></span>
            ) : (
              <span className="label">Sign Out</span>
            )}
          </button>
        </section>
      </div>
    </div>
  );
};
