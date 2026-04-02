import { useState, useCallback } from 'react';
import { FilterProvider, useFilterContext } from './context/FilterContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MapView from './components/map/MapView';
import BakeryDetail from './components/bakery/BakeryDetail';
import CartDrawer from './components/order/CartDrawer';
import TopBanner from './components/ads/TopBanner';
import BottomAdBanner from './components/ads/BottomAdBanner';
import PopupAd from './components/ads/PopupAd';
import AuthModal from './components/auth/AuthModal';
import StoreRegisterModal from './components/auth/StoreRegisterModal';
import BottomTabBar from './components/layout/BottomTabBar';
import type { TabType } from './components/layout/BottomTabBar';
import NewsPage from './components/pages/NewsPage';
import MyBakeryPage from './components/pages/MyBakeryPage';
import EventPage from './components/pages/EventPage';
import CommunityPage from './components/pages/CommunityPage';
import StoreManagePage from './components/pages/StoreManagePage';
import AdminConsole from './components/admin/AdminConsole';
import SplashScreen from './components/common/SplashScreen';
import RightAdSidebar from './components/ads/RightAdSidebar';
import './App.css';

function AppContent() {
  const { selectedBakery, setSelectedBakery } = useFilterContext();
  const { userRole, setDemoRole } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showStoreReg, setShowStoreReg] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  // 역할 전환 시 현재 탭이 새 역할에서 허용되지 않으면 'map'으로 리셋
  const handleChangeRole = useCallback((role: import('./components/layout/BottomTabBar').UserRole) => {
    const allowedByRole: Record<string, string[]> = {
      consumer: ['map', 'community', 'news', 'my', 'event'],
      seller:   ['map', 'community', 'news', 'my', 'event', 'store-manage'],
      admin:    ['map', 'community', 'news', 'my', 'event', 'store-manage', 'admin'],
    };
    setDemoRole(role);
    if (!allowedByRole[role]?.includes(activeTab)) {
      setActiveTab('map');
    }
  }, [activeTab, setDemoRole]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="app-body">
            <Sidebar />
            <div className="map-area">
              <TopBanner />
              <MapView />
            </div>
            <RightAdSidebar />
          </div>
        );
      case 'community':
        return <CommunityPage />;
      case 'news':
        return <NewsPage />;
      case 'my':
        return <MyBakeryPage />;
      case 'event':
        return <EventPage />;
      case 'store-manage':
        return <StoreManagePage />;
      case 'admin':
        return <AdminConsole />;
      default:
        return (
          <div className="app-body">
            <Sidebar />
            <div className="map-area">
              <TopBanner />
              <MapView />
            </div>
            <RightAdSidebar />
          </div>
        );
    }
  };

  return (
    <div className="app">
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <Header
        onOpenAuth={() => setShowAuth(true)}
        onOpenStoreReg={() => setShowStoreReg(true)}
        onGoHome={() => setActiveTab('map')}
        userRole={userRole}
        onChangeRole={handleChangeRole}
      />
      <div className="app-tab-content">
        {renderTabContent()}
      </div>
      <BottomAdBanner />
      <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} userRole={userRole} />
      <PopupAd />
      {selectedBakery && (
        <BakeryDetail bakery={selectedBakery} onClose={() => setSelectedBakery(null)} />
      )}
      <CartDrawer />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showStoreReg && <StoreRegisterModal onClose={() => setShowStoreReg(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </FilterProvider>
    </AuthProvider>
  );
}
