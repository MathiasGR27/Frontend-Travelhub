import AsyncStorage from '@react-native-async-storage/async-storage';

//const TOKEN_KEY = 'travelhub_token';

export const saveToken = async (token) => {
  await AsyncStorage.setItem("token", token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const removeToken = async () => {
  await AsyncStorage.removeItem("token");
};