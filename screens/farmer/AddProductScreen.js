import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useApp } from '../../context/AppContext';
import { productsApi } from '../../services/api';

const CATEGORIES = ['milk', 'curd', 'paneer', 'butter', 'ghee', 'cream'];
const UNITS = ['litre', 'kg', '500g', '200ml', 'packet', 'piece'];

export default function AddProductScreen({ navigation, route }) {
  const { showToast } = useApp();
  const isEditing = route.params?.isEditing || false;
  const existing = route.params?.product;

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [price, setPrice] = useState(existing?.price?.toString() || '');
  const [stock, setStock] = useState(existing?.stock?.toString() || '');
  const [unit, setUnit] = useState(existing?.unit || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [discount, setDiscount] = useState(existing?.discount?.toString() || '0');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(existing?.image || null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !category || !price || !unit || !stock) {
      showToast('Please fill all required fields!', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isEditing && existing?.id) {
        await productsApi.update(existing.id, {
          name, categoryId: category, description,
          price: Number(price), unit, stock: Number(stock),
          discount: Number(discount || 0),
          imageUrl: image,
          tags: [],
        });
        showToast('Product updated! ✅');
      } else {
        await productsApi.add({
          name, categoryId: category, description,
          price: Number(price), unit, stock: Number(stock),
          discount: Number(discount || 0),
          imageUrl: image,
          tags: [],
        });
        showToast('Product added! 🎉');
      }
      navigation.goBack();
    } catch (e) {
      showToast(e.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-gray-800 font-bold text-xl">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image picker */}
        <TouchableOpacity
          onPress={pickImage}
          className="bg-white rounded-2xl h-40 items-center justify-center mb-5 border-2 border-dashed border-green-300"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full rounded-2xl" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="camera-outline" size={32} color="#16a34a" />
              </View>
              <Text className="text-green-600 font-semibold">Tap to add product photo</Text>
              <Text className="text-gray-400 text-xs mt-1">JPG, PNG up to 5MB</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form card */}
        <View className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-gray-700 font-bold mb-4">Product Details</Text>

          <InputField
            label="Product Name *"
            placeholder="e.g. Fresh A2 Cow Milk"
            value={name}
            onChangeText={setName}
            icon="cube-outline"
          />

          {/* Category selector */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 text-sm">Category *</Text>
            <View className="flex-row flex-wrap -mx-1">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`m-1 px-4 py-2 rounded-xl border-2 ${
                    category === cat ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`capitalize font-semibold text-sm ${
                    category === cat ? 'text-white' : 'text-gray-600'
                  }`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row space-x-3">
            <View className="flex-1">
              <InputField
                label="Price (₹) *"
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                icon="pricetag-outline"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Discount (%)"
                placeholder="0"
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                icon="cut-outline"
              />
            </View>
          </View>

          {/* Unit selector */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 text-sm">Unit *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  className={`mr-2 px-4 py-2 rounded-xl border-2 ${
                    unit === u ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-semibold text-sm ${unit === u ? 'text-white' : 'text-gray-600'}`}>{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <InputField
            label="Stock Quantity *"
            placeholder="Available quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            icon="layers-outline"
          />

          <InputField
            label="Description"
            placeholder="Describe your product quality, method, freshness..."
            value={description}
            onChangeText={setDescription}
            icon="document-text-outline"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Tips */}
        <View className="bg-green-50 rounded-2xl p-4 mb-5 flex-row">
          <Ionicons name="bulb-outline" size={20} color="#16a34a" />
          <View className="flex-1 ml-3">
            <Text className="text-green-800 font-semibold text-sm">Pro Tips</Text>
            <Text className="text-green-600 text-xs mt-1 leading-relaxed">
              • Add a clear, well-lit photo for 3x more sales{'\n'}
              • Mention certifications like "Organic" or "A2" to attract buyers{'\n'}
              • Keep stock updated to avoid order cancellations
            </Text>
          </View>
        </View>

        <PrimaryButton
          title={isEditing ? 'Update Product ✅' : 'Add Product 🎉'}
          onPress={handleSave}
          loading={loading}
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
