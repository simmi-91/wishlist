import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "./authContext";

const AuthStatusDisplay = () => {
  const { authSession, login, logout } = useAuth();

  return (
    <>
      {authSession ? (
        <div>
          {authSession.user.name}
          <button onClick={() => logout()}>Log out</button>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={(credentialResponse: CredentialResponse) => {
            login(credentialResponse.credential);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
          auto_select={false}
        />
      )}
    </>
  );
};
export default AuthStatusDisplay;
