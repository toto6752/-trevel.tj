/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type City = 'Душанбе' | 'Худжанд' | 'Хорог' | 'Пенджикент' | 'Мургаб';
export type PropertyType = 'квартира' | 'дом' | 'гостиница';

export interface Property {
  id: number;
  title: string;
  description: string;
  city: City;
  price: number;
  type: PropertyType;
  image: string;
  rating: number;
  reviewsCount: number;
  amenities: string[];
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  city: City;
  price: number;
  duration: string;
  images: string[];
  contacts: string;
  rating: number;
  owner_id?: number;
  created_at?: string;
  viewed_at?: string;
}

export interface Review {
  id: number;
  property_id?: number;
  tour_id?: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'owner';
  text: string;
  timestamp: Date;
}
