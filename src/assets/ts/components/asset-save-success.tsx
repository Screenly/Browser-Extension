interface SuccessProps {
  assetDashboardLink: string;
}

import { Checkmark } from './Checkmark';

export const AssetSaveSuccess: React.FC<SuccessProps> = ({
  assetDashboardLink,
}) => {
  const openAssetDashboard = () => {
    window.open(assetDashboardLink);
  };

  return (
    <div className="page" id="success-page">
      <div className="d-flex flex-column">
        <section className="align-items-center d-flex flex-grow-1 justify-content-center">
          <div>
            <div className="d-flex justify-content-center align-items-center">
              <Checkmark />
            </div>
            <h3 className="text-center">Web page saved!</h3>
            <p className="text-muted">
              To show the web page on your digital sign, add the web asset to a
              playlist in your Screenly account.
            </p>
          </div>
        </section>
        <section>
          <button
            className="btn btn-primary w-100"
            onClick={openAssetDashboard}
          >
            <span className="label">View Asset</span>
          </button>
        </section>
      </div>
    </div>
  );
};
