import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/AuthStack";
import { useTranslation } from "react-i18next";
import { useHouseholdStore } from "../../store/householdStore";
import { useCallback, useRef, useState } from "react";
import { getProductByBarcode } from "../../api/products/productService";
import { THEME } from "../../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Pressable, ActivityIndicator, Text, StyleSheet, Linking } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<AuthStackParamList, "ScanProduct">;
const isLikelyBarcode = (value: string) => /^\d{8,14}$/.test(value);

export default function ScanProductScreen({ navigation, route }: Props) {
  //Se hace la inicialización de permisos, estados de cámara y control de errores.
  const { t } = useTranslation();
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);
  const householdId = route.params?.householdId ?? currentHouseholdId;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const handledRef = useRef(false);

  const onBarcodeScanned = useCallback(({ data }: { data: string }) => {
    //Se hace el bloqueo de re-disparos para evitar múltiples peticiones por el mismo escaneo.

    if (handledRef.current || isProcessing || paused) return;
    
    handledRef.current = true;
    setIsProcessing(true);
    setGlobalErrors([]);

    const barcode = data?.trim();

    if (!barcode || !isLikelyBarcode(barcode)) {
      //Se hace el descarte de lecturas no válidas sin mostrar error para no ensuciar la UX.
      handledRef.current = false;
      setIsProcessing(false);
      return;
    }

    getProductByBarcode(
        householdId,
        barcode,
        (product) => {
          //Se hace la navegación al formulario de alta con los datos del producto resuelto.
          navigation.replace("AddProduct", { householdId, barcodeProduct: product });
        },
        (err) => {
          //Se hace la traducción del error backend a mensajes de UI y se pausa el escaneo.
          const has404 = (err.globalErrors ?? []).some((m) => m.includes("404"));
          if (has404) {
            setGlobalErrors([t("scanProduct.errors.notFound")]);
          } else if (err.globalErrors?.length) {
            setGlobalErrors(err.globalErrors);
          } else {
            setGlobalErrors([t("scanProduct.errors.default")]);
          }
          setPaused(true);
          setIsProcessing(false);
        }
      );
    },
    [householdId, isProcessing, navigation, paused, t]
  );
  const onRetry = () => {
    //Se hace el reseteo completo de flags para volver a escanear.
    handledRef.current = false;
    setPaused(false);
    setIsProcessing(false);
    setGlobalErrors([]);
  };

  const onToggleCamera = () => {
    //Se hace el cambio de cámara frontal/trasera.
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!permission) return <SafeAreaView style={styles.safe} />;

  //En caso de no tener permisos, se muestra una pantalla explicativa con opción a solicitar permisos o abrir configuración.
  if (!permission?.granted) {
    const canAskAgain = permission?.canAskAgain ?? true;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionWrap}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconWrap}>
              <MaterialCommunityIcons name="camera-outline" size={30} color={THEME.primary} />
            </View>
            <Text style={styles.permissionTitle}>{t("scanProduct.permission.title")}</Text>
            <Text style={styles.permissionDescription}>{t("scanProduct.permission.description")}</Text>

            {canAskAgain ? (
              <Pressable style={styles.primaryBtn} onPress={requestPermission}>
                <Text style={styles.primaryBtnText}>{t("scanProduct.permission.cta")}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primaryBtn} onPress={() => Linking.openSettings()}>
                <Text style={styles.primaryBtnText}>{t("scanProduct.permission.openSettings")}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("scanProduct.title")}</Text>
        <Pressable onPress={onToggleCamera} hitSlop={10}>
          <MaterialCommunityIcons name="camera-flip-outline" size={26} color={THEME.text} />
        </Pressable>
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={paused ? undefined : onBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"],
          }}
        />

        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.subtitle}>{t("scanProduct.subtitle")}</Text>

        {isProcessing ? <ActivityIndicator color={THEME.primary} /> : null}
        {globalErrors.length > 0 ? <GlobalErrorBox messages={globalErrors} /> : null}

        <Pressable
          style={[styles.secondaryBtn, isProcessing && styles.secondaryBtnDisabled]}
          onPress={() => navigation.replace("AddProduct", { householdId })}
          disabled={isProcessing}
        >
          <Text style={styles.secondaryBtnText}>{t("scanProduct.actions.addManually")}</Text>
        </Pressable>

        {paused && (
          <Pressable style={styles.primaryBtn} onPress={onRetry}>
            <Text style={styles.primaryBtnText}>{t("scanProduct.actions.retry")}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  header: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: THEME.text },
  cameraWrap: { flex: 1, position: "relative" },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#2BEE7C",
    backgroundColor: "transparent",
  },
  bottom: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: THEME.bg,
  },
  title: { fontSize: 18, fontWeight: "800", color: THEME.text },
  subtitle: { fontSize: 14, color: THEME.muted, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  permissionWrap: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.bg,
  },
  permissionCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 14,
    alignItems: "center",
  },
  permissionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
    textAlign: "center",
  },
  permissionDescription: {
    fontSize: 14,
    color: THEME.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: "#2BEE7C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    alignSelf: "center",
    maxWidth: "88%",
  },
  primaryBtnText: {
    fontWeight: "800",
    color: "#102218",
    fontSize: 16,
    textAlign: "center",
    flexShrink: 1,
  },
  secondaryBtn: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnDisabled: { opacity: 0.4 },
  secondaryBtnText: { fontWeight: "700", color: THEME.text, fontSize: 15 },
});
