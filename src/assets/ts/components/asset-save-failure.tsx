import { XMark } from '@/components/x-mark';

export const AssetSaveFailure: React.FC = () => {
  return (
    <div className="page" id="failure-page">
      <div className="d-flex flex-column">
        <section className="align-items-center d-flex flex-grow-1 justify-content-center">
          <div>
            <div className="d-flex justify-content-center align-items-center">
              <XMark />
            </div>
            <h3 className="text-center">Failed to save web page</h3>
            <p className="text-muted">
              The web page you are trying to save might not be supported or
              there was an error saving the web page. Please try again.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
