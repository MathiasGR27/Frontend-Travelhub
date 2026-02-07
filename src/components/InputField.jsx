import { View, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../styles/constants/colors";

export default function InputField({ placeholder, value, onChangeText, secureTextEntry = false }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textGray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.black,
  },
});