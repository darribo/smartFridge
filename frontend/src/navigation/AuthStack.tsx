import { RegisterScreen } from "../screens/user/RegisterScreen";
import { LoginScreen } from "../screens/user/LoginScreen";
import AllergySelectionScreen from "../screens/user/AllergySelectionScreen";
import ProfilePhotoScreen from "../screens/user/ProfilePhotoScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import ChangePasswordScreen from "../screens/user/ChangePasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateHouseholdScreen from "../screens/households/CreateHouseholdScreen";
import MyHouseholdsScreen from "../screens/households/MyHouseholdsScreen";
import HouseholdDetailScreen from "../screens/households/HouseholdDetailScreen";
import UpdateHouseholdScreen from "../screens/households/UpdateHouseholdScreen";
import type { NewUserParams } from "../api/users/userService";
import type { Household } from "../api/households/householdService";
import type { BarcodeProduct } from "../api/products/productService";
import type { NewRecipeParams } from "../api/recipes/recipeService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApiError } from "../api/appFetch";
import AddProductScreen from "../screens/products/AddProductScreen";
import ScanProductScreen from "../screens/products/ScanProductScreen";
import MyProductsScreen from "../screens/products/MyProductsScreen";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import EditProductScreen from "../screens/products/EditProductScreen";
import ProductLocationSelectorScreen from "../screens/products/ProductLocationSelectorScreen";
import ExpiringProductsScreen from "../screens/products/ExpiringProductsScreen";
import LittleStockScreen from "../screens/products/LittleStockScreen";
import AddRecipeScreen from "../screens/recipes/AddRecipeScreen";
import MyRecipesScreen from "../screens/recipes/MyRecipes";
import RecipeDetailScreen from "../screens/recipes/RecipeDetailScreen";
import ShoppingListScreen from "../screens/shoppingList/ShoppingListScreen";
import AddShoppingItemScreen from "../screens/shoppingList/AddShoppingItemScreen";

export type AuthStackParamList = {
  Register: { backendError?: ApiError } | undefined;
  Login: undefined;
  Allergies: { user: NewUserParams };
  ProfilePhoto: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Home: undefined;
  CreateHousehold: undefined;
  UpdateHousehold: { household: Household };
  MyHouseholds: undefined;
  HouseholdDetail: { householdId: number };
  AddProduct: { householdId: number; barcodeProduct?: BarcodeProduct; initialItemCount?: number } | undefined;
  ScanProduct: { householdId: number };
  ProductLocationSelector: undefined;
  MyProducts: { storageFilter: "ALL" | "PANTRY" | "FRIDGE" | "FREEZER" } | undefined;
  ExpiringProducts: undefined;
  LittleStockProducts: undefined;
  ProductDetail: { productId: number };
  AddRecipe: { householdId?: number; initialRecipe?: NewRecipeParams; recipeId?: number } | undefined;
  EditProduct: { productId: number };
  MyRecipes: undefined;
  RecipeDetail: { recipeId: number };
  ShoppingList: undefined;
  AddShoppingItem: { listId: number };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ProfilePhoto" component={ProfilePhotoScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} />
      <Stack.Screen name="MyRecipes" component={MyRecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
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
      <Stack.Screen name="LittleStockProducts" component={LittleStockScreen} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen name="AddShoppingItem" component={AddShoppingItemScreen} />
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
