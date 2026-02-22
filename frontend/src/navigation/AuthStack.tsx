import { RegisterScreen } from "../screens/user/RegisterScreen";
import { LoginScreen } from "../screens/user/LoginScreen";
import AllergySelectionScreen from "../screens/user/AllergySelectionScreen";
import CreateHouseholdScreen from "../screens/households/CreateHouseholdScreen";
import MyHouseholdsScreen from "../screens/households/MyHouseholdsScreen";
import HouseholdDetailScreen from "../screens/households/HouseholdDetailScreen";
import UpdateHouseholdScreen from "../screens/households/UpdateHouseholdScreen";
import type { NewUserParams } from "../api/users/userService";
import type { Household } from "../api/households/householdService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApiError } from "../api/appFetch";

export type AuthStackParamList = {
  Register: { backendError?: ApiError } | undefined;
  Login: undefined;
  Allergies: { user: NewUserParams };
  CreateHousehold: undefined;
  UpdateHousehold: { household: Household };
  MyHouseholds: undefined;
  HouseholdDetail: { householdId: number };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Allergies" component={AllergySelectionScreen} />
      <Stack.Screen name="CreateHousehold" component={CreateHouseholdScreen} />
      <Stack.Screen name="UpdateHousehold" component={UpdateHouseholdScreen} />
      <Stack.Screen name="MyHouseholds" component={MyHouseholdsScreen} />
      <Stack.Screen name="HouseholdDetail">
        {({ route, navigation }) => (
          <HouseholdDetailScreen
            householdId={route.params.householdId}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
