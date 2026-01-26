import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "./authContext";
import { Button } from "react-bootstrap";

const AuthStatusDisplay = () => {
  const { authSession, login, logout } = useAuth();

  return (
    <>
      {authSession ? (
        <span>
          <span className="text-light pe-2">{authSession.user.name}</span>
          <Button onClick={() => logout()} size="sm">
            Log out
          </Button>
        </span>
      ) : (
        <GoogleLogin
          onSuccess={(credentialResponse: CredentialResponse) => {
            login(credentialResponse.credential);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
          auto_select={false}
          theme={"outline"}
        />
      )}
    </>
  );
};
export default AuthStatusDisplay;
