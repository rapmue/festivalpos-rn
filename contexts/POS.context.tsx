import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { fetchPOS } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POSContextType, POSData } from '../types/POSData';

const POSContext = createContext<POSContextType | undefined>(undefined);

interface POSProviderProps {
  children: ReactNode;
}

export const POSProvider: React.FC<POSProviderProps> = ({ children }) => {
  const [pos, setPOS] = useState<POSData>({
    id: '',
    name: '',
    festival: '',
    save_sales: false,
    url: 'https://api.festival-pos.dev.0x01.ch/pos/vendor-point/b459f331-933e-4270-9014-aeffda4f20a6',
    products: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const cachedPOS = JSON.parse(await AsyncStorage.getItem('pos'));
      if (cachedPOS) {
        setPOS(cachedPOS);
      } else {
        if (pos.url) {
          try {
            await fetchNewPOSData(pos);
          } catch (error) {
            throw error;
          } finally {
            setLoading(false);
          }
        }
      }
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const savePOS = async (data: POSData) => {
    await AsyncStorage.setItem('pos', JSON.stringify(data));
    setPOS(data);
  };

  const logoutPOS = async () => {
    pos.id = '';
    pos.url = '';
    pos.name = '';
    pos.festival = '';
    pos.save_sales = false;
    pos.products = [];
    await AsyncStorage.removeItem('pos');
  };

  const fetchNewPOSData = async (currentPos: POSData) => {
    if (!currentPos.url) {
      console.log('No POS URL available, cannot fetch data');
      throw new Error('errors.no_url_available');
    }
    setLoading(true);
    try {
      const fetchedPOS = await fetchPOS(currentPos.url);
      await savePOS({
        url: currentPos.url,
        id: fetchedPOS.id,
        name: fetchedPOS.name,
        festival: fetchedPOS.festival,
        save_sales: fetchedPOS.save_sales,
        products: fetchedPOS.products,
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshPOSProducts = async (currentPos: POSData = pos) => {
    await savePOS({ ...currentPos, products: [] });
    try {
      await fetchNewPOSData(currentPos);
    } catch (error) {
      throw error;
    }
  };

  const refreshProducts = async () => {
    setLoading(true);
    console.log('Refresh products');
    try {
      await refreshPOSProducts();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateURL = async (newURL: string) => {
    console.log('Update url and refresh');
    const newPos = {
      url: newURL,
      id: '',
      name: '',
      festival: '',
      save_sales: false,
      products: [],
    };
    await savePOS(newPos);
    try {
      await fetchNewPOSData(newPos);
    } catch (error) {
      throw error;
    }
  };

  return (
    <POSContext.Provider
      value={{ pos, loading, updateURL, refreshProducts, logoutPOS }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
