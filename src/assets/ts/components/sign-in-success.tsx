export const SignInSuccess: React.FC = () => {
  return (
    <div className="page" id="success-page">
      <div className="d-flex flex-column">
        <section className="align-items-center d-flex flex-grow-1 justify-content-center">
          <div>
            <div className="mt-4 success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
            <h3 className="text-center">Sign in successful!</h3>
            <p className="text-muted">
              You can now add and update web assets to your Screenly account.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
