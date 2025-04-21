import { CheckMark } from './check-mark';
import { useDispatch } from 'react-redux';
import { navigateToProposal } from '@/utils/navigation';
import { useState } from 'react';
import { handleSignOut } from '@/utils/auth';
import { HomeIcon } from '@/components/home-icon';

export const SignInSuccess: React.FC = () => {
  const dispatch = useDispatch();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  const handleHomeButtonClick = (): void => {
    navigateToProposal(dispatch);
  };

  return (
    <div className="page" id="success-page">
      <div className="d-flex flex-column">
        <section className="align-items-center d-flex flex-grow-1 justify-content-center">
          <div>
            <div className="d-flex justify-content-center align-items-center">
              <CheckMark />
            </div>
            <h3 className="text-center">Sign in successful!</h3>
            <p className="text-muted">
              You can now{' '}
              <a className="btn-link" onClick={handleHomeButtonClick}>
                add and update web assets
              </a>{' '}
              to your Screenly account.
            </p>
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
              <HomeIcon width={16} height={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
