import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Furniture from './pages/Furniture';
import FurnitureCategory from './pages/FurnitureCategory';
import FurnitureDetail from './pages/FurnitureDetail';
import Kitchen from './pages/Kitchen';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Account from './pages/Account';
import ChangePassword from './pages/ChangePassword';
import RoomVisualizer from './pages/RoomVisualizer';

// Admin components
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import ProtectedRoute from './admin/ProtectedRoute';
import Dashboard from './admin/Dashboard';
import ManageFurniture from './admin/ManageFurniture';
import ManageKitchens from './admin/ManageKitchens';
import ManageProjects from './admin/ManageProjects';
import ManageDashboardImages from './admin/ManageDashboardImages';
import ManageMessages from './admin/ManageMessages';
import ManageOrders from './admin/ManageOrders';
import ManageUsers from './admin/ManageUsers';
import Settings from './admin/Settings';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';

// Order Pages
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import PaymentStatus from './pages/PaymentStatus';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

import { OrderProvider } from './context/OrderContext';
import { WishlistProvider } from './context/WishlistContext';
import { PaymentProvider } from './context/PaymentContext';

import './styles/index.css';
import './styles/admin.css';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <PaymentProvider>
            <OrderProvider>
              <DataProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                    <Route path="/furniture" element={<PublicLayout><Furniture /></PublicLayout>} />
                    <Route path="/furniture/category/:categorySlug" element={<PublicLayout><FurnitureCategory /></PublicLayout>} />
                    <Route path="/furniture/:id" element={<PublicLayout><FurnitureDetail /></PublicLayout>} />
                    <Route path="/kitchen" element={<PublicLayout><Kitchen /></PublicLayout>} />
                    <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
                    <Route path="/projects/:id" element={<PublicLayout><ProjectDetails /></PublicLayout>} />
                    <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                    <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                    <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
                    <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
                    <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
                    <Route path="/payment/status" element={<PublicLayout><PaymentStatus /></PublicLayout>} />
                    <Route path="/payment/success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
                    <Route path="/payment/cancel" element={<PublicLayout><PaymentCancel /></PublicLayout>} />
                    <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                    <Route path="/account" element={<PublicLayout><Account /></PublicLayout>} />
                    <Route path="/account/orders" element={<PublicLayout><Orders /></PublicLayout>} />
                    <Route path="/account/orders/:id" element={<PublicLayout><OrderDetail /></PublicLayout>} />
                    <Route path="/account/change-password" element={<PublicLayout><ChangePassword /></PublicLayout>} />
                    <Route path="/visualizer" element={<PublicLayout><RoomVisualizer /></PublicLayout>} />

                    {/* Admin Login (public) */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="orders" element={<ManageOrders />} />
                      <Route path="dashboard-images" element={<ManageDashboardImages />} />
                      <Route path="furniture" element={<ManageFurniture />} />
                      <Route path="kitchens" element={<ManageKitchens />} />
                      <Route path="projects" element={<ManageProjects />} />
                      <Route path="users" element={<ManageUsers />} />
                      <Route path="messages" element={<ManageMessages />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* 404 Catch-All */}
                    <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                  </Routes>
                </BrowserRouter>
              </DataProvider>
            </OrderProvider>
          </PaymentProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
