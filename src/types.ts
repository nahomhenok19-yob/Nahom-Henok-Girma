import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  coins: number;
  isVip: boolean;
  isDiamond?: boolean;
  vipExpiry?: Timestamp;
  diamondExpiry?: Timestamp;
  hidePhoneNumber?: boolean;
  hasBot?: boolean;
  diamondTheme?: 'purple-pink' | 'black-white';
  lastLogin: Timestamp;
  role?: 'admin' | 'user' | 'owner';
  bio?: string;
  phoneNumber?: string;
  followersCount: number;
  followingCount: number;
  sharesCount?: number;
  totalGiftsReceived?: number;
  isVipAllYear?: boolean;
  lastBroadcastSeen?: number;
  devices?: Device[];
}

export interface Device {
  id: string;
  name: string;
  type: string;
  model: string;
  lastUsed: Timestamp;
  isCurrent?: boolean;
}

export interface Land {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  type: 'education' | 'equb' | 'edir' | 'ministry';
  createdAt: Timestamp;
  // Equb specific
  equbAmount?: number;
  equbCycle?: 'daily' | 'weekly' | 'monthly';
  currentWinnerId?: string;
  members: string[];
  isRestricted?: boolean;
}

export interface LandJoinRequest {
  id: string;
  landId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface LandMessage {
  id: string;
  landId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  createdAt: Timestamp;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  type: 'video' | 'image' | 'text';
  likes: number;
  commentsCount: number;
  views?: number;
  seenBy?: string[];
  createdAt: Timestamp;
  aiComment?: string;
  aiMusicSuggestion?: string;
  isAd?: boolean;
  mediaUrl?: string;
}

export interface VipRequest {
  id: string;
  userId: string;
  transactionId: string;
  plan: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface UserGift {
  id: string;
  senderId: string;
  receiverId: string;
  giftId: string;
  giftName: string;
  price: number;
  commission: number;
  createdAt: Timestamp;
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  isAnonymousCreator?: boolean;
  members: string[];
  createdAt: Timestamp;
  type: 'group';
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  subscribers: string[];
  createdAt: Timestamp;
  type: 'channel';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: Timestamp;
}

export type MoodType = 'happy' | 'sad' | 'angry' | 'tired' | 'love' | 'lonely' | 'excited';

export interface MoodPost {
  id: string;
  userId: string;
  mood: MoodType;
  text: string;
  reactions: {
    heart: number;
    hug: number;
    thumb: number;
  };
  views?: number;
  seenBy?: string[];
  createdAt: Timestamp;
  isAnonymous: boolean;
}

export interface MoodMatch {
  id: string;
  users: string[];
  mood: MoodType;
  createdAt: Timestamp;
  status: 'active' | 'ended';
}

export interface Notification {
  id: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: 'like' | 'comment' | 'follow' | 'gift' | 'mention' | 'system';
  postId?: string;
  text: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface LuxuryAsset {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ownerId: string;
  history: { userId: string, price: number, date: Timestamp }[];
  isForSale: boolean;
  type: 'digital_jewelry' | 'real_estate' | 'private_island' | 'supercar';
}

export interface Auction {
  id: string;
  assetId: string;
  currentBid: number;
  highestBidder: string;
  highestBidderName: string;
  endTime: Timestamp;
  status: 'active' | 'ended';
}

export interface Ad {
  id: string;
  creatorId: string;
  content: string;
  type: 'video' | 'image';
  createdAt: Timestamp;
  isAd: boolean;
}

export interface InnovationProposal {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  title: string;
  executiveSummary?: string;
  projectOverview?: string;
  problem: string;
  objectives: { main: string; specific: string[] };
  scopeOfWork?: { phase: string; duration: string; details: string[] }[];
  description: string;
  materials: string[];
  technologies?: { area: string; tech: string }[];
  methodology: string[];
  deliverables?: string[];
  benefits: { social: string; economic: string; environmental: string; general?: string[] };
  budget: { item: string; cost: number }[];
  timeline: { activity: string; duration: string }[];
  conclusion: string;
  contactInfo?: {
    name: string;
    school: string;
    email: string;
    phone: string;
  };
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: Timestamp;
}
