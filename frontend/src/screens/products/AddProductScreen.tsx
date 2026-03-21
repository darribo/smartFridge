import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import type { BarcodeProduct } from "../../api/products/productService";
import { THEME } from "../../theme/theme";
import ExistingProductItemForm from "./ExistingProductItemForm";
import FirstTimeProductForm from "./FirstTimeProductForm";
import { ExistingProduct, styles } from "./AddProductShared";

type Props = NativeStackScreenProps<AuthStackParamList, "AddProduct">;

const toExistingProductSeed = (barcodeProduct?: BarcodeProduct): ExistingProduct | null => {
  if (!barcodeProduct || barcodeProduct.id === null) {
    return null;
  }

  return {
    id: barcodeProduct.id,
    barcode: barcodeProduct.barcode ?? "",
    name: barcodeProduct.name ?? "",
    image: barcodeProduct.image ?? null,
    defaultPrice: barcodeProduct.defaultPrice != null ? String(barcodeProduct.defaultPrice) : null,
    quantity: barcodeProduct.quantity != null ? String(barcodeProduct.quantity) : null,
    unit: barcodeProduct.unit ?? null,
  };
};

export default function AddProductScreen({ navigation, route }: Props) {
  //Se hace la orquestación del flujo y se delega cada formulario a un componente distinto.
  const { t } = useTranslation();
  const householdId = route.params?.householdId ?? 10;
  const barcodeProduct = route.params?.barcodeProduct;
  const existingSeedFromRoute = useMemo(() => toExistingProductSeed(barcodeProduct), [barcodeProduct]);
  const [createdProductSeed, setCreatedProductSeed] = useState<ExistingProduct | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(() => !existingSeedFromRoute);

  useEffect(() => {
    //Se hace la resincronización del modo al cambiar los params de navegación.
    setCreatedProductSeed(null);
    setIsFirstTime(!existingSeedFromRoute);
  }, [existingSeedFromRoute]);

  const selectedProductSeed = createdProductSeed ?? existingSeedFromRoute;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("addProduct.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.question}>{t("addProduct.firstTimeQuestion")}</Text>

        <View style={styles.segmentedWrap}>
          <Pressable
            style={[styles.segmentBtn, isFirstTime && styles.segmentBtnActive]}
            onPress={() => setIsFirstTime(true)}
          >
            <Text style={[styles.segmentText, isFirstTime && styles.segmentTextActive]}>
              {t("addProduct.firstTimeYes")}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, !isFirstTime && styles.segmentBtnActive]}
            onPress={() => setIsFirstTime(false)}
          >
            <Text style={[styles.segmentText, !isFirstTime && styles.segmentTextActive]}>
              {t("addProduct.firstTimeNo")}
            </Text>
          </Pressable>
        </View>

        {isFirstTime ? (
          <FirstTimeProductForm
            householdId={householdId}
            barcodeProduct={barcodeProduct}
            onCreated={(product) => {
              setCreatedProductSeed(product);
              setIsFirstTime(false);
            }}
            onScanPress={() => navigation.replace("ScanProduct", { householdId })}
            onBarcodeLoaded={(found) => {
              setCreatedProductSeed(toExistingProductSeed(found));
              setIsFirstTime(false);
            }}
          />
        ) : (
          <ExistingProductItemForm
            householdId={householdId}
            selectedProductSeed={selectedProductSeed}
            onCompleted={() => navigation.goBack()}
          />
        )}

        <Pressable onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{t("addProduct.actions.cancel")}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
