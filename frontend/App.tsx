import "./src/i18n/i18n";

import { init, setReauthenticationCallback, removeServiceToken } from "./src/api/appFetch";
import { AuthStack } from "./src/navigation/AuthStack";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  //Inicializa handler global de errores
  init(() => {});

  //Si el backend devuelve 401: Borrar token (logout técnico)
  setReauthenticationCallback(() => {
    removeServiceToken();
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
