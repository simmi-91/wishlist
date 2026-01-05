import Spinner from "react-bootstrap/Spinner";

type SpinnerSize = "sm" | "lg";
type SpinnerDisplay = "row" | "column";
type SpinnerColors =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";

const Loading = ({
  text,
  color,
  scale,
  display,
}: {
  text?: string;
  color?: SpinnerColors;
  scale?: SpinnerSize;
  display?: SpinnerDisplay;
}) => {
  const displayClass = display ? `flex-${display}` : "flex-column";

  return (
    <div className={`d-flex ${displayClass} align-items-center text-${color}`}>
      <Spinner
        animation="border"
        role="status"
        variant={color ? color : "primary"}
        size={scale === "sm" ? "sm" : undefined}
        className="m-2"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {text && <div>{text}</div>}
    </div>
  );
};

export default Loading;
