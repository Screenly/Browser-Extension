export const PopupSpinner: React.FC = () => {
  return (
    <div
      className="page"
      id="working-page"
      style={{
        height: '300px',
      }}
    >
      <div className="align-items-center d-flex h-100 justify-content-center">
        <div className="spinner spinner-border">
          <span className="sr-only"></span>
        </div>
      </div>
    </div>
  );
};