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

export interface Review {
  id: string;
  propertyId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'owner';
  text: string;
  timestamp: Date;
}
