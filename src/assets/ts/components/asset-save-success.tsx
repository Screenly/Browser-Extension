interface SuccessProps {
  assetDashboardLink: string;
}

import { CheckMark } from '@/components/check-mark';
import { useDispatch } from 'react-redux';
import { navigateToProposal } from '@/utils/navigation';

export const AssetSaveSuccess: React.FC<SuccessProps> = ({
  assetDashboardLink,
}) => {
  const dispatch = useDispatch();

  const openAssetDashboard = (): void => {
    window.open(assetDashboardLink);
  };

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
            <h3 className="text-center">Web page saved!</h3>
            <p className="text-muted">
              To show the web page on your digital sign, add the web asset to a
              playlist in your Screenly account.
            </p>
          </div>
        </section>
        <section>
          <div className="d-flex">
            <button
              className="btn btn-primary w-100 me-1"
              onClick={openAssetDashboard}
            >
              <span className="label">View Asset</span>
            </button>
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center"
              onClick={handleHomeButtonClick}
            >
              <i className="bi bi-house-fill"></i>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
