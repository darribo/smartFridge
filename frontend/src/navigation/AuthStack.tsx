import { RegisterScreen } from "../screens/user/RegisterScreen";
import { LoginScreen } from "../screens/user/LoginScreen";
import AllergySelectionScreen from "../screens/user/AllergySelectionScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateHouseholdScreen from "../screens/households/CreateHouseholdScreen";
import MyHouseholdsScreen from "../screens/households/MyHouseholdsScreen";
import HouseholdDetailScreen from "../screens/households/HouseholdDetailScreen";
import UpdateHouseholdScreen from "../screens/households/UpdateHouseholdScreen";
import type { NewUserParams } from "../api/users/userService";
import type { Household } from "../api/households/householdService";
import type { BarcodeProduct } from "../api/products/productService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApiError } from "../api/appFetch";
import AddProductScreen from "../screens/products/AddProductScreen";
import ScanProductScreen from "../screens/products/ScanProductScreen";
import MyProductsScreen from "../screens/products/MyProductsScreen";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import EditProductScreen from "../screens/products/EditProductScreen";
import ProductLocationSelectorScreen from "../screens/products/ProductLocationSelectorScreen";
import ExpiringProductsScreen from "../screens/products/ExpiringProductsScreen";
import AddRecipeScreen from "../screens/recipes/AddRecipeScreen";
import MyRecipesScreen from "../screens/recipes/MyRecipes";

export type AuthStackParamList = {
  Register: { backendError?: ApiError } | undefined;
  Login: undefined;
  Allergies: { user: NewUserParams };
  Home: undefined;
  CreateHousehold: undefined;
  UpdateHousehold: { household: Household };
  MyHouseholds: undefined;
  HouseholdDetail: { householdId: number };
  AddProduct: { householdId: number; barcodeProduct?: BarcodeProduct } | undefined;
  ScanProduct: { householdId: number };
  ProductLocationSelector: undefined;
  MyProducts: { storageFilter: "ALL" | "PANTRY" | "FRIDGE" | "FREEZER" } | undefined;
  ExpiringProducts: undefined;
  ProductDetail: { productId: number };
  AddRecipe: { householdId: number } | undefined;
  EditProduct: { productId: number };
  MyRecipes: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} />
      <Stack.Screen name="MyRecipes" component={MyRecipesScreen} />
      <Stack.Screen name="Allergies" component={AllergySelectionScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateHousehold" component={CreateHouseholdScreen} />
      <Stack.Screen name="UpdateHousehold" component={UpdateHouseholdScreen} />
      <Stack.Screen name="MyHouseholds" component={MyHouseholdsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="ScanProduct" component={ScanProductScreen} />
      <Stack.Screen name="ProductLocationSelector" component={ProductLocationSelectorScreen} />
      <Stack.Screen name="MyProducts" component={MyProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="ExpiringProducts" component={ExpiringProductsScreen} />
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
