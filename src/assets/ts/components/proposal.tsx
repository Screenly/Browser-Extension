import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/types/store';

import { PopupSpinner } from '@/components/popup-spinner';
import { SaveAuthWarning } from '@/components/save-auth-warning';
import { SaveAuthHelp } from '@/components/save-auth-help';

import { openSettings } from '@/features/popup-slice';
import {
  prepareToAddToScreenly,
  submitAsset,
  setSaveAuthentication,
  setBypassVerification,
} from '@/features/asset';

export const Proposal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isLoading,
    assetTitle,
    assetUrl,
    assetHostname,
    buttonState,
    error,
    bypassVerification,
    saveAuthentication,
    isPollingTakingLong,
  } = useSelector((state: RootState) => state.asset);

  useEffect(() => {
    dispatch(prepareToAddToScreenly());
  }, [dispatch]);

  const handleSettings = (event: React.MouseEvent): void => {
    event.preventDefault();
    dispatch(openSettings());
  };

  const handleSubmission = (event: React.FormEvent): void => {
    event.preventDefault();
    dispatch(submitAsset());
  };

  if (isLoading) {
    return <PopupSpinner />;
  }

  return (
    <div className="page" id="proposal-page">
      <form id="add-it">
        <section>
          <h5 id="title">{assetTitle}</h5>
        </section>
        <section className="bg-light">
          <div className="break-anywhere text-monospace" id="url">
            {assetUrl}
          </div>
        </section>
        <section>
          <div className="form-check">
            <input
              className="form-check-input shadow-none round-checkbox"
              id="with-auth-check"
              type="checkbox"
              checked={saveAuthentication}
              onChange={(e) =>
                dispatch(setSaveAuthentication(e.target.checked))
              }
            />
            <label className="form-check-label" htmlFor="with-auth-check">
              Save Authentication
            </label>
          </div>
          <SaveAuthWarning
            hostname={assetHostname}
            hidden={!saveAuthentication}
          />
          <SaveAuthHelp />
        </section>

        <section id="verification" hidden={!bypassVerification}>
          <div className="form-check">
            <input
              className="form-check-input"
              id="no-verification-check"
              type="checkbox"
              checked={bypassVerification}
              onChange={(e) =>
                dispatch(setBypassVerification(e.target.checked))
              }
            />
            <label className="form-check-label" htmlFor="no-verification-check">
              Bypass Verification
            </label>
          </div>
        </section>

        <section>
          <div className="d-flex">
            <button
              className="btn btn-primary w-100 me-1"
              id="add-it-submit"
              type="submit"
              onClick={handleSubmission}
            >
              <span className="add label" hidden={buttonState !== 'add'}>
                Add to Screenly
              </span>

              <span
                className="spinner-border spinner-border-sm"
                hidden={buttonState !== 'loading'}
              ></span>

              <span className="label update" hidden={buttonState !== 'update'}>
                Update Asset
              </span>
            </button>
            <button className="btn btn-primary" onClick={handleSettings}>
              <i className="bi bi-gear"></i>
            </button>
          </div>
          <div
            className="alert alert-danger mb-0 mt-3"
            id="add-it-error"
            hidden={!error.show}
          >
            {error.message}
          </div>
          <div
            className="alert mt-3 mb-1"
            id="polling-message"
            hidden={!isPollingTakingLong}
          >
            <p className="mb-0">
              This is taking longer than expected. Please wait while we process
              your asset.
            </p>
          </div>
        </section>
      </form>
    </div>
  );
};
