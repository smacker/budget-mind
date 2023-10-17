import Button from '@mui/material/Button';

import { useStore } from '@nanostores/react';
import { $readyToLogin, login } from './google';

// TODO: add error handling here eventually
export function Login() {
  const readyToLogin = useStore($readyToLogin);

  return (
    <div>
      <Button
        variant="contained"
        disabled={!readyToLogin}
        onClick={() => login()}
      >
        Sign in with Google
      </Button>
    </div>
  );
}
