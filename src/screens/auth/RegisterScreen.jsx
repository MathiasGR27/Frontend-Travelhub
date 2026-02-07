import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { register } from '../../services/auth.service';

export default function RegisterScreen({ navigation }) {
  const handleRegister = async () => {
    try {
      await register({
        nombre: 'Usuario Demo',
        email: 'demo@travelhub.com',
        password: '123456',
      });
      navigation.navigate('Login');
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput placeholder="Nombre" style={styles.input} />
      <TextInput placeholder="Correo" style={styles.input} />
      <TextInput placeholder="Contraseña" secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}