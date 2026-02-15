import { RegisterScreen } from "../screens/user/RegisterScreen";
import AllergySelectionScreen from "../screens/user/AllergySelectionScreen";
import type { NewUserParams } from "../api/users/userService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApiError } from "../api/appFetch";

export type AuthStackParamList = {
  Register: { backendError?: ApiError } | undefined;
  Allergies: { user: NewUserParams };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Allergies" component={AllergySelectionScreen} />
    </Stack.Navigator>
  );
}
