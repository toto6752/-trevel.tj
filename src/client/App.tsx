/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PROPERTIES } from './data/mockData';
import { Property, Tour, City, PropertyType } from './types';
import AIAssistant from './components/AIAssistant';
import { api } from './api';

// Layout Components
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';

// Feature Components
import PropertyModal from './components/property/PropertyModal';
import TourModal from './components/property/TourModal';
import AuthForm from './components/auth/AuthForm';

// Tab Components
import HomeTab from './components/HomeTab';
import SearchTab from './components/SearchTab';
import ToursTab from './components/ToursTab';
import FavoritesTab from './components/FavoritesTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';
import SmartTourPicker from './components/SmartTourPicker';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'tours' | 'favorites' | 'chat' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | 'Все'>('Все');
  const [selectedType, setSelectedType] = useState<PropertyType | 'Все'>('Все');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSmartPickerOpen, setIsSmartPickerOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [favoriteTours, setFavoriteTours] = useState<Tour[]>([]);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    fetchProperties();
    if (token) {
      fetchFavoriteTours();
    }
  }, [selectedCity, selectedType, token]);

  const fetchFavoriteTours = async () => {
    if (!token) return;
    try {
      const data = await api.getFavorites(token);
      setFavoriteTours(data);
    } catch (err) {
      console.error('Failed to fetch favorite tours', err);
    }
  };

  const handleToggleFavoriteTour = async (e: React.MouseEvent, tour: Tour) => {
    e.stopPropagation();
    if (!token) {
      setActiveTab('profile');
      return;
    }

    const isFav = favoriteTours.some(f => f.id === tour.id);
    try {
      await api.toggleFavorite(tour.id, isFav, token);
      fetchFavoriteTours();
    } catch (err) {
      console.error('Toggle favorite error', err);
    }
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProperties({ city: selectedCity, type: selectedType });
      setProperties(data.length > 0 ? data : MOCK_PROPERTIES);
    } catch (err) {
      setProperties(MOCK_PROPERTIES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (newUser: any, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setActiveTab('home');
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'Все' || p.city === selectedCity;
    const matchesType = selectedType === 'Все' || p.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  const cities: (City | 'Все')[] = ['Все', 'Душанбе', 'Худжанд', 'Хорог', 'Пенджикент', 'Мургаб'];
  const types: (PropertyType | 'Все')[] = ['Все', 'квартира', 'дом', 'гостиница'];

  return (
    <div className="min-h-screen pb-20 bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        token={token} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeTab 
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedProperty={setSelectedProperty}
              setIsAiOpen={setIsAiOpen}
              onOpenSmartPicker={() => setIsSmartPickerOpen(true)}
            />
          )}

          {activeTab === 'search' && (
            <SearchTab 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              filteredProperties={filteredProperties}
              setSelectedProperty={setSelectedProperty}
              cities={cities}
              types={types}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'tours' && (
            <ToursTab 
              setSelectedTour={setSelectedTour} 
              canCreate={user?.role === 'creator' || user?.role === 'admin'} 
              favoriteTourIds={favoriteTours.map(f => f.id)}
              onToggleFavorite={handleToggleFavoriteTour}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesTab 
              favorites={favorites} 
              favoriteTours={favoriteTours}
              setSelectedProperty={setSelectedProperty} 
              setSelectedTour={setSelectedTour}
              onToggleFavoriteTour={handleToggleFavoriteTour}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'chat' && <ChatTab />}

          {activeTab === 'profile' && (
            token ? (
              <ProfileTab 
                user={user} 
                onLogout={handleLogout} 
                setSelectedTour={setSelectedTour}
              />
            ) : (
              <AuthForm onLogin={handleLogin} />
            )
          )}
        </AnimatePresence>
      </main>

      <PropertyModal 
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isAuthenticated={!!token}
        onPostReview={async () => {
          if (selectedProperty) {
            const updated = await api.getProperty(selectedProperty.id);
            setSelectedProperty(updated);
            fetchProperties();
          }
        }}
        isFavorite={!!selectedProperty && favorites.some(f => f.id === selectedProperty.id)}
        onToggleFavorite={() => {
          if (!selectedProperty) return;
          const isFav = favorites.some(f => f.id === selectedProperty.id);
          if (isFav) setFavorites(favorites.filter(f => f.id !== selectedProperty.id));
          else setFavorites([...favorites, selectedProperty]);
        }}
      />

      <TourModal 
        tour={selectedTour}
        onClose={() => setSelectedTour(null)}
        isAuthenticated={!!token}
        onPostReview={async () => {
          if (selectedTour) {
            const updated = await api.getTour(selectedTour.id);
            setSelectedTour(updated);
          }
        }}
      />

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <AIAssistant isOpen={isAiOpen} setIsOpen={setIsAiOpen} />
      
      <SmartTourPicker 
        isOpen={isSmartPickerOpen} 
        onClose={() => setIsSmartPickerOpen(false)}
        onSelectTour={(tour) => {
          setSelectedTour(tour);
          setIsSmartPickerOpen(false);
        }}
      />
    </div>
  );
}
