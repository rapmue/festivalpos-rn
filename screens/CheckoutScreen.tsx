import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Modal, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { useCart } from '../helpers/CartContext';

const { width } = Dimensions.get('window');

const CheckoutScreen = ({ route, navigation }) => {
  const { cart, resetCart } = useCart();
  const { products } = route.params;

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [givenAmount, setGivenAmount] = useState('');
  const [change, setChange] = useState(null);

  const amountInput = useRef();

  const calculateTotal = () => {
    return Object.keys(cart).reduce((sum, productId) => {
      const product = products.find((p) => p.id === productId); // UUID is a string
      return sum + (product.price * cart[productId]);
    }, 0);
  };

  const handlePayment = (method) => {
    if (method === 'Bar') {
      setIsModalVisible(true);
    } else {
      setSelectedPayment(method);
    }
  };

  const handleCalculateChange = () => {
    const total = calculateTotal();
    const changeAmount = parseFloat(givenAmount) - total;
    setChange(changeAmount.toFixed(2));
    setIsModalVisible(false);
    setSelectedPayment('Bar');
  };

  const handleFinish = () => {
    resetCart();
    navigation.navigate('POS');
  };

  const total = calculateTotal().toFixed(2);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        {Object.keys(cart).map(productId => {
          const product = products.find(p => p.id === productId); // UUID is a string
          return (
            <View key={product.id} style={styles.productItem}>
              <Text style={styles.productText}>{cart[productId]} x {product.name}</Text>
              <Text style={styles.productText}>CHF {(product.price * cart[productId]).toFixed(2)}</Text>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalAmount}>CHF {total}</Text>
        </View>
        {change !== null && (
          <View style={styles.productItem}>
            <Text style={styles.changeText}>Wechselgeld:</Text>
            <Text style={styles.changeAmount}>CHF {change}</Text>
          </View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        {selectedPayment === null ? (
          <>
            <Pressable style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.paymentButtonText}>Abschliessen</Text>
            </Pressable>
            <Pressable style={styles.paymentButtonInactive} onPress={() => handlePayment('Twint')} disabled={true}>
              <Text style={styles.paymentButtonText}>Twint</Text>
            </Pressable>
            <Pressable style={styles.paymentButton} onPress={() => handlePayment('Bar')}>
              <Text style={styles.paymentButtonText}>Bar</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.paymentButtonText}>Abschliessen</Text>
          </Pressable>
        )}
      </View>
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => { setIsModalVisible(false) }} onShow={() => { setTimeout(() => { amountInput.current.focus() }, 100) }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erhaltenen Betrag eingeben</Text>
            <TextInput
              style={styles.input}
              inputMode="numeric"
              placeholder="CHF"
              placeholderTextColor={Colors.text}
              value={givenAmount}
              onChangeText={setGivenAmount}
              autoFocus={false}
              ref={amountInput}
            />
            <Pressable style={styles.calculateButton} onPress={handleCalculateChange}>
              <Text style={styles.calculateButtonText}>Wechselgeld berechnen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  summary: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  productText: {
    fontSize: 16,
    color: Colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.tint,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  changeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AF6A31',
  },
  changeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AF6A31',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  paymentButton: {
    flex: 1,
    padding: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonInactive: {
    flex: 1,
    padding: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButton: {
    flex: 1,
    padding: 12,
    margin: 4,
    backgroundColor: 'darkgreen',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width - 40,
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 4,
    padding: 8,
    width: '100%',
    marginBottom: 16,
    color: Colors.text,
  },
  calculateButton: {
    padding: 12,
    backgroundColor: 'darkgreen',
    borderRadius: 4,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;