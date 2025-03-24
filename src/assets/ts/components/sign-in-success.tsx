import { Checkmark } from './Checkmark';

export const SignInSuccess: React.FC = () => {
  return (
    <div className="page" id="success-page">
      <div className="d-flex flex-column">
        <section className="align-items-center d-flex flex-grow-1 justify-content-center">
          <div>
            <div className="d-flex justify-content-center align-items-center">
              <Checkmark />
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
