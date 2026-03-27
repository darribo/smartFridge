import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { THEME } from "../../theme/theme";
import { FormLabel } from "../FormLabel";

type DatePickerFieldProps = {
  label: string;
  value: Date | null;
  onChange: (next: Date | null) => void;
  placeholder: string;
  errorText?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  initialPickerDate?: Date;
  clearable?: boolean;
};

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder,
  errorText,
  minimumDate,
  maximumDate,
  initialPickerDate,
  clearable = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
      setOpen(false);
      return;
    }

    if (Platform.OS !== "ios") {
      setOpen(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <FormLabel text={label} />

      <Pressable style={[styles.input, !!errorText && styles.inputError]} onPress={() => setOpen(true)}>
        <MaterialCommunityIcons name="calendar-outline" size={20} color={THEME.muted} />
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        {clearable && value ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
            hitSlop={8}
            accessibilityLabel={label}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={THEME.muted} />
          </Pressable>
        ) : null}
      </Pressable>

      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

      {open ? (
        <DateTimePicker
          value={value ?? initialPickerDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FCFA",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputError: {
    borderColor: "#E53935",
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: THEME.text,
  },
  placeholder: {
    color: THEME.muted,
  },
  clearButton: {
    marginLeft: 6,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: "#E53935",
  },
});
