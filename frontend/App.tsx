import { RegisterScreen } from "./src/screens/user/RegisterScreen";
import "./src/i18n/i18n";

import { init, setReauthenticationCallback, removeServiceToken } from "./src/api/appFetch";

export default function App() {
  //Inicializa handler global de errores
  init(() => {});

  //Si el backend devuelve 401: Borrar token (logout técnico)
  setReauthenticationCallback(() => {
    removeServiceToken();
  });

  return (
   <RegisterScreen />
  );
}
