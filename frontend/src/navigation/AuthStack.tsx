import { RegisterScreen } from "../screens/user/RegisterScreen";
import { LoginScreen } from "../screens/user/LoginScreen";
import AllergySelectionScreen from "../screens/user/AllergySelectionScreen";
import CreateHouseholdScreen from "../screens/households/CreateHouseholdScreen";
import MyHouseholdsScreen from "../screens/households/MyHouseholdsScreen";
import type { NewUserParams } from "../api/users/userService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApiError } from "../api/appFetch";

export type AuthStackParamList = {
  Register: { backendError?: ApiError } | undefined;
  Login: undefined;
  Allergies: { user: NewUserParams };
  CreateHousehold: undefined;
  MyHouseholds: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Allergies" component={AllergySelectionScreen} />
      <Stack.Screen name="CreateHousehold" component={CreateHouseholdScreen} />
      <Stack.Screen name="MyHouseholds" component={MyHouseholdsScreen} />
    </Stack.Navigator>
  );
}
