import { useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import { signOut } from '@/features/popup-slice';
import { AppDispatch } from '@/store';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignOut = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    dispatch(signOut());
    setIsLoading(false);
  };

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
          </div>
        </section>
        <section>
          <button
            className="btn btn-primary w-100"
            onClick={handleSignOut}
          >
            {
              isLoading
                ? (
                  <span
                    className="spinner spinner-border spinner-border-sm"
                  ></span>
                )
                : (
                  <span className="label">Sign Out</span>
                )
            }
          </button>
        </section>
      </div>
    </div>
  );
};