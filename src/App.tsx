/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  auth, db 
} from './lib/firebase';
import { 
  onAuthStateChanged, 
  User,
  setPersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  where,
  arrayUnion,
  getDocs,
  limit,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User as UserIcon, 
  Crown, 
  Coins, 
  Send, 
  Gift as GiftIcon, 
  Music, 
  Lightbulb,
  MessageCircle,
  Play,
  Video,
  Phone,
  Camera,
  ArrowLeft,
  ArrowRight,
  Flashlight,
  RotateCcw,
  CameraOff,
  HeartHandshake,
  Scale,
  Plus,
  Trophy,
  Zap,
  Sparkles,
  Gem,
  BookOpen,
  Edit3,
  ShieldCheck,
  Radio,
  Share2,
  Users,
  Megaphone,
  Hash,
  Trash2,
  ChevronRight,
  Settings,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  Shield,
  Fingerprint,
  ScanFace,
  Bell,
  Globe,
  Database,
  HelpCircle,
  Eye,
  Gavel,
  X,
  ListChecks,
  Target,
  RefreshCw,
  Power,
  Smartphone,
  Laptop,
  Tablet,
  Cpu
} from 'lucide-react';
import { cn } from './lib/utils';
import { UserProfile, Device, Post, VipRequest, Land, LandMessage, ChatGroup, Channel, ChatMessage, Comment, MoodType, MoodPost, MoodMatch, Gift, UserGift, Like, Notification, LandJoinRequest, LuxuryAsset, Auction, Ad, InnovationProposal } from './types';
import { generateAiComment, moderateContent } from './services/aiService';
import InnovationProposalForm from './components/InnovationProposalForm';
import ProposalDetail from './components/ProposalDetail';
import confetti from 'canvas-confetti';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';

// MelkaSnap Ultra Assets
const dogNoseImg = new Image();
dogNoseImg.src = "https://i.imgur.com/4AiXzf8.png";
const dogEarImg = new Image();
dogEarImg.src = "https://i.imgur.com/Z6XbK8T.png";
const glassesImg = new Image();
glassesImg.src = "https://i.imgur.com/7Qp1ZQG.png";

function DiamondBadge() {
  return (
    <motion.div 
      animate={{ 
        rotateY: [0, 180, 360],
        filter: ["brightness(1) saturate(1)", "brightness(2) saturate(1.5)", "brightness(1) saturate(1)"],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="inline-flex items-center justify-center ml-1 text-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
    >
      <Gem className="w-3 h-3 fill-white" />
    </motion.div>
  );
}

function DiamondParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "110%", 
            opacity: 0,
            scale: Math.random() * 0.5 + 0.2
          }}
          animate={{ 
            y: "-10%", 
            opacity: [0, 0.8, 0],
            rotate: 360
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
        />
      ))}
    </div>
  );
}

function FlyingCreatures({ count = 4 }: { count?: number }) {
  const [hour, setHour] = useState(new Date().getHours());
  
  useEffect(() => {
    const timer = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isNight = hour >= 18 || hour < 6; // 6 PM to 6 AM (Ethiopian 12 to 12)
  const emoji = isNight ? '🦇' : '🕊️';
  const creatures = Array.from({ length: count });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
      {creatures.map((_, i) => (
         <motion.div
            key={i}
            initial={{ x: i % 2 === 0 ? '-20vw' : '120vw', y: '110vh', opacity: 0, rotate: -30, scale: 0.5 }}
            animate={{
              x: i % 2 === 0 ? ['-20vw', '30vw', '70vw', '120vw'] : ['120vw', '70vw', '30vw', '-20vw'],
              y: ['110vh', '60vh', '40vh', '-30vh'],
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0.5, 1.3, 1.1, 0.8, 0.5],
              rotate: [-30, 10, -10, 20, -10]
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              delay: i * 15,
              ease: "easeInOut"
            }}
            className={cn(
              "absolute text-6xl filter blur-[1px]",
              isNight ? "drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" : "drop-shadow-[0_0_15px_rgba(255,165,0,0.3)] contrast-125"
            )}
         >
           {emoji}
         </motion.div>
      ))}
    </div>
  );
}

// Keep the name FlyingOwls for compatibility with existing code
const FlyingOwls = FlyingCreatures;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the whole app, but we log it as required
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user && profile) {
      // Automatically grant owner role to the developer email for testing
      if (user.email === 'yewubdarhaileyesus8@gmail.com' && profile.role !== 'owner') {
        updateDoc(doc(db, 'users', user.uid), {
          role: 'owner',
          isVip: true
        }).catch(err => console.error("Error upgrading developer:", err));
      }
    }
  }, [user, profile]);
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const handVideoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraRetryKey, setCameraRetryKey] = useState(0);
  const [toasts, setToasts] = useState<{ id: string; title: string; text: string; type: string }[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const isInitialLoad = useRef(true);
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'innovation_proposals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InnovationProposal));
      setProposals(p);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'innovation_proposals');
    });
    return () => unsubscribe();
  }, [user]);

  const [activeTab, setActiveTab] = useState<'home' | 'land' | 'add' | 'inbox' | 'profile' | 'vip' | 'live' | 'settings' | 'leaderboard' | 'rewards'>('home');
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showVipSelection, setShowVipSelection] = useState(false);
  const [mustChooseMembership, setMustChooseMembership] = useState(false);
  const [isDiamondTab, setIsDiamondTab] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [vipRequests, setVipRequests] = useState<any[]>([]);
  const [showAdsManager, setShowAdsManager] = useState(false);
  const [adContent, setAdContent] = useState('');
  const [adType, setAdType] = useState<'video' | 'image'>('video');
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isElite = profile?.isVip || profile?.isDiamond || profile?.role === 'owner' || user?.email === 'yewubdarhaileyesus8@gmail.com';
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editHidePhone, setEditHidePhone] = useState(false);
  const [editDiamondTheme, setEditDiamondTheme] = useState<'purple-pink' | 'black-white'>('purple-pink');
  const [editHasBot, setEditHasBot] = useState(false);
  const [landMessages, setLandMessages] = useState<LandMessage[]>([]);
  const [newLandMessage, setNewLandMessage] = useState('');
  const [lands, setLands] = useState<Land[]>([]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      if (!showFilters) return;
      
      try {
        setCameraError(null);
        // Wait for the video element to be mounted
        await new Promise(resolve => setTimeout(resolve, 200));

        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: cameraFacing 
          },
          audio: captureMode === 'video'
        });
        
        stream = s;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = s;
          
          cameraVideoRef.current.onloadedmetadata = () => {
            if (cameraCanvasRef.current && cameraVideoRef.current) {
              cameraCanvasRef.current.width = cameraVideoRef.current.videoWidth;
              cameraCanvasRef.current.height = cameraVideoRef.current.videoHeight;
            }
          };
        }

        // Initialize FaceMesh
        const faceMesh = new FaceMesh({
          locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results: any) => {
          const canvas = cameraCanvasRef.current;
          const video = cameraVideoRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx || !video) return;

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame first with beauty filter if active
          if (activeFilter === 'beauty') {
            ctx.filter = "blur(4px) brightness(1.1)";
          }

          if (cameraFacing === 'user') {
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.scale(-1, 1); // Flip back for landmarks
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          
          ctx.filter = "none";

          if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            ctx.restore();
            return;
          }

          const lm = results.multiFaceLandmarks[0];
          
          // Mirror landmarks if using user camera
          if (cameraFacing === 'user') {
            lm.forEach((p: any) => p.x = 1 - p.x);
          }

          const nose = lm[1];
          const leftEye = lm[33];
          const rightEye = lm[263];
          const upperLip = lm[13];
          const lowerLip = lm[14];
          const mouthOpen = Math.abs(upperLip.y - lowerLip.y);

          const nx = nose.x * canvas.width;
          const ny = nose.y * canvas.height;
          const lx = leftEye.x * canvas.width;
          const ly = leftEye.y * canvas.height;
          const rx = rightEye.x * canvas.width;
          const ry = rightEye.y * canvas.height;
          const faceWidth = Math.abs(rx - lx);

          // Drawing filters
          if (activeFilter === 'dog') {
            const noseSize = faceWidth * 0.6;
            const earSize = faceWidth * 0.7;
            
            ctx.drawImage(dogNoseImg, nx - noseSize/2, ny - noseSize/4, noseSize, noseSize);
            ctx.drawImage(dogEarImg, lx - earSize * 0.8, ly - earSize * 1.2, earSize, earSize);
            ctx.drawImage(dogEarImg, rx - earSize * 0.2, ry - earSize * 1.2, earSize, earSize);
          }

          if (activeFilter === 'glasses') {
            const gWidth = faceWidth * 1.8;
            const gHeight = gWidth * 0.4;
            ctx.drawImage(glassesImg, (lx + rx)/2 - gWidth/2, (ly + ry)/2 - gHeight/2, gWidth, gHeight);
          }

          if (activeFilter === 'emoji') {
            ctx.font = `${canvas.width * 0.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (mouthOpen > 0.05) {
              ctx.fillText("😂", nx, ny);
            } else {
              ctx.fillText("🙂", nx, ny);
            }
          }

          if (activeFilter === 'funny') {
            ctx.font = `${canvas.width * 0.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("🤪", nx, ny);
          }

          if (activeFilter === 'beauty') {
            ctx.fillStyle = "rgba(255,215,0,0.15)";
            ctx.beginPath();
            ctx.arc(nx, ny, canvas.width * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add some sparkles
            ctx.font = `${canvas.width * 0.05}px Arial`;
            ctx.fillText("✨", lx - 20, ly - 20);
            ctx.fillText("✨", rx + 20, ry - 20);
            ctx.fillText("✨", nx, ny + 40);
          }

          ctx.restore();
        });

        faceMeshRef.current = faceMesh;

        // Start detection loop
        let isActive = true;
        const detect = async () => {
          if (!isActive || !showFilters) return;
          if (cameraVideoRef.current && cameraVideoRef.current.readyState >= 2) {
            try {
              await faceMesh.send({ image: cameraVideoRef.current });
            } catch (e) {
              console.error("FaceMesh send error:", e);
            }
          }
          requestAnimationFrame(detect);
        };
        detect();

        return () => {
          isActive = false;
          if (faceMeshRef.current) {
            faceMeshRef.current.close();
          }
        };
      } catch (err: any) {
        console.error("Camera error:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError("Camera access was denied. To fix this:\n1. Click the lock icon 🔒 in your browser's address bar.\n2. Change 'Camera' to 'Allow'.\n3. Click 'Retry' below.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError("No camera found on your device. Please ensure your camera is connected.");
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError("Camera is already in use by another application. Please close other apps using the camera.");
        } else {
          setCameraError("Could not access camera: " + err.message);
        }
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showFilters, cameraFacing, captureMode, cameraRetryKey]);

  const handleCapture = () => {
    if (!cameraCanvasRef.current) return;

    if (captureMode === 'video') {
      if (!isRecording) {
        setIsRecording(true);
        // Simulate recording for now as MediaRecorder setup is complex
        // but it will use the canvas content
        setTimeout(() => {
          setIsRecording(false);
          setNewPostType('video');
          setNewPostMediaUrl("https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4");
          setShowFilters(false);
          setActiveTab('add');
          addToast("Video Captured", "Your filtered memory has been saved! ✨", "success");
        }, 3000);
      }
    } else {
      // Real Photo capture from canvas
      const imageData = cameraCanvasRef.current.toDataURL('image/jpeg', 0.9);
      setNewPostType('image');
      setNewPostMediaUrl(imageData);
      setShowFilters(false);
      setActiveTab('add');
      addToast("Photo Captured", "Filter looks great on you! ✨", "success");
    }
  };
  const [landJoinRequests, setLandJoinRequests] = useState<LandJoinRequest[]>([]);
  const [showLandRequests, setShowLandRequests] = useState(false);
  const [showCreateLand, setShowCreateLand] = useState(false);
  const [newLandName, setNewLandName] = useState('');
  const [newLandType, setNewLandType] = useState<'education' | 'equb' | 'edir' | 'ministry'>('education');
  const [newLandDescription, setNewLandDescription] = useState('');
  const [newEqubAmount, setNewEqubAmount] = useState(100);
  const [newEqubCycle, setNewEqubCycle] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; text: string } | null>(null);
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [groups, setGroups] = useState<ChatGroup[]>([
    {
      id: 'system-assistant',
      name: "Nahom's AI Assistant",
      description: "Your personal luxury assistant",
      creatorId: 'system',
      members: ['system'],
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
      type: 'group'
    }
  ]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatDesc, setNewChatDesc] = useState('');
  const [isAnonymousGroup, setIsAnonymousGroup] = useState(false);
  const [newChatType, setNewChatType] = useState<'group' | 'channel'>('group');
  const [isPosting, setIsPosting] = useState(false);
  const [moodPosts, setMoodPosts] = useState<MoodPost[]>([]);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [showMoodSelection, setShowMoodSelection] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [homeSubTab, setHomeSubTab] = useState<'moods' | 'videos' | 'offline'>('videos');
  const [activeMatch, setActiveMatch] = useState<MoodMatch | null>(null);
  const videoFeedRef = useRef<HTMLDivElement>(null);
  const [giftCatalog, setGiftCatalog] = useState<Gift[]>([]);
  const [userGifts, setUserGifts] = useState<UserGift[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [showGiftShop, setShowGiftShop] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [securitySettings, setSecuritySettings] = useState({
    password: true,
    pin: false,
    fingerprint: false,
    faceId: false,
    handScan: true
  });

  const [showLuxuryAdvisor, setShowLuxuryAdvisor] = useState(false);
  const [luxuryAdvisorQuery, setLuxuryAdvisorQuery] = useState('');
  const [luxuryAdvisorResponse, setLuxuryAdvisorResponse] = useState('');
  const [isLuxuryAdvisorLoading, setIsLuxuryAdvisorLoading] = useState(false);
  const [luxuryAssets, setLuxuryAssets] = useState<LuxuryAsset[]>([]);
  const [showVault, setShowVault] = useState(false);
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);
  const [showProjector, setShowProjector] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [useScreenProjector, setUseScreenProjector] = useState(false);
  const [projectorTheme, setProjectorTheme] = useState<'stars' | 'heart' | 'magic'>('stars');
  const [projectorCalibration, setProjectorCalibration] = useState(false);
  const [dailyTasks, setDailyTasks] = useState([
    { id: '1', title: 'ለጓደኞች ያጋሩ', reward: 50, completed: false, type: 'share' },
    { id: '2', title: 'ለፖስት ምላሽ ይስጡ', reward: 20, completed: false, type: 'reaction' },
    { id: '3', title: 'መልዕክት ይላኩ', reward: 30, completed: false, type: 'message' },
    { id: '4', title: 'ፕሮፋይልዎን ይመልከቱ', reward: 10, completed: false, type: 'profile' },
  ]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [drivingWarningCount, setDrivingWarningCount] = useState(0);
  const [isModerating, setIsModerating] = useState(false);
  const [showUnderageWarning, setShowUnderageWarning] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const addToast = (title: string, text: string, type: string = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeLandId, setActiveLandId] = useState<string | null>(null);
  const [showSeenByModal, setShowSeenByModal] = useState(false);
  const [seenByUsers, setSeenByUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [offlineVideos] = useState<any[]>(() => {
    const baseVideos = [
      "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-in-the-wind-1150-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-at-the-beach-1151-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-dancing-in-the-rain-1152-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-1153-large.mp4"
    ];
    return Array.from({ length: 250 }, (_, i) => ({
      id: `offline-${i}`,
      authorId: 'system',
      authorName: 'Nahom Offline',
      authorPhoto: 'input_file_1.png',
      content: `Offline Video #${i + 1} - Enjoy anywhere!`,
      type: 'video',
      likes: Math.floor(Math.random() * 1000),
      commentsCount: Math.floor(Math.random() * 100),
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
      mediaUrl: baseVideos[i % baseVideos.length],
      isOffline: true
    }));
  });

  // Hand Scan Gesture Control
  // Hand Gesture Control for Home/Videos
  useEffect(() => {
    if (!securitySettings.handScan || homeSubTab !== 'videos' || !videoFeedRef.current) return;

    let hands: any = null;
    let cameraStream: MediaStream | null = null;
    let baseY = -1;
    let lastScrollTime = 0;
    const GESTURE_THRESHOLD = 0.08; // Very sensitive
    const COOLDOWN = 1000; // Faster cooldown 
    let isActive = true;

    async function startHandScan() {
      try {
        console.log("Hand Scan: Requesting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: 'user' 
          } 
        }).catch(err => {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            console.warn("Hand Scan: Camera permission denied. Entering standby mode.");
            // Don't throw, just exit the startup sequence gracefully
            return null;
          }
          throw err;
        });
        
        if (!stream) return;
        
        if (!isActive) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        cameraStream = stream;
        if (handVideoRef.current) {
          handVideoRef.current.srcObject = stream;
          await handVideoRef.current.play();
          console.log("Hand Scan: Video playing");
        }

        hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.4, // Lowered for easier detection
          minTrackingConfidence: 0.4
        });

        let lastToggleTime = 0;
        const TOGGLE_COOLDOWN = 1500;

        hands.onResults((results: any) => {
          if (!isActive) return;
          
          if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            if (baseY !== -1) console.log("Hand Scan: Hand lost");
            baseY = -1;
            return;
          }

          const landmarks = results.multiHandLandmarks[0];
          
          // --- Palm Open Detection (✋) for Play/Pause ---
          const isPalm = 
            landmarks[8].y < landmarks[6].y && 
            landmarks[12].y < landmarks[10].y && 
            landmarks[16].y < landmarks[14].y && 
            landmarks[20].y < landmarks[18].y;

          if (isPalm) {
            const now = Date.now();
            if (now - lastToggleTime > TOGGLE_COOLDOWN) {
              console.log("Hand Scan: Palm ✋ detected! Toggling Play/Pause");
              const videos = document.querySelectorAll('video');
              let toggled = false;
              videos.forEach(v => {
                // Ignore the tracker video itself
                if (v === handVideoRef.current) return;

                const rect = v.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (inView && !toggled) {
                  if (v.paused) {
                    v.play().catch(e => console.log("Hand scan play error:", e));
                    addToast("Hand Gesture", "Playing ▶️", "success");
                  } else {
                    v.pause();
                    addToast("Hand Gesture", "Paused ⏸️", "info");
                  }
                  toggled = true;
                }
              });
              lastToggleTime = now;
              baseY = -1; // Reset scroll base when toggling
              return;
            }
          }

          const currentY = landmarks[9].y; 
          
          if (baseY === -1) {
            console.log("Hand Scan: Hand detected at Y:", currentY);
            baseY = currentY;
            return;
          }

          const deltaY = currentY - baseY;
          const now = Date.now();

          if (now - lastScrollTime > COOLDOWN) {
            const container = videoFeedRef.current;
            if (!container) return;
            const scrollAmount = container.clientHeight || window.innerHeight;

            if (deltaY > GESTURE_THRESHOLD) {
              console.log("Hand Scan: Swipe DOWN detected (Scrolled Up)");
              container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
              lastScrollTime = now;
              baseY = currentY; 
              addToast("Hand Scroll", "Back 🔼", "success");
            } else if (deltaY < -GESTURE_THRESHOLD) {
              console.log("Hand Scan: Swipe UP detected (Scrolled Down)");
              container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
              lastScrollTime = now;
              baseY = currentY;
              addToast("Hand Scroll", "Next 🔽", "success");
            }
          }
        });

        const processFrames = async () => {
          if (!isActive || !securitySettings.handScan) return;
          try {
            if (handVideoRef.current && handVideoRef.current.readyState >= 2) {
              await hands.send({ image: handVideoRef.current });
            }
          } catch (e) {
            console.error("Frame process error:", e);
          }
          if (isActive) requestAnimationFrame(processFrames);
        };
        processFrames();

        addToast("Hand Scan", "Active! 👋 Scroll: Swipe | Pause: ✋", "info");
      } catch (err) {
        console.error("Hand Scan Startup Error:", err);
        addToast("Camera Error", "Could not start hand scan. Please allow camera access.", "error");
      }
    }

    startHandScan();

    return () => {
      isActive = false;
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
          console.log("Hand Scan track stopped:", track.label);
        });
      }
      if (hands) {
        hands.close();
        console.log("Hand Scan API closed");
      }
    };
  }, [securitySettings.handScan, homeSubTab, videoFeedRef.current]);

  // Fake Call State
  const [showFakeCallModal, setShowFakeCallModal] = useState(false);
  const [fakeCallName, setFakeCallName] = useState('');
  const [fakeCallNumber, setFakeCallNumber] = useState('');
  const [fakeCallTime, setFakeCallTime] = useState('');
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [incomingFakeCall, setIncomingFakeCall] = useState(false);
  const [isFakeCallAnswered, setIsFakeCallAnswered] = useState(false);
  const [fakeCallAiResponse, setFakeCallAiResponse] = useState('');

  // Notifications Listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      
      // Check for new notifications to show toast
      if (!isInitialLoad.current) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const newNotif = change.doc.data() as Notification;
            // Only show toast if it's not from the user themselves and it's recent
            if (newNotif.senderId !== user.uid && !newNotif.isRead) {
              addToast(newNotif.senderName, newNotif.text, 'notification');
            }
          }
        });
      }
      isInitialLoad.current = false;

      setNotifications(notifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });
    return unsubscribe;
  }, [user]);

  const createNotification = async (targetUserId: string, type: Notification['type'], text: string, postId?: string) => {
    if (!user || user.uid === targetUserId) return;
    const notificationData: any = {
      userId: targetUserId,
      senderId: user.uid,
      senderName: profile?.displayName || 'Someone',
      senderPhoto: profile?.photoURL || '',
      type,
      text,
      isRead: false,
      createdAt: serverTimestamp()
    };
    if (postId) {
      notificationData.postId = postId;
    }
    await addDoc(collection(db, 'notifications'), notificationData);
  };

  const markNotificationsAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { isRead: true });
    }
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  // Fake Call Trigger Logic
  useEffect(() => {
    if (!isFakeCallActive || !fakeCallTime) return;

    const checkTime = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = fakeCallTime.split(':').map(Number);
      
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        setIncomingFakeCall(true);
        setIsFakeCallActive(false); // Reset after triggering
        clearInterval(checkTime);
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [isFakeCallActive, fakeCallTime]);

  const handleAnswerFakeCall = async () => {
    setIsFakeCallAnswered(true);
    try {
      const response = await generateAiComment(`I am in an emergency or difficult situation. Please talk to me as ${fakeCallName} to help me get out of it.`);
      setFakeCallAiResponse(response);
    } catch (error) {
      setFakeCallAiResponse("Hey, where are you? I'm waiting for you. Please come quickly!");
    }
  };

  // Online/Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddPost = async () => {
    if (!user || !newPostContent || isPosting) return;
    
    setIsPosting(true);
    setIsModerating(true);
    try {
      // If it's an image post, we should moderate it
      // For now, let's assume we have a way to get the image data if it's an image post
      // Since this is a demo, we'll simulate the moderation check if it's an image
      if (newPostType === 'image' || newPostType === 'video') {
        // In a real app, we'd pass the actual image data
        // For this demo, we'll use a placeholder or skip if no data
        const moderation = await moderateContent("data:image/jpeg;base64,..."); 
        if (!moderation.isSafe) {
          addToast("Content Rejected", moderation.reason || "Safety violation detected.", "error");
          setIsPosting(false);
          setIsModerating(false);
          return;
        }
      }

      const aiComment = await generateAiComment(newPostContent);

    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'User',
        authorPhoto: profile?.photoURL || user.photoURL || '',
        content: newPostContent,
        type: newPostType,
        mediaUrl: newPostMediaUrl,
        filterId: activeFilter,
        likes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        aiComment
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts');
    }

      setNewPostContent('');
      setNewPostMediaUrl('');
      setActiveFilter('none');
      setActiveTab('home');
      addToast("Post Created", "Post created successfully! ✨", "success");
    } catch (error) {
      console.error("Error adding post:", error);
      addToast("Error", "Failed to create post. Please try again.", "error");
    } finally {
      setIsPosting(false);
      setIsModerating(false);
    }
  };

  const handleSpin = async () => {
    if (!profile || isSpinning || profile.coins < 25) return;
    
    setIsSpinning(true);
    // Deduct 25 coins
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        coins: increment(-25)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user!.uid}`);
    }

    // Simulate spin
    setTimeout(async () => {
      const rewards = [50, 100, 150, 200, 500];
      const win = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResult(win);
      
      try {
        await updateDoc(doc(db, 'users', user!.uid), {
          coins: increment(win)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user!.uid}`);
      }
      
      setIsSpinning(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F9E27D']
      });
    }, 2000);
  };

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(true);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // Reduced to 5 seconds
    return () => clearTimeout(timer);
  }, []);

  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState('');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'User',
            photoURL: u.photoURL || '',
            email: u.email || '',
            coins: 100,
            isVip: false,
            isDiamond: false,
            vipExpiry: null as any,
            diamondExpiry: null as any,
            lastLogin: serverTimestamp() as any,
            followersCount: 0,
            followingCount: 0,
            devices: [{
              id: 'initial',
              name: 'Original Access Device',
              type: 'system',
              model: navigator.platform,
              lastUsed: Timestamp.now(),
              isCurrent: true
            }],
            role: ['yewubdarhaileyesus8@gmail.com', 'nahomhenok19@gmail.com', 'henokgirma878@gmail.com'].includes(u.email || '') ? 'owner' : 'user'
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
          // NEW users can also enter freely
          // setMustChooseMembership(true);
        } else {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          // Allow normal users to enter without mandatory VIP selection
          // if (!data.isVip && !data.isDiamond) {
          //   setMustChooseMembership(true);
          // }
          if (data.role === 'owner') {
            seedGifts();
          }
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Posts Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(p);
      
      // Auto-seed initial luxury content if feed is empty
      if (snapshot.empty && user.email === 'yewubdarhaileyesus8@gmail.com') {
        const initialVideos = [
          {
            authorId: 'system',
            authorName: 'Nahom Elite',
            authorPhoto: 'input_file_1.png',
            content: 'Welcome to the luxury of melkahayu.nahom. ✨',
            type: 'video',
            mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4",
            likes: [],
            views: 0,
            seenBy: [],
            createdAt: serverTimestamp()
          },
          {
            authorId: 'system',
            authorName: 'Elite Member',
            authorPhoto: 'input_file_1.png',
            content: 'The world belongs to those who dare. 🥂',
            type: 'video',
            mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-dancing-in-the-rain-1152-large.mp4",
            likes: [],
            views: 0,
            seenBy: [],
            createdAt: serverTimestamp()
          }
        ];
        initialVideos.forEach(v => {
          addDoc(collection(db, 'posts'), v);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
    return unsubscribe;
  }, [user]);

  // Lands Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'lands'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const l = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Land));
      setLands(l);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'lands');
    });
    return unsubscribe;
  }, [user]);

  // VIP/Diamond Expiry Check Listener
  useEffect(() => {
    if (!user || !profile) return;
    
    const checkExpiry = async () => {
      const now = Timestamp.now();
      const updates: any = {};
      let changed = false;

      // Check VIP Expiry
      if (profile.isVip && profile.vipExpiry && profile.vipExpiry.toMillis() < now.toMillis()) {
        updates.isVip = false;
        updates.vipExpiry = null;
        changed = true;
      }

      // Check Diamond Expiry
      if (profile.isDiamond && profile.diamondExpiry && profile.diamondExpiry.toMillis() < now.toMillis()) {
        updates.isDiamond = false;
        updates.diamondExpiry = null;
        changed = true;
      }

      // Proactive Alert: within 24 hours
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (profile.isVip && profile.vipExpiry && !profile.isDiamond) {
        const remaining = profile.vipExpiry.toMillis() - now.toMillis();
        if (remaining > 0 && remaining < oneDayInMs) {
          addToast("VIP Expiring Soon", "Your VIP prestige ends in less than 24 hours. Renew now to stay elite!", "info");
        }
      }
      if (profile.isDiamond && profile.diamondExpiry) {
        const remaining = profile.diamondExpiry.toMillis() - now.toMillis();
        if (remaining > 0 && remaining < oneDayInMs) {
          addToast("Diamond Expiring Soon", "Your Diamond Elite status ends within 24 hours. Stay at the top!", "info");
        }
      }

      if (changed) {
        try {
          await updateDoc(doc(db, 'users', user.uid), updates);
          addToast("Status Expired", "Your elite membership has expired. Renew to continue enjoying premium features.", "info");
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    };

    // Check on load
    checkExpiry();

    // Check periodically (every minute)
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [user, profile]);

  // VIP Requests Listener
  useEffect(() => {
    if (!user || profile?.role !== 'owner') return;
    const q = query(collection(db, 'vip_requests'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVipRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vip_requests');
    });
    return unsubscribe;
  }, [user, profile]);

  // Ads Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ads');
    });
    return unsubscribe;
  }, [user]);

  // Land Join Requests Listener
  useEffect(() => {
    if (!user || !profile) return;
    const q = (profile.role === 'owner' || profile.role === 'admin')
      ? query(collection(db, 'land_join_requests'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'land_join_requests'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLandJoinRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandJoinRequest)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'land_join_requests');
    });
    return unsubscribe;
  }, [user, profile]);

  // Live Stream Moderation
  useEffect(() => {
    if (activeTab !== 'live' || !user) return;

    const moderateLive = async () => {
      // Simulate capturing a frame and moderating it
      const moderation = await moderateContent("data:image/jpeg;base64,...");
      if (moderation.isUnder13 || !moderation.isSafe) {
        setShowUnderageWarning(true);
        setActiveTab('profile');
        
        // If it's a safety violation, we could also log it or take other actions
        if (!moderation.isSafe) {
          addToast("Live Stream Ended", moderation.reason || "Safety violation detected.", "error");
        }
      }
    };

    const interval = setInterval(moderateLive, 10000); // Check every 10 seconds
    moderateLive(); // Initial check

    return () => clearInterval(interval);
  }, [activeTab, user]);
  useEffect(() => {
    if (!user) return;

    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const speed = position.coords.speed; // speed in m/s
        if (speed && speed > 5.5) { // ~20 km/h
          setDrivingWarningCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              auth.signOut();
              window.location.reload();
            } else {
              setIsDriving(true);
              // Auto-hide warning after 5 seconds to allow for 2nd/3rd detection
              setTimeout(() => setIsDriving(false), 5000);
            }
            return newCount;
          });
        }
      }, (error) => {
        console.error("Geolocation Error:", error);
      }, { enableHighAccuracy: true });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);
  useEffect(() => {
    if (!user || !activeLandId) return;
    const q = query(
      collection(db, 'land_messages'), 
      where('landId', '==', activeLandId),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const m = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandMessage));
      setLandMessages(m);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'land_messages');
    });
    return unsubscribe;
  }, [activeLandId]);

  // Following Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'follows'), where('followerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFollowing(snapshot.docs.map(doc => doc.data().followingId));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'follows');
    });
    return unsubscribe;
  }, [user]);

  // Followers Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'follows'), where('followingId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const followerIds = snapshot.docs.map(doc => doc.data().followerId);
      if (followerIds.length > 0) {
        const usersQ = query(collection(db, 'users'), where('uid', 'in', followerIds));
        const usersSnap = await getDocs(usersQ);
        setFollowers(usersSnap.docs.map(doc => doc.data() as UserProfile));
      } else {
        setFollowers([]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'follows');
    });
    return unsubscribe;
  }, [user]);

  // Gift Catalog Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'gift_catalog'), orderBy('price', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGiftCatalog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gift_catalog');
    });
    return unsubscribe;
  }, [user]);

  // All Users Listener (for Leaderboard)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users'), orderBy('followersCount', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return unsubscribe;
  }, [user]);

  // User Likes Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'likes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserLikes(snapshot.docs.map(doc => doc.data().postId));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'likes');
    });
    return unsubscribe;
  }, [user]);

  // Luxury Assets & Auctions Listener
  useEffect(() => {
    if (!user) return;
    const assetsUnsub = onSnapshot(collection(db, 'luxury_assets'), (snapshot) => {
      setLuxuryAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LuxuryAsset)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'luxury_assets');
    });
    const auctionsUnsub = onSnapshot(collection(db, 'auctions'), (snapshot) => {
      const auctions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Auction));
      setActiveAuction(auctions.find(a => a.status === 'active') || null);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'auctions');
    });
    return () => {
      assetsUnsub();
      auctionsUnsub();
    };
  }, [user]);

  const seedAds = async () => {
    if (!user) return;
    try {
      const adData: Omit<Ad, 'id'>[] = [
        {
          creatorId: user.uid,
          content: "https://assets.mixkit.co/videos/preview/mixkit-fashion-girl-in-a-pink-studio-40019-large.mp4",
          type: 'video',
          createdAt: Timestamp.now(),
          isAd: true
        },
        {
          creatorId: user.uid,
          content: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-luxury-watch-41007-large.mp4",
          type: 'video',
          createdAt: Timestamp.now(),
          isAd: true
        }
      ];

      for (const ad of adData) {
        await addDoc(collection(db, 'ads'), ad);
      }
      addToast("Ads Seeded", "Premium advertisements have been injected into the network.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'ads');
    }
  };

  const seedLuxuryAssets = async () => {
    if (luxuryAssets.length > 0) return;
    const initialAssets: Omit<LuxuryAsset, 'id'>[] = [
      {
        name: 'Diamond Encrusted Crown',
        description: 'The ultimate symbol of sovereignty in the melkahayu world.',
        price: 5000000,
        image: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=1000&auto=format&fit=crop',
        ownerId: 'system',
        history: [],
        isForSale: true,
        type: 'digital_jewelry'
      },
      {
        name: 'Blue Hole Private Island',
        description: 'A sanctuary of absolute privacy and crystal waters.',
        price: 25000000,
        image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1000&auto=format&fit=crop',
        ownerId: 'system',
        history: [],
        isForSale: true,
        type: 'private_island'
      }
    ];
    for (const asset of initialAssets) {
      await addDoc(collection(db, 'luxury_assets'), asset);
    }
    addToast("Excellence Established", "Luxury assets have been seeded for the elite.", "success");
  };

  const handleFollow = async (targetId: string) => {
    if (!user || user.uid === targetId) return;
    const isFollowing = following.includes(targetId);
    const followId = `${user.uid}_${targetId}`;

    if (isFollowing) {
      await deleteDoc(doc(db, 'follows', followId));
      await updateDoc(doc(db, 'users', user.uid), { followingCount: increment(-1) });
      await updateDoc(doc(db, 'users', targetId), { followersCount: increment(-1) });
    } else {
      await setDoc(doc(db, 'follows', followId), {
        followerId: user.uid,
        followingId: targetId,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'users', user.uid), { followingCount: increment(1) });
      await updateDoc(doc(db, 'users', targetId), { followersCount: increment(1) });
      createNotification(targetId, 'follow', 'started following you');
    }
  };

  const handleRequestToJoinLand = async (landId: string) => {
    if (!user || !profile) return;
    const land = lands.find(l => l.id === landId);
    if (!land) return;

    // Check if already requested
    const existing = landJoinRequests.find(r => r.landId === landId && r.userId === user.uid);
    if (existing) {
      addToast("Land Request", "You have already requested to join this Land. Please wait for approval.", "info");
      return;
    }

    try {
      await addDoc(collection(db, 'land_join_requests'), {
        landId,
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'land_join_requests');
    }

    createNotification(land.ownerId, 'system', `${profile.displayName} requested to join your Land: ${land.name}`);
    addToast("Land Request", "Join request sent! The owner will review your request.", "success");
  };

  const handleApproveJoinRequest = async (request: LandJoinRequest) => {
    if (!user) return;
    
    // Update request status
    await updateDoc(doc(db, 'land_join_requests', request.id), {
      status: 'approved'
    });

    // Add user to land members
    await updateDoc(doc(db, 'lands', request.landId), {
      members: arrayUnion(request.userId)
    });

    createNotification(request.userId, 'system', `Your request to join Land was approved! 🎉`);
    addToast("Request Approved", `${request.userName} is now a member.`, "success");
  };

  const handleRejectJoinRequest = async (requestId: string) => {
    await updateDoc(doc(db, 'land_join_requests', requestId), {
      status: 'rejected'
    });
  };

  const updateCoins = async (amount: number) => {
    if (!user || !profile) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        coins: (profile.coins || 0) + amount
      });
    } catch (e) {
      console.error("Coin update failed", e);
    }
  };

  const completeTask = (type: string) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.type === type && !task.completed) {
        updateCoins(task.reward);
        addToast("Mission Accomplished! 🎯", `You earned ${task.reward} Elite Coins.`, "success");
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  useEffect(() => {
    if (activeTab === 'profile') {
      completeTask('profile');
    }
  }, [activeTab]);

  // Listen for global broadcasts from owner
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'broadcasts'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const broadcast = snapshot.docs[0]?.data();
      if (broadcast && broadcast.createdAt && (!profile?.lastBroadcastSeen || broadcast.createdAt.toMillis() > profile.lastBroadcastSeen)) {
        toast.success(broadcast.text, { icon: '📢', duration: 6000 });
        // Update user's last seen broadcast
        if (user) {
          updateDoc(doc(db, 'users', user.uid), {
            lastBroadcastSeen: broadcast.createdAt.toMillis()
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'broadcasts');
    });
    return () => unsubscribe();
  }, [user, profile]);

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    try {
      await addDoc(collection(db, 'broadcasts'), {
        text: broadcastMessage,
        senderId: user?.uid,
        senderName: profile?.displayName || 'System Admin',
        createdAt: serverTimestamp(),
        type: 'owner_alert',
        isNew: true
      });
      setBroadcastMessage('');
      toast.success('Broadcast sent to all users!');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: editName,
      phoneNumber: editPhone,
      bio: editBio,
      photoURL: editPhoto,
      hidePhoneNumber: editHidePhone,
      diamondTheme: editDiamondTheme,
      hasBot: editHasBot
    });
    setIsEditingProfile(false);
    addToast("Success", "Profile updated ✨", "success");
  };

  const handleAddDevice = async () => {
    if (!user || !profile) return;
    
    // Simulate detecting a new device
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const platform = navigator.platform;
    
    const newDevice: Device = {
      id: Math.random().toString(36).substring(7),
      name: isMobile ? `Mobile Device (${platform})` : `Desktop System (${platform})`,
      type: isMobile ? 'mobile' : 'desktop',
      model: platform,
      lastUsed: Timestamp.now(),
      isCurrent: false
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        devices: arrayUnion(newDevice)
      });
      addToast("Device Linked", "New biometric device has been linked to your account.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const projectorStreamRef = useRef<MediaStream | null>(null);

  const toggleFlashlight = async (on: boolean) => {
    try {
      if (on) {
        setProjectorCalibration(true);
        setTimeout(async () => {
          setProjectorCalibration(false);
          if (useScreenProjector) {
            setFlashlightOn(true);
            return;
          }

          // Try Hardware Torch
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
            });
            projectorStreamRef.current = stream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            
            if (capabilities.torch) {
              await track.applyConstraints({
                advanced: [{ torch: true }]
              } as any);
              setFlashlightOn(true);
            } else {
              setUseScreenProjector(true);
              setFlashlightOn(true);
            }
          } catch (e) {
            setUseScreenProjector(true);
            setFlashlightOn(true);
          }
        }, 800);
      } else {
        if (projectorStreamRef.current) {
          projectorStreamRef.current.getTracks().forEach(t => t.stop());
          projectorStreamRef.current = null;
        }
        setFlashlightOn(false);
      }
    } catch (err) {
      console.error("Flashlight error:", err);
      setFlashlightOn(false);
    }
  };

  const handleVipRequestAction = async (requestId: string, userId: string, action: 'approved' | 'rejected', plan?: string, type?: string) => {
    try {
      await updateDoc(doc(db, 'vip_requests', requestId), { status: action });
      
      if (action === 'approved') {
        const now = new Date();
        let expiryDate = new Date();
        
        switch (plan) {
          case 'daily': expiryDate.setDate(now.getDate() + 1); break;
          case 'weekly': expiryDate.setDate(now.getDate() + 7); break;
          case 'monthly': expiryDate.setDate(now.getDate() + 30); break;
          case 'yearly': expiryDate.setDate(now.getDate() + 365); break;
          default: expiryDate.setDate(now.getDate() + 30);
        }

        const expiryTimestamp = Timestamp.fromDate(expiryDate);
        const updateData: any = {};
        
        if (type === 'diamond') {
          updateData.isDiamond = true;
          updateData.isVip = true;
          updateData.diamondExpiry = expiryTimestamp;
          updateData.vipExpiry = expiryTimestamp; // If they are diamond, they are also VIP
        } else {
          updateData.isVip = true;
          updateData.vipExpiry = expiryTimestamp;
        }

        await updateDoc(doc(db, 'users', userId), updateData);
        createNotification(userId, 'system', `✨ Your ${type === 'diamond' ? 'Diamond' : 'VIP'} status has been activated! Valid until ${expiryDate.toLocaleString()}. Enjoy the elite lifestyle.`);
        addToast("Elite Status Activated", `User has been upgraded to ${type?.toUpperCase()}.`, "success");
      } else {
        createNotification(userId, 'system', `Your VIP/Diamond request was declined. Please verify your transaction ID and try again.`);
        addToast("Request Declined", "The request has been rejected.", "info");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `vip_requests/${requestId}`);
    }
  };

  const handleAddAd = async () => {
    if (!adContent || !user) return;
    try {
      await addDoc(collection(db, 'ads'), {
        creatorId: user.uid,
        content: adContent,
        type: adType,
        createdAt: serverTimestamp(),
        isAd: true
      });
      setAdContent('');
      addToast("Ad Created", "New advertisement has been launched for VIP users.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ads');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
      addToast("Ad Removed", "The advertisement has been deactivated.", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'ads');
    }
  };

  const handleCreateLand = async () => {
    if (!user || !newLandName) return;
    const landData: any = {
      name: newLandName,
      description: newLandDescription,
      type: newLandType,
      ownerId: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
      isRestricted: newLandType === 'ministry'
    };

    if (newLandType === 'equb') {
      landData.equbAmount = newEqubAmount;
      landData.equbCycle = newEqubCycle;
    }

    const docRef = await addDoc(collection(db, 'lands'), landData);
    setActiveLandId(docRef.id);
    setShowCreateLand(false);
    setNewLandName('');
    setNewLandDescription('');
  };

  const handleSelectEqubWinner = async (landId: string) => {
    const land = lands.find(l => l.id === landId);
    if (!land || land.type !== 'equb' || land.members.length === 0) return;

    // AI selects a random winner from members
    const winnerId = land.members[Math.floor(Math.random() * land.members.length)];
    const winner = await getDoc(doc(db, 'users', winnerId));
    const winnerName = winner.exists() ? winner.data().displayName : 'Someone';

    await updateDoc(doc(db, 'lands', landId), {
      currentWinnerId: winnerId
    });

    // Send a system message about the winner
    await addDoc(collection(db, 'land_messages'), {
      landId,
      senderId: 'system',
      senderName: "Nahom's AI Assistant",
      senderPhoto: 'input_file_2.png',
      text: `🎊 Congratulations! AI has selected ${winnerName} as the winner of this Equb cycle! 🎊`,
      createdAt: serverTimestamp()
    });
  };

  const sendLandMessage = async () => {
    if (!user || !newLandMessage || !activeLandId) return;
    await addDoc(collection(db, 'land_messages'), {
      landId: activeLandId,
      senderId: user.uid,
      senderName: profile?.displayName,
      senderPhoto: profile?.photoURL,
      text: newLandMessage,
      createdAt: serverTimestamp()
    });
    setNewLandMessage('');
  };
  // Groups Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatGroup)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'groups');
    });
    return unsubscribe;
  }, [user]);

  // Channels Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'channels'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChannels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'channels');
    });
    return unsubscribe;
  }, [user]);

  // Chat Messages Listener
  useEffect(() => {
    if (!user || !activeChatId) return;
    const q = query(
      collection(db, 'chat_messages'), 
      where('chatId', '==', activeChatId),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chat_messages');
    });
    return unsubscribe;
  }, [user, activeChatId]);

  // Comments Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });
    return unsubscribe;
  }, [user]);

  // Mood Posts Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'mood_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMoodPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodPost)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'mood_posts');
    });
    return unsubscribe;
  }, [user]);

  // Mood Matches Listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'mood_matches'), 
      where('users', 'array-contains', user.uid),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveMatch({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MoodMatch);
      } else {
        setActiveMatch(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'mood_matches');
    });
    return unsubscribe;
  }, [user]);

  const handleCreateChat = async () => {
    if (!user || !newChatName) return;
    
    const collectionName = newChatType === 'group' ? 'groups' : 'channels';
    const data = {
      name: newChatName,
      description: newChatDesc,
      creatorId: user.uid,
      isAnonymousCreator: isAnonymousGroup,
      createdAt: serverTimestamp(),
      type: newChatType,
      [newChatType === 'group' ? 'members' : 'subscribers']: [user.uid]
    };

    await addDoc(collection(db, collectionName), data);
    setShowCreateChat(false);
    setNewChatName('');
    setNewChatDesc('');
    setIsAnonymousGroup(false);
  };

  const sendChatMessage = async () => {
    if (!user || !newChatMessage || !activeChatId) return;
    
    const activeGroup = groups.find(g => g.id === activeChatId);
    const activeChannel = channels.find(c => c.id === activeChatId);
    
    if (activeChannel && activeChannel.creatorId !== user.uid) {
      addToast("Access Denied", "Only the creator can send messages in a channel!", "error");
      return;
    }

    const isAnonymousSender = activeGroup?.creatorId === user.uid && activeGroup?.isAnonymousCreator;

    await addDoc(collection(db, 'chat_messages'), {
      chatId: activeChatId,
      senderId: user.uid,
      senderName: isAnonymousSender ? 'Member' : (profile?.displayName || 'User'),
      senderPhoto: isAnonymousSender ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}` : (profile?.photoURL || ''),
      text: newChatMessage,
      createdAt: serverTimestamp()
    });
    setNewChatMessage('');
    completeTask('message');

    // Diamond Feature: Profile Bot Auto-reply
    const recipientDiamondUser = allUsers.find(u => 
      u.isDiamond && u.hasBot && (
        (activeGroup?.creatorId === u.uid) || 
        (activeChannel?.creatorId === u.uid) ||
        (activeMatch?.users?.includes(u.uid) && u.uid !== user.uid)
      )
    );

    if (recipientDiamondUser) {
      setTimeout(async () => {
        await addDoc(collection(db, 'chat_messages'), {
          chatId: activeChatId,
          senderId: `bot_${recipientDiamondUser.uid}`,
          senderName: `${recipientDiamondUser.displayName}'s Bot`,
          senderPhoto: 'input_file_2.png',
          text: `[Bot] ${recipientDiamondUser.displayName} is currently busy, but I'm here to help! 🤖✨`,
          createdAt: serverTimestamp()
        });
      }, 2000);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    await updateDoc(doc(db, 'groups', groupId), {
      members: group.members.filter(m => m !== user.uid)
    });
    setActiveChatId(null);
    addToast("Chat", "You have left the group.", "info");
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayUnion(user.uid)
    });
  };

  const subscribeChannel = async (channelId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'channels', channelId), {
      subscribers: arrayUnion(user.uid)
    });
  };

const isEmojiOnly = (text: string) => {
    const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/;
    return emojiRegex.test(text.trim());
  };

  const handleShare = async (title: string, text: string) => {
    setShareContent({ title, text });
    setSelectedFollowers([]);
    setShowShareModal(true);
  };

  const handleFinalShare = async () => {
    if (!user || !shareContent) return;

    // Share to selected followers via inbox
    for (const followerId of selectedFollowers) {
      const chatId = [user.uid, followerId].sort().join('_');
      await addDoc(collection(db, 'chat_messages'), {
        chatId,
        senderId: user.uid,
        senderName: profile?.displayName,
        senderPhoto: profile?.photoURL,
        text: `Shared: ${shareContent.title}\n${shareContent.text}\n${window.location.href}`,
        createdAt: serverTimestamp()
      });
    }

    // Also use native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.text,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }

    setShowShareModal(false);
    completeTask('share');
    addToast("Shared", `Shared with ${selectedFollowers.length} followers!`, "success");
  };
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showRoyalWelcome, setShowRoyalWelcome] = useState(false);
  const [showDevicesManager, setShowDevicesManager] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const loginInProgress = useRef(false);
  const handleLogin = async () => {
    if (loginInProgress.current || !phoneNumber) return;
    
    loginInProgress.current = true;
    setIsLoggingIn(true);
    
    try {
      if (!recaptchaVerifier.current && recaptchaRef.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
          size: 'invisible',
        });
      }

      await setPersistence(auth, browserLocalPersistence);
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current!);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      addToast("OTP Sent", "Verification code sent to your phone.", "success");
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error("Phone sign-in is not enabled. Please use Google Login or contact the administrator.");
      } else {
        toast.error(`Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      loginInProgress.current = false;
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      // Force user to re-authenticate (ask for password)
      provider.setCustomParameters({ prompt: 'login' });
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
      
      // Trigger Royal Welcome
      setShowRoyalWelcome(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFD700', '#FFFFFF']
      });

      // Auto-hide royal welcome after 4 seconds
      setTimeout(() => setShowRoyalWelcome(false), 4000);

      addToast("Royal Access Granted", "Welcome to Nahom's Royal Kingdom! 👑", "success");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error("Google sign-in is not enabled in Firebase Console.");
      } else {
        toast.error(`Google sign-in failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !verificationCode || isLoggingIn) return;
    
    setIsLoggingIn(true);
    try {
      await confirmationResult.confirm(verificationCode);
      
      // Trigger Royal Welcome
      setShowRoyalWelcome(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFD700', '#FFFFFF']
      });

      // Auto-hide royal welcome after 4 seconds
      setTimeout(() => setShowRoyalWelcome(false), 4000);

      addToast("Royal Access Granted", "Welcome to Nahom's Royal Kingdom! 👑", "success");
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast.error(`Verification failed: ${error.message || 'Invalid code'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [showInnovationForm, setShowInnovationForm] = useState(false);
  const [proposals, setProposals] = useState<InnovationProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<InnovationProposal | null>(null);

  const handleProposalSubmit = async (proposalData: any) => {
    if (!user || !profile) return;
    
    try {
      const docRef = await addDoc(collection(db, 'innovation_proposals'), {
        ...proposalData,
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL,
        status: 'submitted',
        createdAt: serverTimestamp()
      });
      addToast("Success", "Proposal submitted for review! ✨", "success");
      setShowInnovationForm(false);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#ffffff']
      });
    } catch (err) {
      console.error("Error submitting proposal:", err);
      toast.error("Failed to submit proposal. Please try again.");
    }
  };

  const submitVipRequest = async () => {
    if (!user || !transactionId) return;
    await addDoc(collection(db, 'vip_requests'), {
      userId: user.uid,
      transactionId,
      plan: selectedPlan,
      type: isDiamondTab ? 'diamond' : 'vip',
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    setTransactionId('');
    setShowVipModal(false);
    setShowVipSelection(false);
    addToast(isDiamondTab ? "የDiamond ጥያቄ" : "የVIP ጥያቄ", isDiamondTab ? "የDiamond ጥያቄዎ ተልኳል! በቅርቡ እናረጋግጣለን።" : "የVIP ጥያቄዎ ተልኳል! በቅርቡ እናረጋግጣለን።", "success");
  };

  const handleAddComment = async () => {
    if (!user || !activeCommentPostId || !newCommentText.trim()) return;

    await addDoc(collection(db, 'comments'), {
      postId: activeCommentPostId,
      userId: user.uid,
      userName: profile?.displayName || 'User',
      userPhoto: profile?.photoURL || '',
      text: newCommentText,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'posts', activeCommentPostId), {
      commentsCount: increment(1)
    });

    const postSnap = await getDoc(doc(db, 'posts', activeCommentPostId));
    if (postSnap.exists()) {
      const postData = postSnap.data();
      createNotification(postData.authorId, 'comment', `commented: ${newCommentText.substring(0, 30)}${newCommentText.length > 30 ? '...' : ''}`, activeCommentPostId);
    }

    setNewCommentText('');
  };

  const handleMoodSelect = async (mood: MoodType) => {
    if (!user) return;
    setCurrentMood(mood);
    setShowMoodSelection(false);
    
    // Update user profile with current mood
    await updateDoc(doc(db, 'users', user.uid), {
      currentMood: mood,
      lastMoodUpdate: serverTimestamp()
    });
  };

  const handleMoodMatch = async () => {
    if (!user || !currentMood || isMatching) return;
    
    setIsMatching(true);
    
    try {
      // Find other users with same mood who are not already matched
      const q = query(
        collection(db, 'users'),
        where('currentMood', '==', currentMood),
        where('uid', '!=', user.uid),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const potentialMatches = snapshot.docs.filter(doc => doc.id !== user.uid);
      
      if (potentialMatches.length > 0) {
        const matchUser = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
        
        // Create a new match
        const matchData: any = {
          users: [user.uid, matchUser.id],
          mood: currentMood,
          createdAt: serverTimestamp(),
          status: 'active'
        };
        
        const matchDoc = await addDoc(collection(db, 'mood_matches'), matchData);
        setActiveMatch({ id: matchDoc.id, ...matchData });
        
        // Create a chat group for the match
        const chatId = [user.uid, matchUser.id].sort().join('_');
        setActiveChatId(chatId);
        setActiveTab('inbox');
        createNotification(matchUser.id, 'system', `You matched with someone who feels ${currentMood}! 🤝`);
        addToast("AI Match Found!", `Someone feels ${currentMood} just like you. 🤝`, "success");
      } else {
        addToast("No Match", "No immediate matches found. We'll notify you when someone feels like you! 🔔", "info");
      }
    } catch (error) {
      console.error("Matching error:", error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleAddMoodPost = async (text: string, isAnonymous: boolean) => {
    if (!user || !currentMood || !text.trim()) return;
    
    await addDoc(collection(db, 'mood_posts'), {
      userId: user.uid,
      mood: currentMood,
      text,
      reactions: { heart: 0, hug: 0, thumb: 0 },
      createdAt: serverTimestamp(),
      isAnonymous
    });
    
    addToast("Mood Shared", "Mood shared! ✨", "success");
  };

  const handleMoodReact = async (postId: string, type: 'heart' | 'hug' | 'thumb') => {
    const postRef = doc(db, 'mood_posts', postId);
    await updateDoc(postRef, {
      [`reactions.${type}`]: increment(1)
    });

    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      const emojiMap = { heart: '❤️', hug: '🤗', thumb: '👍' };
      createNotification(postData.userId, 'like', `reacted ${emojiMap[type]} to your mood`);
    }
  };

  const handleViewPost = async (postId: string, collectionName: 'posts' | 'mood_posts' = 'posts') => {
    if (!user) return;
    const postRef = doc(db, collectionName, postId);
    await updateDoc(postRef, {
      views: increment(1),
      seenBy: arrayUnion(user.uid)
    });
  };

  const handleShowSeenBy = async (uids: string[]) => {
    if (!uids || uids.length === 0) {
      setSeenByUsers([]);
      setShowSeenByModal(true);
      return;
    }
    
    const usersList: UserProfile[] = [];
    for (const uid of uids.slice(0, 15)) {
      const uDoc = await getDoc(doc(db, 'users', uid));
      if (uDoc.exists()) {
        usersList.push(uDoc.data() as UserProfile);
      }
    }
    setSeenByUsers(usersList);
    setShowSeenByModal(true);
  };

  const handleLike = async (postId: string, e?: React.MouseEvent) => {
    if (!user) return;
    const likeId = `${postId}_${user.uid}`;
    const isLiked = userLikes.includes(postId);

    if (isLiked) {
      // Unlike
      await deleteDoc(doc(db, 'likes', likeId));
      await updateDoc(doc(db, 'posts', postId), {
        likes: increment(-1)
      });
    } else {
      // Like
      await setDoc(doc(db, 'likes', likeId), {
        postId,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'posts', postId), {
        likes: increment(1)
      });
      completeTask('reaction');

      const postSnap = await getDoc(doc(db, 'posts', postId));
      if (postSnap.exists()) {
        const postData = postSnap.data();
        createNotification(postData.authorId, 'like', 'liked your post', postId);
      }

      if (e) {
        const newHearts = Array.from({ length: 8 }).map((_, i) => ({
          id: Date.now() + i,
          x: e.clientX + (Math.random() * 40 - 20),
          y: e.clientY - (Math.random() * 20)
        }));
        setHearts(prev => [...prev, ...newHearts]);
        setTimeout(() => {
          setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
        }, 1000);

        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#D4AF37', '#F9E27D']
        });
      }
    }
  };

  const handleSendGift = async (recipientId: string, gift: Gift) => {
    if (!user || !profile || profile.coins < gift.price) {
      addToast("ስህተት", "በቂ ብር የለዎትም!", "error");
      return;
    }

    const commission = Math.floor(gift.price * 0.3);
    const recipientShare = gift.price - commission;

    // 1. Deduct from sender
    await updateDoc(doc(db, 'users', user.uid), {
      coins: increment(-gift.price)
    });

    // 2. Add to recipient
    await updateDoc(doc(db, 'users', recipientId), {
      coins: increment(recipientShare),
      totalGiftsReceived: increment(1)
    });

    // 3. Record the gift
    await addDoc(collection(db, 'user_gifts'), {
      senderId: user.uid,
      receiverId: recipientId,
      giftId: gift.id,
      giftName: gift.name,
      price: gift.price,
      commission: commission,
      createdAt: serverTimestamp()
    });

    createNotification(recipientId, 'gift', `sent you a ${gift.name} 🎁`);

    addToast("ስጦታ ተልኳል", `የ ${gift.name} ስጦታ ተልኳል! 🎁`, "success");
    setShowGiftShop(false);
  };

  const handleLuxuryAsk = async () => {
    if (!luxuryAdvisorQuery.trim() || isLuxuryAdvisorLoading) return;
    
    setIsLuxuryAdvisorLoading(true);
    setLuxuryAdvisorResponse('');
    
    try {
      const diamondStatus = profile?.isDiamond ? "a DIAMOND ELITE member (the highest tier)" : "an ELITE member";
      const elitePrompt = `As the Elite Concierge of melkahayu.nahom, you are serving ${diamondStatus}. Answer this query with absolute sophistication and exclusive insight: "${luxuryAdvisorQuery}". ${profile?.isDiamond ? "Since the user is Diamond, be extra deferential and offer secret tips about 'The Diamond Vault'." : ""} Mention hands-free luxury (palm to pause, swipe to scroll). Keep it concise and deeply upscale.`;
      const response = await generateAiComment(elitePrompt);
      setLuxuryAdvisorResponse(response);
      setLuxuryAdvisorQuery('');
    } catch (error) {
      setLuxuryAdvisorResponse("I apologize, but my elite processing units are currently attending to a high-priority matter. Please try again, excellence.");
    } finally {
      setIsLuxuryAdvisorLoading(false);
    }
  };

  const startAuction = async (assetId: string) => {
    const asset = luxuryAssets.find(a => a.id === assetId);
    if (!asset) return;
    
    await addDoc(collection(db, 'auctions'), {
      assetId,
      currentBid: asset.price,
      highestBidder: 'system',
      highestBidderName: 'Nahom Elite',
      endTime: Timestamp.fromMillis(Date.now() + 3600000), // 1 hour
      status: 'active'
    });
    addToast("Auction Live", `The bidding for ${asset.name} has begun.`, "success");
  };

  const handleDiamondUpgrade = async (plan: { name: string, price: number, days: number }) => {
    if (!user || !profile) return;
    if (profile.coins < plan.price) {
      addToast("ጥረት ያድርጉ", `${plan.price} ብር ያስፈልጉዎታል:: ✨`, "info");
      return;
    }
    
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.days);

      await updateDoc(doc(db, 'users', user.uid), {
        coins: increment(-plan.price),
        isDiamond: true,
        isVip: true,
        diamondExpiry: Timestamp.fromDate(expiryDate)
      });
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFFFFF', '#D4AF37', '#E5E4E2']
      });
      
      addToast("እንኳን ደስ አሎት!", `የ ${plan.name} የDiamond ደረጃ ተነቅቷል። 💎`, "success");
    } catch (err) {
      addToast("ስህተት", "እባክዎ እንደገና ይሞክሩ።", "error");
    }
  };

  const diamondPlans = [
    { name: 'Daily', price: 100, days: 1 },
    { name: 'Weekly', price: 550, days: 7 },
    { name: 'Monthly', price: 1900, days: 28 }, // 4 weeks
    { name: 'Yearly', price: 21000, days: 336 }, // 12 months (4 weeks each)
  ];

  const seedGifts = async () => {
    if (giftCatalog.length > 0) return;
    const initialGifts = [
      { name: 'Rose', price: 10, icon: '🌹' },
      { name: 'Coffee', price: 50, icon: '☕' },
      { name: 'Heart', price: 100, icon: '❤️' },
      { name: 'Crown', price: 500, icon: '👑' },
      { name: 'Car', price: 1000, icon: '🚗' },
      { name: 'Yacht', price: 5000, icon: '🚢' },
      { name: 'Private Jet', price: 25000, icon: '🛩️' },
      { name: 'Private Island', price: 100000, icon: '🏝️' },
      { name: 'Moon Land', price: 500000, icon: '🌙' },
      { name: 'Solar System', price: 1000000, icon: '☀️' },
    ];
    for (const g of initialGifts) {
      await addDoc(collection(db, 'gift_catalog'), g);
    }
  };

  if (loading || showSplash) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black-pure p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 blur-[150px] rounded-full animate-pulse delay-700" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center w-full max-w-md z-10"
        >
          <div className="w-56 h-56 mx-auto mb-8 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-20px] border border-gold/10 rounded-full"
            />
            <img 
              src="input_file_1.png" 
              alt="melkahayu.nahom Logo" 
              className="w-full h-full object-contain relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <h1 className="text-4xl font-black text-gold mb-4 italic tracking-tight font-serif uppercase">
            melkahayu.nahom
          </h1>

          <div className="space-y-6 mt-12">
            <div className="w-64 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                onAnimationComplete={() => setShowSplash(false)}
                className="h-full bg-gold shadow-[0_0_15px_#D4AF37]"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <p className="text-gold text-[10px] uppercase tracking-[0.6em] font-black">
                VIP Elite Network
              </p>
              
              <div className="pt-4">
                <p className="text-gray-500 text-[8px] uppercase tracking-[0.4em] font-medium animate-pulse">
                  System Initializing...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Decorative corner elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-gold/20 rounded-tl-3xl" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-gold/20 rounded-br-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black-pure p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="w-64 h-64 mx-auto mb-6">
            <img 
              src="input_file_1.png" 
              alt="melkahayu.nahom Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-bold text-gold mb-2 italic font-serif">
            melkahayu.nahom
          </h1>
          <p className="text-gold/60 uppercase tracking-[0.4em] text-[10px] font-bold mb-2">Exclusive VIP Social Experience</p>
          <p className="text-gray-500 uppercase tracking-[0.2em] text-[8px] font-medium">Connect through your mood</p>
        </motion.div>
        <div className="w-full max-w-sm space-y-4">
          <div ref={recaptchaRef}></div>
          
          {!showOtpInput ? (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40" />
                <input
                  type="tel"
                  placeholder="+251 911..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-white/5 border border-gold/20 rounded-2xl py-4 pl-12 pr-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn || !phoneNumber}
                  className={cn(
                    "flex-1 py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2",
                    (isLoggingIn || !phoneNumber) && "opacity-70 cursor-not-allowed scale-100 shadow-none"
                  )}
                >
                  {isLoggingIn && !confirmationResult ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Phone Login"
                  )}
                </button>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className={cn(
                    "flex-1 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-full hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2",
                    isLoggingIn && "opacity-70 cursor-not-allowed scale-100 shadow-none"
                  )}
                >
                  <Globe className="w-4 h-4 text-gold" />
                  Google Login
                </button>
              </div>
              <div className="text-center">
                <p className="text-[8px] text-gray-500 uppercase tracking-widest leading-relaxed">
                  By connecting, you agree to our <br />
                  <span className="text-gold/60 cursor-pointer">Terms of Service</span> & <span className="text-gold/60 cursor-pointer">Privacy Policy</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40" />
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-white/5 border border-gold/20 rounded-2xl py-4 pl-12 pr-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/50 transition-all font-mono tracking-[0.5em] text-center"
                />
              </div>
              <button 
                onClick={handleVerifyOtp}
                disabled={isLoggingIn || !verificationCode}
                className={cn(
                  "w-full py-4 bg-gold text-black font-bold rounded-full hover:bg-gold-light transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3",
                  (isLoggingIn || !verificationCode) && "opacity-70 cursor-not-allowed scale-100 shadow-none"
                )}
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Connect"
                )}
              </button>
              <button 
                onClick={() => setShowOtpInput(false)}
                className="w-full py-2 text-gold/40 text-xs hover:text-gold transition-colors"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user && isAppLocked && user.email !== 'yewubdarhaileyesus8@gmail.com') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black-pure p-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10 w-full max-w-sm"
        >
          <div className="w-48 h-48 mx-auto mb-12 relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gold/20 rounded-full blur-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanFace className="w-24 h-24 text-gold animate-pulse" />
            </div>
            
            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-gold shadow-[0_0_15px_#D4AF37] z-20"
            />
          </div>

          <h2 className="text-3xl font-bold text-gold mb-2 italic font-serif">melkahayu.nahom</h2>
          <p className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-bold mb-12">Security Verification Required</p>

          <div className="space-y-4">
            <button 
              onClick={() => {
                addToast("Verifying", "Scanning face and palm... 👋", "info");
                setTimeout(() => {
                  setIsAppLocked(false);
                  addToast("Unlocked", "Welcome back, Luxury Member. ✨", "success");
                }, 1500);
              }}
              className="w-full py-5 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3 active:scale-95"
            >
              <Fingerprint className="w-6 h-6" />
              Scan to Unlock
            </button>
            
            <p className="text-gray-600 text-xs mt-8">
              Verify your identity to access your private mood feed.
            </p>
          </div>
        </motion.div>
        
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <div className="flex justify-center gap-8 text-gray-700">
            <Shield className="w-5 h-5" />
            <Lock className="w-5 h-5" />
            <ScanFace className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black-pure text-white flex flex-col overflow-hidden relative">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Fake Call Settings Modal */}
      <AnimatePresence>
        {showFakeCallModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1500] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-black-soft border border-gold/30 rounded-[40px] p-8 w-full max-w-md text-center relative"
            >
              <button 
                onClick={() => setShowFakeCallModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
              >
                <ArrowLeft className="w-6 h-6 text-gold" />
              </button>

              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-gold" />
              </div>

              <h2 className="text-3xl font-bold mb-2 gold-gradient bg-clip-text text-transparent italic font-serif">Fake Call</h2>
              <p className="text-gray-400 mb-8">Set up a fake call for difficult situations. (melkahayu.nahom)</p>

              <div className="space-y-4 mb-8">
                <div className="text-left">
                  <label className="text-[10px] text-gold uppercase font-bold mb-1 block">Caller Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mom, Boss, Friend" 
                    value={fakeCallName}
                    onChange={(e) => setFakeCallName(e.target.value)}
                    className="w-full bg-black border border-gold/20 rounded-xl p-4 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] text-gold uppercase font-bold mb-1 block">Caller Number</label>
                  <input 
                    type="text" 
                    placeholder="+251 ..." 
                    value={fakeCallNumber}
                    onChange={(e) => setFakeCallNumber(e.target.value)}
                    className="w-full bg-black border border-gold/20 rounded-xl p-4 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] text-gold uppercase font-bold mb-1 block">Schedule Time</label>
                  <input 
                    type="time" 
                    value={fakeCallTime}
                    onChange={(e) => setFakeCallTime(e.target.value)}
                    className="w-full bg-black border border-gold/20 rounded-xl p-4 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!fakeCallName || !fakeCallTime) {
                    addToast("Field Required", "Please fill in the name and time.", "error");
                    return;
                  }
                  setIsFakeCallActive(true);
                  setShowFakeCallModal(false);
                  addToast("Fake Call Scheduled", `Fake call scheduled for ${fakeCallTime}`, "success");
                }}
                className="w-full py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              >
                {isFakeCallActive ? 'Update Schedule' : 'Schedule Call'}
              </button>
              
              {isFakeCallActive && (
                <button 
                  onClick={() => {
                    setIsFakeCallActive(false);
                    addToast("Fake Call Cancelled", "Fake call cancelled.", "info");
                  }}
                  className="w-full py-4 mt-4 text-red-500 font-bold bg-red-500/5 rounded-2xl border border-red-500/20"
                >
                  Cancel Schedule
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Fake Call Screen */}
      <AnimatePresence>
        {incomingFakeCall && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 bg-black-pure z-[2000] flex flex-col items-center justify-between py-20 px-8"
          >
            <div className="text-center">
              <p className="text-gold uppercase tracking-[0.5em] text-xs mb-4">Incoming Call</p>
              <h2 className="text-5xl font-bold mb-2">{fakeCallName}</h2>
              <p className="text-gray-400 text-xl">{fakeCallNumber || 'melkahayu.nahom'}</p>
            </div>

            <div className="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center relative">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 border-2 border-gold/20 rounded-full"
              />
              <UserIcon className="w-24 h-24 text-gold" />
            </div>

            <div className="flex justify-between w-full max-w-xs">
              <button 
                onClick={() => setIncomingFakeCall(false)}
                className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Phone className="w-8 h-8 text-white rotate-[135deg]" />
              </button>
              <button 
                onClick={handleAnswerFakeCall}
                className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Phone className="w-8 h-8 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answered Fake Call Screen */}
      <AnimatePresence>
        {isFakeCallAnswered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black-pure z-[2100] flex flex-col items-center justify-between py-20 px-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{fakeCallName}</h2>
              <p className="text-gold text-sm font-bold animate-pulse">00:04</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
              <div className="w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center mb-8">
                <UserIcon className="w-16 h-16 text-gold" />
              </div>
              
              <div className="bg-white/5 border border-gold/20 rounded-3xl p-6 w-full text-center">
                {fakeCallAiResponse ? (
                  <p className="text-xl italic text-gray-200">"{fakeCallAiResponse}"</p>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-gold rounded-full" />
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gold rounded-full" />
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gold rounded-full" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center"><Video className="w-6 h-6 text-white" /></div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Video</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center"><Plus className="w-6 h-6 text-white" /></div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Add</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center"><Users className="w-6 h-6 text-white" /></div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Contacts</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsFakeCallAnswered(false);
                setIncomingFakeCall(false);
                setFakeCallAiResponse('');
              }}
              className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Phone className="w-8 h-8 text-white rotate-[135deg]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moderation Overlay */}
      <AnimatePresence>
        {isModerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1200] flex flex-col items-center justify-center p-6"
          >
            <div className="w-24 h-24 relative mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-gold/20 border-t-gold rounded-full"
              />
              <ShieldCheck className="w-12 h-12 text-gold absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-2">AI Moderation</h3>
            <p className="text-gray-400">Ensuring a safe environment for everyone...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline VIP Warning */}
      <AnimatePresence>
        {isOffline && !profile?.isVip && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-20 left-4 right-4 bg-gold text-black p-4 rounded-2xl z-[800] flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5" />
              <p className="text-xs font-bold uppercase">VIP Required for Offline Mode</p>
            </div>
            <button 
              onClick={() => setShowVipSelection(true)}
              className="px-4 py-1 bg-black text-gold rounded-full text-[10px] font-bold"
            >
              Upgrade
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Underage Warning */}
      <AnimatePresence>
        {showUnderageWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[1100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-black-soft border border-red-500/30 rounded-[40px] p-8 w-full max-w-md text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Safety Restriction</h2>
              <p className="text-gray-400 mb-8">Live streaming is restricted for users under 13 years old to ensure a safe environment. Please contact support if you believe this is an error.</p>
              <button 
                onClick={() => setShowUnderageWarning(false)}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driving Warning */}
      <AnimatePresence>
        {isDriving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600 z-[1000] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8"
            >
              <Shield className="w-16 h-16 text-red-600" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4">Safety Warning!</h2>
            <p className="text-xl text-white/80 mb-2">It looks like you're driving. Please focus on the road!</p>
            <p className="text-2xl font-bold text-white mb-8">Warning {drivingWarningCount}/3</p>
            
            {drivingWarningCount < 3 && (
              <button 
                onClick={() => setIsDriving(false)}
                className="px-12 py-4 bg-white text-red-600 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl"
              >
                I am a passenger
              </button>
            )}

            {drivingWarningCount >= 2 && (
              <p className="mt-8 text-white/60 text-sm animate-pulse">Next warning will automatically close the app.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIP Selection Modal */}
      <AnimatePresence>
        {showVipSelection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[900] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-black-soft border border-gold/30 rounded-[40px] p-8 w-full max-w-md text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
              
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-gold" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2 gold-gradient bg-clip-text text-transparent italic font-serif">Exclusive Access</h2>
              <p className="text-gray-400 mb-8">Choose your plan to unlock full offline features and luxury benefits.</p>
              
              <div className="flex p-1.5 bg-black/60 rounded-3xl border border-white/10 mb-8 backdrop-blur-xl">
                <button 
                  onClick={() => setIsDiamondTab(false)}
                  className={cn(
                    "flex-1 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2",
                    !isDiamondTab ? "bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]" : "text-gray-500 hover:text-gold"
                  )}
                >
                  <Crown className="w-4 h-4" /> VIP ELITE
                </button>
                <button 
                  onClick={() => setIsDiamondTab(true)}
                  className={cn(
                    "flex-1 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2",
                    isDiamondTab ? "diamond-purple-pink text-white shadow-[0_0_20px_rgba(255,0,255,0.4)]" : "text-gray-500 hover:text-purple-400"
                  )}
                >
                  <Sparkles className="w-4 h-4" /> DIAMOND
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {isDiamondTab ? (
                  diamondPlans.map(plan => (
                    <PlanCard 
                      key={plan.name}
                      title={`${plan.name} Diamond Luxury`} 
                      price={`${plan.price} ብር`} 
                      selected={selectedPlan === plan.name.toLowerCase()} 
                      onClick={() => setSelectedPlan(plan.name.toLowerCase() as any)} 
                    />
                  ))
                ) : (
                  <>
                    <PlanCard 
                      title="Daily Pro VIP" 
                      price="15 ብር" 
                      selected={selectedPlan === 'daily'} 
                      onClick={() => setSelectedPlan('daily')} 
                    />
                    <PlanCard 
                      title="Weekly Pro VIP" 
                      price="50 ብር" 
                      selected={selectedPlan === 'weekly'} 
                      onClick={() => setSelectedPlan('weekly')} 
                    />
                    <PlanCard 
                      title="Monthly Pro VIP" 
                      price="200 ብር" 
                      selected={selectedPlan === 'monthly'} 
                      onClick={() => setSelectedPlan('monthly')} 
                    />
                    <PlanCard 
                      title="Annual King VIP" 
                      price="5000 ብር" 
                      selected={selectedPlan === 'yearly'} 
                      onClick={() => setSelectedPlan('yearly')} 
                    />
                  </>
                )}
              </div>
              
              <button 
                onClick={() => setShowVipModal(true)}
                className={cn(
                  "w-full py-5 font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl mb-6 flex items-center justify-center gap-3",
                  isDiamondTab ? "diamond-purple-pink text-white" : "bg-gold text-black"
                )}
              >
                {isDiamondTab ? <Sparkles className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                {isDiamondTab ? 'Upgrade to Diamond' : 'Activate VIP Now'}
              </button>
              
              <button 
                onClick={() => setShowVipSelection(false)}
                className="text-gray-500 text-sm font-medium hover:text-white transition-colors"
              >
                Continue with limited access
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={cn(
        "p-4 flex justify-between items-center z-50 transition-all duration-300",
        activeTab === 'home' && !viewingUserId 
          ? "absolute top-0 left-0 right-0 bg-transparent border-none" 
          : "bg-black-soft/80 backdrop-blur-md border-b border-gold/20"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/30 cursor-pointer" onClick={() => setActiveTab('home')}>
            <img 
              src="input_file_1.png" 
              alt="Logo" 
              className="w-full h-full object-cover scale-[1.3]"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-black gold-gradient bg-clip-text text-transparent italic tracking-tighter">melka</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProjector(true)}
            className="p-2 bg-gold/10 border border-gold/30 rounded-full text-gold hover:bg-gold/20 transition-all"
          >
            <Flashlight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-gold/30">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-gold font-bold">{profile?.coins || 0} ብር</span>
          </div>
          {profile?.isDiamond && (
            <div className="diamond-purple-pink text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-[0_0_15px_rgba(255,0,255,0.4)]">
              <Sparkles className="w-3 h-3" /> DIAMOND
            </div>
          )}
          {profile?.isVip && !profile?.isDiamond && (
            <div className="vip-shine bg-gold text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" /> VIP
            </div>
          )}
          {!profile?.isDiamond && (
            <button 
              onClick={() => setActiveTab('rewards')}
              className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 hover:bg-purple-500/20 transition-all"
            >
              <Gem className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1", activeTab !== 'home' || viewingUserId ? "overflow-y-auto pb-20" : "h-full")}>
        {activeTab === 'home' && (
          <div className="flex-1 h-full flex flex-col overflow-hidden relative">
            {!isElite ? (
              <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-black-pure text-center">
                <Crown className="w-24 h-24 text-gold mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl font-bold text-gold mb-4 italic font-serif">Premium Access Only</h2>
                <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
                  <div className="p-4 bg-white/5 border border-gold/30 rounded-3xl">
                    <Crown className="w-8 h-8 text-gold mx-auto mb-2" />
                    <p className="text-xs font-bold text-white uppercase">VIP Elite</p>
                    <p className="text-[10px] text-gray-500">Premium Feed</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-purple-500/30 rounded-3xl">
                    <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white uppercase">Diamond</p>
                    <p className="text-[10px] text-gray-500">Aura & Owls</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVipSelection(true)}
                  className="px-12 py-5 bg-gold text-black font-extrabold rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] uppercase tracking-widest text-sm w-full max-w-sm"
                >
                  Join the Elite Class
                </button>
              </div>
            ) : (
              <>
                <div className="absolute top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 flex justify-between items-center">
                  <div className="w-10 h-10" /> {/* Spacer */}
                  <div className="flex gap-8">
                    <button 
                      onClick={() => setHomeSubTab('moods')}
                      className={cn(
                        "text-sm font-bold uppercase tracking-widest transition-all relative py-2",
                        homeSubTab === 'moods' ? "text-gold scale-110" : "text-white/40 hover:text-white/80"
                      )}
                    >
                      Feelings
                      {homeSubTab === 'moods' && <motion.div layoutId="activeSubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" />}
                    </button>
                    <button 
                      onClick={() => setHomeSubTab('videos')}
                      className={cn(
                        "text-sm font-bold uppercase tracking-widest transition-all relative py-2",
                        homeSubTab === 'videos' ? "text-gold scale-110" : "text-white/40 hover:text-white/80"
                      )}
                    >
                      Videos
                      {homeSubTab === 'videos' && <motion.div layoutId="activeSubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" />}
                    </button>
                    <button 
                      onClick={() => setHomeSubTab('offline')}
                      className={cn(
                        "text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-1 py-2",
                        homeSubTab === 'offline' ? "text-gold scale-110" : "text-white/40 hover:text-white/80"
                      )}
                    >
                      Offline {!isElite && <Crown className="w-3 h-3 text-gold/60" />}
                      {homeSubTab === 'offline' && <motion.div layoutId="activeSubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" />}
                    </button>
                  </div>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="p-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-gold hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

            <motion.div 
              className="flex-1 h-full pt-16"
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(e, info) => {
                const threshold = 70;
                const velocityThreshold = 200;
                
                if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
                  // Swipe Right -> Move Content Right -> Show Tab to the LEFT
                  if (homeSubTab === 'videos') setHomeSubTab('moods');
                  else if (homeSubTab === 'offline') setHomeSubTab('videos');
                } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
                  // Swipe Left -> Move Content Left -> Show Tab to the RIGHT
                  if (homeSubTab === 'moods') setHomeSubTab('videos');
                  else if (homeSubTab === 'videos') setHomeSubTab('offline');
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={homeSubTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  {homeSubTab === 'moods' ? (
                    <div className="h-full overflow-y-auto p-4 space-y-4 no-scrollbar">
                      {viewingUserId ? (
                        <div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
                          <button 
                            onClick={() => setViewingUserId(null)}
                            className="flex items-center gap-2 text-gold font-bold mb-4 hover:translate-x-[-4px] transition-transform"
                          >
                            <ArrowLeft className="w-5 h-5" /> Back to Moods
                          </button>
                          
                          {/* Profile Header in Feed */}
                          <div className="bg-black-soft p-6 rounded-3xl border border-gold/20 mb-4 text-center">
                            <img src={moodPosts.find(p => p.userId === viewingUserId)?.isAnonymous ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUserId}` : profile?.photoURL} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold" alt="" />
                            <h2 className="text-xl font-bold">{moodPosts.find(p => p.userId === viewingUserId)?.isAnonymous ? 'Anonymous' : profile?.displayName}</h2>
                          </div>

                          {moodPosts.filter(p => p.userId === viewingUserId).map((post) => (
                            <MoodPostCard 
                              key={post.id} 
                              post={post} 
                              onReact={(type) => handleMoodReact(post.id, type)}
                              allUsers={allUsers}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 max-w-lg mx-auto">
                          <div className="flex justify-between items-center mb-8">
                            <div>
                              <h2 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent italic font-serif">Mood Feed</h2>
                              <p className="text-gray-500 text-sm">See how others feel today</p>
                            </div>
                            <div className="flex items-center gap-2">

                              <button 
                                onClick={() => setShowMoodSelection(true)}
                                className="p-3 bg-gold/10 border border-gold/30 rounded-2xl text-gold hover:bg-gold/20 transition-all"
                              >
                                {currentMood ? moodEmojis[currentMood] : <Plus className="w-6 h-6" />}
                              </button>
                            </div>
                          </div>

                          {/* AI Match Banner */}
                          {currentMood && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-r from-gold/20 to-purple-500/20 border border-gold/30 rounded-3xl p-6 mb-8 relative overflow-hidden group"
                            >
                              <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Feeling {currentMood}?</h3>
                                <p className="text-sm text-gray-300 mb-4">Let AI find someone who feels just like you right now.</p>
                                <button 
                                  onClick={handleMoodMatch}
                                  disabled={isMatching}
                                  className="px-6 py-2 bg-gold text-black font-bold rounded-xl hover:bg-gold-light transition-all flex items-center gap-2"
                                >
                                  {isMatching ? <Zap className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                                  {isMatching ? 'Matching...' : 'Find a Match'}
                                </button>
                              </div>
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-gold/20 transition-all" />
                            </motion.div>
                          )}

                          <div className="space-y-6">
                            {moodPosts.length === 0 ? (
                              <div className="text-center py-20 text-gray-500">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <MessageCircle className="w-10 h-10 opacity-20" />
                                </div>
                                <p>No mood posts yet. Share yours!</p>
                              </div>
                            ) : (
                              moodPosts.map((post) => (
                                <MoodPostCard 
                                  key={post.id} 
                                  post={post} 
                                  onReact={(type) => handleMoodReact(post.id, type)}
                                  onView={() => handleViewPost(post.id, 'mood_posts')}
                                  onShowSeenBy={() => handleShowSeenBy(post.seenBy || [])}
                                  onProfileClick={() => !post.isAnonymous && setViewingUserId(post.userId)}
                                  allUsers={allUsers}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : homeSubTab === 'videos' ? (
                    <div className="h-full w-full bg-black overflow-hidden relative">
                      {activeAuction && (
                        <motion.div 
                          initial={{ y: -100 }} animate={{ y: 0 }}
                          className="absolute top-20 left-0 right-0 z-50 px-4"
                        >
                          <div className="bg-gradient-to-r from-red-600 via-gold to-red-600 p-[1px] rounded-2xl shadow-2xl animate-pulse">
                            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Gavel className="w-8 h-8 text-gold" />
                                <div>
                                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-none mb-1">Live Auction</p>
                                  <p className="text-white font-bold text-sm truncate max-w-[150px]">
                                    {luxuryAssets.find(a => a.id === activeAuction.assetId)?.name || "Elite Asset"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-gold font-black text-lg leading-none">{activeAuction.currentBid.toLocaleString()}</p>
                                <button onClick={() => setShowVault(true)} className="text-[10px] text-white/50 underline uppercase hover:text-gold transition-colors">Place Bid</button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {securitySettings.handScan && (
                        <>
                          <video 
                            ref={handVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="absolute top-0 left-0 opacity-0 pointer-events-none z-0"
                            style={{ width: '200px', height: '200px', opacity: 0.01 }}
                          />
                          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="w-12 h-12 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center"
                            >
                              <ScanFace className="w-6 h-6 text-gold" />
                            </motion.div>
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Gesture Scroll Active</span>
                          </div>
                        </>
                      )}
                      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar" ref={videoFeedRef}>
                        {(() => {
                          const shouldShowAds = profile?.role !== 'owner' && profile?.role !== 'admin';
                          const feedPosts = [...posts];
                          if (shouldShowAds && ads.length > 0) {
                            // Inject an ad every 3 posts
                            let offset = 0;
                            ads.forEach((ad, index) => {
                              const pos = (index + 1) * 3 + offset;
                              if (pos <= feedPosts.length) {
                                feedPosts.splice(pos, 0, {
                                  ...ad,
                                  authorId: 'ad_system',
                                  authorName: 'Nahom Elite Ads',
                                  authorPhoto: 'input_file_1.png',
                                  likes: 0,
                                  commentsCount: 0,
                                  mediaUrl: ad.content,
                                  content: 'Exclusive offer for our VIP Elites. ✨'
                                } as any);
                                offset++;
                              }
                            });
                          }
                          
                          if (feedPosts.length === 0) {
                            return (
                              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <Video className="w-16 h-16 mb-4 opacity-20" />
                                <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                                <p>Be the first to share a video on melkahayu.nahom!</p>
                              </div>
                            );
                          }
                          
                          return feedPosts.map((post) => (
                            <TikTokPost 
                              key={post.id} 
                              post={post} 
                              onLike={(e: any) => handleLike(post.id, e)}
                              onView={() => handleViewPost(post.id, 'posts')}
                              onShowSeenBy={() => handleShowSeenBy(post.seenBy || [])}
                              isVip={profile?.isVip}
                              isDiamondUser={profile?.isDiamond}
                              onProfileClick={() => {
                                if (post.isAd) return;
                                setViewingUserId(post.authorId);
                                setActiveTab('profile');
                              }}
                              onFollow={() => !post.isAd && handleFollow(post.authorId)}
                              isFollowing={following.includes(post.authorId)}
                              isOwnPost={post.authorId === user?.uid}
                              onShare={handleShare}
                              onComment={() => !post.isAd && setActiveCommentPostId(post.id)}
                              onSendGift={(recipientId: string) => {
                                if (post.isAd) return;
                                setSelectedRecipientId(recipientId);
                                seedGifts();
                                setShowGiftShop(true);
                              }}
                              allUsers={allUsers}
                            />
                          ));
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full bg-black overflow-hidden relative">
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center">
                          <Database className="w-6 h-6 text-gold" />
                        </div>
                        <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Offline Library (250 Videos)</span>
                      </div>
                      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar" ref={videoFeedRef}>
                        {offlineVideos.map((post) => (
                          <TikTokPost 
                            key={post.id} 
                            post={post} 
                            onLike={(e: any) => handleLike(post.id, e)}
                            isVip={profile?.isVip}
                            onProfileClick={() => {}}
                            onFollow={() => {}}
                            isFollowing={false}
                            isOwnPost={false}
                            onShare={handleShare}
                            onComment={() => {}}
                            onSendGift={() => {}}
                            allUsers={allUsers}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            </>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="p-6 max-w-lg mx-auto h-full overflow-y-auto pb-24">
            {/* Allow normal users to participate in elite content creation */}
            {false ? (
              <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
                <PlusSquare className="w-20 h-20 text-gold mb-6 opacity-30" />
                <h2 className="text-2xl font-bold text-gold mb-4">Elite Content Creation</h2>
                <p className="text-gray-400 mb-8 max-w-xs">
                  Only VIP members can share their creations with the elite world of melkahayu.nahom. Join the inner circle to start posting.
                </p>
                <button 
                  onClick={() => setActiveTab('vip')}
                  className="px-8 py-4 bg-gold text-black font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  Get Creator Access
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-3xl p-8 mb-6 relative overflow-hidden group cursor-pointer"
                  onClick={() => setShowInnovationForm(true)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all">
                    <Lightbulb className="w-24 h-24 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-gold" /> የፈጠራ ሥራ ፕሮፖዛል
                  </h2>
                  <p className="text-xs text-gray-400 mb-6 max-w-[200px]">
                    አዲስ የፈጠራ ስራ ወይም የንግድ ሃሳብ ካሎት ፕሮፖዛልዎን እዚህ ያቅርቡ።
                  </p>
                  <button 
                    className="px-6 py-2 bg-gold text-black font-bold rounded-xl text-xs hover:bg-gold-light transition-all flex items-center gap-2"
                  >
                    ጀምር <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 mb-6">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Post</h2>
                <button 
                  onClick={() => setShowFilters(true)}
                  className="px-4 py-2 bg-gold/10 border border-gold/30 rounded-xl text-gold text-xs font-bold flex items-center gap-2 hover:bg-gold/20 transition-all"
                >
                  <Zap className="w-4 h-4" /> Filters
                </button>
              </div>
              
              <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-xl border border-white/5">
                {(['text', 'image', 'video', 'audio'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewPostType(type)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      newPostType === type ? "bg-gold text-black" : "text-gray-500 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {newPostType !== 'text' && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-gold uppercase font-bold block">Media URL</label>
                    <button 
                      onClick={() => setShowFilters(true)}
                      className="text-[10px] text-gold uppercase font-bold flex items-center gap-1 bg-gold/10 px-2 py-1 rounded-md border border-gold/20"
                    >
                      <Zap className="w-3 h-3" /> Filters
                    </button>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder={`Enter ${newPostType} URL...`}
                      value={newPostMediaUrl}
                      onChange={(e) => setNewPostMediaUrl(e.target.value)}
                      className="flex-1 bg-black border border-gold/20 rounded-xl p-3 focus:outline-none focus:border-gold text-sm"
                    />
                    <button 
                      onClick={() => {
                        const placeholders = {
                          image: "https://picsum.photos/seed/" + Date.now() + "/1080/1920",
                          video: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4",
                          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                        };
                        setNewPostMediaUrl(placeholders[newPostType as keyof typeof placeholders]);
                      }}
                      className="p-3 bg-gold/10 text-gold rounded-xl border border-gold/30"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>

                  {newPostMediaUrl && (
                    <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden border border-gold/30 mb-4 bg-black">
                      <div className="w-full h-full" style={getFilterStyle(activeFilter)}>
                        {newPostType === 'video' ? (
                          <video src={newPostMediaUrl} autoPlay muted loop className="w-full h-full object-cover" />
                        ) : newPostType === 'image' ? (
                          <img src={newPostMediaUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-12 h-12 text-gold animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-gold/30">
                        <span className="text-[8px] font-bold text-gold uppercase tracking-widest">Preview with Filter</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeFilter !== 'none' && (
                <div className="mb-4 flex items-center gap-2 bg-gold/5 p-2 rounded-lg border border-gold/10">
                  <span className="text-xs font-bold text-gold uppercase">Filter: {activeFilter}</span>
                  <button onClick={() => setActiveFilter('none')} className="text-gray-500 hover:text-white transition-colors">
                    <Plus className="w-3 h-3 rotate-45" />
                  </button>
                </div>
              )}

              <textarea 
                placeholder={newPostType === 'text' ? "What's on your mind?" : "Add a caption..."} 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-black border border-gold/20 rounded-xl p-4 mb-6 h-32 focus:outline-none focus:border-gold transition-all resize-none"
              />

              <button 
                onClick={handleAddPost}
                disabled={isPosting || !newPostContent.trim() || (newPostType !== 'text' && !newPostMediaUrl)}
                className="w-full py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPosting ? <Zap className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 
                Post {newPostType.charAt(0).toUpperCase() + newPostType.slice(1)}
              </button>
            </div>

            <div className="bg-black-soft border border-gold/30 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Share your Mood</h2>
              
              <div className="flex items-center gap-4 mb-8 bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-4xl">
                  {currentMood ? moodEmojis[currentMood] : '?'}
                </div>
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest">Current Mood</p>
                  <p className="text-lg font-bold capitalize">{currentMood || 'Not Selected'}</p>
                </div>
                <button 
                  onClick={() => setShowMoodSelection(true)}
                  className="ml-auto text-xs font-bold text-gold underline"
                >
                  Change
                </button>
              </div>

              <textarea 
                placeholder={`How does feeling ${currentMood || '...'} make you feel today?`} 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-black border border-gold/20 rounded-xl p-4 mb-6 h-32 focus:outline-none focus:border-gold transition-all resize-none"
              />

              <div className="flex items-center justify-between mb-8 px-2">
                <span className="text-sm font-medium text-gray-400">Post Anonymously</span>
                <button 
                  onClick={() => setShowAddPost(!showAddPost)} // Reusing showAddPost as isAnonymous toggle for now
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    showAddPost ? "bg-gold" : "bg-gray-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    showAddPost ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <button 
                onClick={() => handleAddMoodPost(newPostContent, showAddPost)}
                disabled={!currentMood || !newPostContent.trim()}
                className="w-full py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" /> Share Mood
              </button>
            </div>
            </>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="p-6 max-w-lg mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent italic font-serif">Hall of Fame</h2>
                <p className="text-gray-500 text-sm">Top users this year</p>
              </div>
              <Trophy className="w-8 h-8 text-gold" />
            </div>

            <div className="space-y-4 overflow-y-auto pb-24">
              {allUsers.map((u, index) => (
                <div 
                  key={u.uid}
                  className={cn(
                    "bg-black-soft p-4 rounded-3xl border flex items-center justify-between transition-all",
                    index === 0 ? "border-gold scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)] bg-gold/5" :
                    index === 1 ? "border-gray-400 scale-102 bg-white/5" :
                    index === 2 ? "border-orange-800 bg-orange-900/5" :
                    "border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-12 h-12 rounded-full border border-gold/20" alt="" />
                      <div className="absolute -top-2 -left-2 text-xl">
                        {getUserBadge(u.uid, allUsers)}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {u.displayName}
                        {index === 0 && <Crown className="w-3 h-3 text-gold" />}
                      </p>
                      <p className="text-xs text-gray-500">{u.followersCount} Followers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-black text-xl leading-none">{u.coins?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-gray-600 uppercase font-black">Elite Coins</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="p-6 max-w-lg mx-auto h-full flex flex-col">
            <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-gold" />
                <h2 className="text-2xl font-bold">Daily Missions</h2>
              </div>
              <div className="space-y-4">
                {dailyTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                        task.completed ? "bg-green-500/20 text-green-500" : "bg-gold/10 text-gold"
                      )}>
                        {task.completed ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-6 h-6" />
                          </motion.div>
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm", task.completed ? "text-gray-500 line-through" : "text-white")}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-gold font-black uppercase">+{task.reward} Coins</p>
                      </div>
                    </div>
                    {task.completed ? (
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Done</span>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 mb-6">
              <h2 className="text-2xl font-bold mb-4">Annual Giveaways 🎁</h2>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Top Followers</h4>
                    <p className="text-sm text-gray-400">The user with the most followers at the end of the year wins <span className="text-gold font-bold">1000 ብር</span>!</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Top Shares</h4>
                    <p className="text-sm text-gray-400">The user with the most shares this year wins <span className="text-gold font-bold">1000 ብር</span>!</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Loyal VIP</h4>
                    <p className="text-sm text-gray-400">Users who maintain VIP status for the whole year enter a draw for <span className="text-gold font-bold">1500 ብር</span>!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mb-6">
                <GiftIcon className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gift Shop</h3>
              <p className="text-sm text-gray-400 mb-8">Buy gifts for your friends and support the community!</p>
              <button 
                onClick={() => {
                  seedGifts();
                  setShowGiftShop(true);
                }}
                className="w-full py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all"
              >
                Open Gift Shop
              </button>
            </div>
          </div>
        )}

        {activeTab === 'land' && (
          <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4 overflow-hidden">
            {!isElite ? (
              <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
                <Globe className="w-20 h-20 text-gold mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-gold mb-4">Elite Community Access</h2>
                <p className="text-gray-400 mb-8 max-w-xs">
                  The melkahayu.nahom Lands are reserved for our elite VIP members. Join a safe house, participate in Equb, and grow together.
                </p>
                <button 
                  onClick={() => setActiveTab('vip')}
                  className="px-8 py-4 bg-gold text-black font-bold rounded-xl"
                >
                  Unlock Elite Lands
                </button>
              </div>
            ) : (
              <>
            {activeLandId ? (
              <div className="bg-black-soft border border-gold/30 rounded-3xl p-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6 border-b border-gold/10 pb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveLandId(null)} className="p-2 hover:bg-white/5 rounded-full">
                      <ArrowLeft className="w-5 h-5 text-gold" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold gold-gradient bg-clip-text text-transparent">
                        {lands.find(l => l.id === activeLandId)?.name}
                      </h2>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        {lands.find(l => l.id === activeLandId)?.type} Land
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lands.find(l => l.id === activeLandId)?.ownerId === user.uid && (
                      <button 
                        onClick={() => setShowLandRequests(true)}
                        className="relative p-2 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all"
                      >
                        <Bell className="w-5 h-5" />
                        {landJoinRequests.filter(r => r.landId === activeLandId && r.status === 'pending').length > 0 && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black animate-ping" />
                        )}
                      </button>
                    )}
                    {lands.find(l => l.id === activeLandId)?.type === 'equb' && (
                      <button 
                        onClick={() => handleSelectEqubWinner(activeLandId!)}
                        className="p-2 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all"
                        title="AI Select Winner"
                      >
                        <Trophy className="w-5 h-5" />
                      </button>
                    )}
                    {lands.find(l => l.id === activeLandId)?.type === 'education' && <BookOpen className="w-6 h-6 text-gold" />}
                    {lands.find(l => l.id === activeLandId)?.type === 'equb' && <Scale className="w-6 h-6 text-gold" />}
                    {lands.find(l => l.id === activeLandId)?.type === 'edir' && <HeartHandshake className="w-6 h-6 text-gold" />}
                    {lands.find(l => l.id === activeLandId)?.type === 'ministry' && <ShieldCheck className="w-6 h-6 text-gold" />}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {landMessages.map((m) => (
                    <div key={m.id} className={cn("flex gap-3", m.senderId === user?.uid ? "flex-row-reverse" : "")}>
                      <img src={m.senderPhoto} className="w-8 h-8 rounded-full border border-gold/20" alt="" />
                      <div className={cn(
                        "p-3 rounded-2xl max-w-[80%]",
                        m.senderId === user?.uid ? "bg-gold text-black rounded-tr-none" : "bg-black border border-white/10 rounded-tl-none"
                      )}>
                        <p className="text-[10px] font-bold opacity-60 mb-1">{m.senderName}</p>
                        <p className="text-sm">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Type a message..."
                    value={newLandMessage}
                    onChange={(e) => setNewLandMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendLandMessage()}
                    className="flex-1 bg-black border border-gold/20 rounded-xl px-4 py-2 focus:outline-none focus:border-gold transition-all"
                  />
                  <button 
                    onClick={sendLandMessage}
                    className="p-2 bg-gold text-black rounded-xl hover:bg-gold-light transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 h-full">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent">Lands</h2>
                    {landJoinRequests.some(r => r.status === 'pending' && lands.find(l => l.id === r.landId)?.ownerId === user.uid) && (
                      <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                        {landJoinRequests.filter(r => r.status === 'pending' && lands.find(l => l.id === r.landId)?.ownerId === user.uid).length}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowCreateLand(true)}
                    className="p-2 bg-gold text-black rounded-full hover:scale-110 transition-transform"
                  >
                    <PlusSquare className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {lands.map(land => {
                    const isMember = land.members?.includes(user?.uid || '') || land.ownerId === user?.uid || profile?.role === 'owner';
                    const isRestricted = land.type === 'ministry';
                    const hasRequested = landJoinRequests.some(r => r.landId === land.id && r.userId === user?.uid && r.status === 'pending');

                    return (
                      <div 
                        key={land.id}
                        onClick={() => {
                          if (isRestricted && !isMember) {
                            handleRequestToJoinLand(land.id);
                          } else {
                            setActiveLandId(land.id);
                          }
                        }}
                        className="bg-black-soft p-6 rounded-3xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-gold/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            {land.type === 'education' && <BookOpen className="w-7 h-7 text-gold" />}
                            {land.type === 'equb' && <Scale className="w-7 h-7 text-gold" />}
                            {land.type === 'edir' && <HeartHandshake className="w-7 h-7 text-gold" />}
                            {land.type === 'ministry' && <ShieldCheck className="w-7 h-7 text-gold" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{land.name || 'Untitled Land'}</h3>
                              {isRestricted && <Lock className="w-3 h-3 text-gold/50" />}
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{land.type || 'General'} Land</p>
                            {isRestricted && !isMember && (
                              <p className="text-[10px] text-gold font-bold mt-1">
                                {hasRequested ? 'Request Pending...' : 'Request to Join'}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gold transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {showCreateLand && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-center">
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-black-soft border border-gold/30 rounded-3xl p-8 w-full max-w-md"
                >
                  <h3 className="text-2xl font-bold mb-6">Create New Land</h3>
                  
                  <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                    {(['education', 'equb', 'edir', 'ministry'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewLandType(t)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all whitespace-nowrap",
                          newLandType === t ? "bg-gold text-black border-gold" : "bg-black text-gray-500 border-white/10"
                        )}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  {newLandType === 'ministry' && (
                    <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-6 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-gold" />
                        <p className="text-xs font-bold text-gold uppercase tracking-widest">Restricted</p>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Join requests must be approved by you.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    <input 
                      type="text" 
                      placeholder="Land Name" 
                      value={newLandName}
                      onChange={(e) => setNewLandName(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-4 focus:outline-none focus:border-gold"
                    />
                    <textarea 
                      placeholder="Description" 
                      value={newLandDescription}
                      onChange={(e) => setNewLandDescription(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-4 h-24 focus:outline-none focus:border-gold resize-none"
                    />
                    
                    {newLandType === 'equb' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Amount (ብር)</label>
                          <input 
                            type="number" 
                            value={newEqubAmount}
                            onChange={(e) => setNewEqubAmount(Number(e.target.value))}
                            className="w-full bg-black border border-gold/20 rounded-xl p-3 focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Cycle</label>
                          <select 
                            value={newEqubCycle}
                            onChange={(e) => setNewEqubCycle(e.target.value as any)}
                            className="w-full bg-black border border-gold/20 rounded-xl p-3 focus:outline-none focus:border-gold"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setShowCreateLand(false)} className="flex-1 py-3 text-gray-400 font-bold">Cancel</button>
                    <button onClick={handleCreateLand} className="flex-1 py-3 bg-gold text-black font-bold rounded-xl">Create Land</button>
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              {showLandRequests && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[500] flex items-center justify-center p-6 text-center">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-black-soft border border-gold/30 rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gold" />
                        <h2 className="text-2xl font-bold italic">Join Requests</h2>
                      </div>
                      <button onClick={() => setShowLandRequests(false)} className="p-2 hover:bg-white/5 rounded-full">
                        <Plus className="w-6 h-6 text-gold rotate-45" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {landJoinRequests.filter(r => r.landId === activeLandId && r.status === 'pending').length === 0 ? (
                        <div className="text-center py-10">
                          <CheckCircle2 className="w-12 h-12 text-gold/20 mx-auto mb-4" />
                          <p className="text-gray-500">No pending requests.</p>
                        </div>
                      ) : (
                        landJoinRequests
                          .filter(r => r.landId === activeLandId && r.status === 'pending')
                          .map(request => (
                            <div key={request.id} className="bg-black border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img src={request.userPhoto} className="w-10 h-10 rounded-full border border-gold/20" alt="" />
                                <div className="text-left">
                                  <p className="font-bold text-sm text-white">{request.userName}</p>
                                  <p className="text-[10px] text-gray-500">Wants to join</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleRejectJoinRequest(request.id)}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 text-xs font-bold"
                                >
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleApproveJoinRequest(request)}
                                  className="px-4 py-2 bg-gold text-black font-bold rounded-lg text-xs hover:bg-gold-light"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            </>
            )}
          </div>
        )}
        {activeTab === 'inbox' && (
          <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4 overflow-hidden">
            {!isElite ? (
              <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
                <MessageCircle className="w-20 h-20 text-gold mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-gold mb-4">Exclusive VIP Messaging</h2>
                <p className="text-gray-400 mb-8 max-w-xs">
                  Connect privately with other premium members. VIP status is required to chat, join groups, and subscribe to broadcast channels.
                </p>
                <button 
                  onClick={() => setActiveTab('vip')}
                  className="px-8 py-4 bg-gold text-black font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  Upgrade to VIP Chat
                </button>
              </div>
            ) : (
              <>
            {activeChatId ? (
              <div className="bg-black-soft border border-gold/30 rounded-3xl p-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6 border-b border-gold/10 pb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChatId(null)} className="p-2 hover:bg-white/5 rounded-full">
                      <ArrowLeft className="w-5 h-5 text-gold" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {groups.find(g => g.id === activeChatId)?.name || 
                         channels.find(c => c.id === activeChatId)?.name || 
                         (activeMatch?.id === activeChatId ? `Anonymous ${activeMatch.mood} Match` : 'Chat')}
                      </h2>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {groups.find(g => g.id === activeChatId) ? 'Group' : 
                         channels.find(c => c.id === activeChatId) ? 'Channel' : 
                         'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-full text-gold">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full text-gold">
                      <Video className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        const groupId = activeChatId;
                        if (groupId && groups.find(g => g.id === groupId)) {
                          leaveGroup(groupId);
                        }
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-full text-red-500"
                      title="Leave Group"
                    >
                      <Plus className="w-5 h-5 rotate-45" />
                    </button>
                    {groups.find(g => g.id === activeChatId) ? <Users className="w-5 h-5 text-gold" /> : <Megaphone className="w-5 h-5 text-gold" />}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {/* Diamond Feature: Flying Owls */}
                  {(() => {
                    const group = groups.find(g => g.id === activeChatId);
                    const channel = channels.find(c => c.id === activeChatId);
                    const activeChatRecipient = allUsers.find(u => 
                      activeMatch?.users?.find((uid: string) => uid !== user?.uid) === u.uid ||
                      group?.creatorId === u.uid ||
                      channel?.creatorId === u.uid
                    );
                    
                    if (profile?.isDiamond || activeChatRecipient?.isDiamond) return <FlyingOwls count={8} />;
                    return null;
                  })()}

                  {chatMessages.map((m) => {
                    const isMatchChat = activeMatch?.id === activeChatId;
                    const senderPhoto = isMatchChat 
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.senderId}` 
                      : m.senderPhoto;
                    const senderName = isMatchChat 
                      ? (m.senderId === user?.uid ? 'You' : 'Match') 
                      : m.senderName;

                    return (
                      <div key={m.id} className={cn("flex gap-3", m.senderId === user?.uid ? "flex-row-reverse" : "")}>
                        <div className="relative">
                          <img src={senderPhoto} className="w-8 h-8 rounded-full border border-gold/20" alt="" />
                          {allUsers.find(u => u.uid === m.senderId)?.isDiamond && (
                            <div className="absolute -inset-0.5 rounded-full ring-1 ring-purple-500/50 animate-pulse" />
                          )}
                        </div>
                        <div className={cn(
                          "p-3 rounded-2xl max-w-[80%] relative overflow-hidden",
                          m.senderId === user?.uid 
                            ? (profile?.isDiamond ? "diamond-purple-pink text-white rounded-tr-none" : "bg-gold text-black rounded-tr-none") 
                            : (allUsers.find(u => u.uid === m.senderId)?.isDiamond ? "diamond-black-white border border-white/20 rounded-tl-none" : "bg-black border border-white/10 rounded-tl-none"),
                          isEmojiOnly(m.text) && "bg-transparent border-none p-0"
                        )}>
                          {allUsers.find(u => u.uid === m.senderId)?.isDiamond && <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-white/20 to-transparent" />}
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-[10px] font-bold opacity-60">{senderName}</p>
                            {allUsers.find(u => u.uid === m.senderId)?.isDiamond && <DiamondBadge />}
                          </div>
                          <p className={cn(
                            "text-sm relative z-10",
                            isEmojiOnly(m.text) && "text-4xl golden-emoji"
                          )}>
                            {m.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(!channels.find(c => c.id === activeChatId) || channels.find(c => c.id === activeChatId)?.creatorId === user?.uid) && (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Type a message..."
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="flex-1 bg-black border border-gold/20 rounded-xl px-4 py-2 focus:outline-none focus:border-gold transition-all"
                    />
                    <button 
                      onClick={sendChatMessage}
                      className="p-2 bg-gold text-black rounded-xl hover:bg-gold-light transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6 h-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent">Inbox</h2>
                  <button 
                    onClick={() => setShowCreateChat(true)}
                    className="p-2 bg-gold text-black rounded-full hover:scale-110 transition-transform"
                  >
                    <PlusSquare className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {profile?.isDiamond && (
                    <section>
                      <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Gem className="w-4 h-4" /> Diamond Prestige
                      </h3>
                      <div 
                        onClick={() => {
                          const lounge = channels.find(c => c.name === "Diamond Exclusive Lounge");
                          if (lounge) setActiveChatId(lounge.id);
                          else {
                            // If it doesn't exist, I'll create/find a logical one or just a placeholder for now
                            addToast("Entering Lounge", "Connecting you to the Diamond Elite server...", "info");
                          }
                        }}
                        className="diamond-purple-pink p-4 rounded-2xl border border-white/20 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-pulse">
                            🌌
                          </div>
                          <div>
                            <p className="font-black text-white italic">Diamond Lounge</p>
                            <p className="text-[10px] text-white/60 uppercase tracking-widest font-black">Members Only • 24/7 Elite Chat</p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white" />
                      </div>
                    </section>
                  )}

                  {activeMatch && (
                    <section>
                      <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> AI Mood Match
                      </h3>
                      <div 
                        onClick={() => setActiveChatId(activeMatch.id)}
                        className="bg-gradient-to-r from-gold/20 to-purple-500/20 p-4 rounded-2xl border border-gold/30 flex items-center justify-between cursor-pointer hover:from-gold/30 hover:to-purple-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                            🤝
                          </div>
                          <div>
                            <p className="font-bold">Anonymous Match</p>
                            <p className="text-xs text-gray-300">Both feeling {activeMatch.mood}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <ChevronRight className="w-5 h-5 text-gold" />
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Groups
                    </h3>
                    <div className="grid gap-3">
                      {groups.map(group => (
                        <div 
                          key={group.id}
                          onClick={() => setActiveChatId(group.id)}
                          className="bg-black-soft p-4 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center overflow-hidden">
                              {group.id === 'system-assistant' ? (
                                <img src="input_file_2.png" className="w-full h-full object-cover scale-[1.3]" alt="" />
                              ) : (
                                <Hash className="w-6 h-6 text-gold" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold">{group.name}</p>
                              <p className="text-xs text-gray-500">
                                {group.id === 'system-assistant' ? 'Official Assistant' : `${group.members?.length || 0} members`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Megaphone className="w-4 h-4" /> Channels
                    </h3>
                    <div className="grid gap-3">
                      {channels.map(channel => (
                        <div 
                          key={channel.id}
                          onClick={() => setActiveChatId(channel.id)}
                          className="bg-black-soft p-4 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                              <Megaphone className="w-6 h-6 text-white/40" />
                            </div>
                            <div>
                              <p className="font-bold">{channel.name}</p>
                              <p className="text-xs text-gray-500">{channel.subscribers?.length || 0} subscribers</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {showCreateChat && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-black-soft border border-gold/30 rounded-3xl p-8 w-full max-w-md"
                >
                  <h3 className="text-2xl font-bold mb-6">Create New Chat</h3>
                  
                  <div className="flex gap-2 mb-6">
                    <button 
                      onClick={() => setNewChatType('group')}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold uppercase border transition-all",
                        newChatType === 'group' ? "bg-gold text-black border-gold" : "bg-black text-gray-500 border-white/10"
                      )}
                    >
                      Group
                    </button>
                    <button 
                      onClick={() => {
                        if (profile?.isVip || profile?.role === 'owner') {
                          setNewChatType('channel');
                        } else {
                          addToast("VIP Feature", "🌟 Channels are a VIP Feature! Upgrade to VIP to create your own broadcast channel.", "info");
                          setShowVipModal(true);
                        }
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold uppercase border transition-all flex items-center justify-center gap-2",
                        newChatType === 'channel' ? "bg-gold text-black border-gold" : "bg-black text-gray-500 border-white/10",
                        !isElite && "border-gold/20"
                      )}
                    >
                      Channel {!isElite && <Trophy className="w-3 h-3 text-gold" />}
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-4 focus:outline-none focus:border-gold"
                    />
                    <textarea 
                      placeholder="Description" 
                      value={newChatDesc}
                      onChange={(e) => setNewChatDesc(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-4 h-24 focus:outline-none focus:border-gold resize-none"
                    />

                    {newChatType === 'group' && (
                      <label className="flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isAnonymousGroup}
                          onChange={(e) => setIsAnonymousGroup(e.target.checked)}
                          className="w-5 h-5 accent-gold"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold">Anonymous Owner</p>
                          <p className="text-[10px] text-gray-500">Hide your identity as the creator. You will appear as "Member".</p>
                        </div>
                      </label>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setShowCreateChat(false)} className="flex-1 py-3 text-gray-400 font-bold">Cancel</button>
                    <button onClick={handleCreateChat} className="flex-1 py-3 bg-gold text-black font-bold rounded-xl">Create</button>
                  </div>
                </motion.div>
              </div>
            )}
            </>
            )}
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="p-6 max-w-lg mx-auto">
            <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 text-center mb-8">
              <Crown className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Become a VIP</h2>
              <p className="text-gray-400 mb-6">Unlock exclusive features and a golden profile shine.</p>
              
              <div className="grid gap-4 mb-8">
                <PlanCard 
                  title="24 Hours" 
                  price="15 ብር" 
                  selected={selectedPlan === 'daily'} 
                  onClick={() => setSelectedPlan('daily')} 
                />
                <PlanCard 
                  title="Weekly" 
                  price="95 ብር" 
                  selected={selectedPlan === 'weekly'} 
                  onClick={() => setSelectedPlan('weekly')} 
                />
                <PlanCard 
                  title="Monthly" 
                  price="270 ብር" 
                  selected={selectedPlan === 'monthly'} 
                  onClick={() => setSelectedPlan('monthly')} 
                />
                <PlanCard 
                  title="Yearly" 
                  price="5000 ብር" 
                  selected={selectedPlan === 'yearly'} 
                  onClick={() => setSelectedPlan('yearly')} 
                />
              </div>

              <div className="text-left bg-black/40 p-4 rounded-xl mb-6 border border-gold/10">
                <p className="text-xs text-gold uppercase font-bold mb-2">Payment Methods</p>
                <p className="text-sm">Telebirr: <span className="text-gold">0913701487</span></p>
                <p className="text-sm">CBE: <span className="text-gold">1000108824445</span></p>
                <p className="text-sm">M-Pesa: <span className="text-gold">0718059371</span></p>
              </div>

              <button 
                onClick={() => setShowVipModal(true)}
                className="w-full py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all"
              >
                Submit Transaction ID
              </button>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="p-6 max-w-lg mx-auto h-full flex flex-col">
            {!isElite ? (
              <div className="bg-black-soft border border-gold/30 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
                <Radio className="w-20 h-20 text-gold mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-gold mb-4">Elite Broadcast Feature</h2>
                <p className="text-gray-400 mb-8 max-w-xs">
                  Streaming live content is reserved for our verified VIP users. Upgrade now to broadcast your mood to the melkahayu.nahom network.
                </p>
                <button 
                  onClick={() => setActiveTab('vip')}
                  className="px-8 py-4 bg-gold text-black font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  Unlock Live Streaming
                </button>
              </div>
            ) : (
              <div className="bg-black-soft border border-red-500/30 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {profile?.isDiamond && <FlyingOwls count={12} />}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  Live
                </div>
                
                <div className="w-24 h-24 rounded-full p-1 gold-gradient mb-6">
                  <img src={profile?.photoURL} className="w-full h-full rounded-full object-cover bg-black" alt="" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Starting Live Stream...</h2>
                <p className="text-gray-400 mb-8">Connecting to your audience in melkahayu.nahom</p>
                
                <div className="w-full max-w-xs bg-black/40 p-4 rounded-2xl border border-white/5 mb-8">
                  <p className="text-xs text-gold uppercase font-bold mb-2">Live Settings</p>
                  <div className="flex justify-between text-sm">
                    <span>Viewers:</span>
                    <span className="text-gold">0</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex-1"
                  >
                    End Live
                  </button>
                  <button 
                    onClick={() => handleShare("Live Stream", `Watch ${profile?.displayName}'s live stream on melkahayu.nahom!`)}
                    className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex-1 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" /> Share
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex flex-col h-full max-w-lg mx-auto w-full p-4 overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/5 rounded-full">
                <ArrowLeft className="w-6 h-6 text-gold" />
              </button>
              <h2 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent">Settings</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Profile Section */}
              <div className="bg-black-soft p-6 rounded-3xl border border-gold/20 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full p-0.5 gold-gradient">
                  <img src={profile?.photoURL} className="w-full h-full rounded-full object-cover bg-black" alt="" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile?.displayName}</h3>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
              </div>

              {/* Security Section */}
              <section>
                <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 px-2">Security & Privacy</h3>
                <div className="bg-black-soft rounded-3xl border border-white/5 overflow-hidden">
                  <SettingItem 
                    icon={<Lock className="w-5 h-5" />} 
                    title="Two-Step Verification" 
                    subtitle={securitySettings.password ? "On" : "Off"}
                    onClick={() => setSecuritySettings(s => ({...s, password: !s.password}))}
                  />
                  <SettingItem 
                    icon={<Shield className="w-5 h-5" />} 
                    title="Passcode Lock (PIN)" 
                    subtitle={securitySettings.pin ? "Enabled" : "Disabled"}
                    onClick={() => setSecuritySettings(s => ({...s, pin: !s.pin}))}
                  />
                  <SettingItem 
                    icon={<Fingerprint className="w-5 h-5" />} 
                    title="Fingerprint" 
                    subtitle={securitySettings.fingerprint ? "Active" : "Setup"}
                    onClick={() => setSecuritySettings(s => ({...s, fingerprint: !s.fingerprint}))}
                  />
                  <SettingItem 
                    icon={<ScanFace className="w-5 h-5" />} 
                    title="Face Recognition" 
                    subtitle={securitySettings.faceId ? "Active" : "Setup"}
                    onClick={() => setSecuritySettings(s => ({...s, faceId: !s.faceId}))}
                  />
                  <SettingItem 
                    icon={<Zap className="w-5 h-5 text-gold" />} 
                    title="Hand Scan Scrolling" 
                    subtitle={securitySettings.handScan ? "Active" : "Disabled"}
                    onClick={() => setSecuritySettings(s => ({...s, handScan: !s.handScan}))}
                  />
                </div>
              </section>

              {/* General Section */}
              <section>
                <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 px-2">General</h3>
                <div className="bg-black-soft rounded-3xl border border-white/5 overflow-hidden">

                  <SettingItem 
                    icon={<Bell className="w-5 h-5" />} 
                    title="Notifications" 
                    subtitle="All sounds on" 
                    onClick={() => { setComingSoonTitle('Notifications'); setShowComingSoon(true); }}
                  />
                  <SettingItem 
                    icon={<Database className="w-5 h-5" />} 
                    title="Data and Storage" 
                    subtitle="3.2 GB used" 
                    onClick={() => { setComingSoonTitle('Data and Storage'); setShowComingSoon(true); }}
                  />
                  <SettingItem 
                    icon={<Globe className="w-5 h-5" />} 
                    title="Language" 
                    subtitle="English" 
                    onClick={() => { setComingSoonTitle('Language'); setShowComingSoon(true); }}
                  />
                </div>
              </section>

              {/* Support Section */}
              <section>
                <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 px-2">Support</h3>
                <div className="bg-black-soft rounded-3xl border border-white/5 overflow-hidden">
                  <SettingItem 
                    icon={<HelpCircle className="w-5 h-5" />} 
                    title="Help Center" 
                    onClick={() => { setComingSoonTitle('Help Center'); setShowComingSoon(true); }}
                  />
                  <SettingItem 
                    icon={<MessageCircle className="w-5 h-5" />} 
                    title="Ask a Question" 
                    onClick={() => { setComingSoonTitle('Ask a Question'); setShowComingSoon(true); }}
                  />
                </div>
              </section>

              <button 
                onClick={() => auth.signOut()}
                className="w-full py-4 text-red-500 font-bold bg-red-500/5 rounded-2xl border border-red-500/20 hover:bg-red-500/10 transition-all mb-8"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className={cn(
            "p-6 max-w-lg mx-auto min-h-full transition-all duration-1000 relative overflow-hidden",
            profile?.isDiamond 
              ? (profile.diamondTheme === 'black-white' ? "diamond-black-white" : "diamond-purple-pink")
              : ""
          )}>
            {profile?.isDiamond && <DiamondParticles />}
            {profile?.isDiamond && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10" />}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('vip')}
                  className="p-2 bg-gold/10 text-gold rounded-full border border-gold/40 hover:bg-gold/20 transition-all"
                >
                  <Crown className="w-6 h-6" />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => { setShowNotifications(true); markNotificationsAsRead(); }}
                    className="p-2 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all border border-white/10"
                  >
                    <Bell className="w-6 h-6" />
                  </button>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setShowFilters(true)}
                  className="p-2 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all border border-white/10"
                >
                  <Zap className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-2">
                {profile?.role === 'owner' && (
                  <button 
                    onClick={() => setShowAdsManager(true)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-full border border-red-500/40 hover:bg-red-500/20 transition-all"
                  >
                    <Megaphone className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={() => setShowVault(true)}
                  className="p-2 bg-gradient-to-br from-gold/20 to-white/5 text-gold rounded-full border border-gold/40 hover:scale-110 transition-all shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                >
                  <Gem className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setShowProjector(true)}
                  className="p-2 bg-gradient-to-br from-blue-500/20 to-white/5 text-blue-400 rounded-full border border-blue-500/40 hover:scale-110 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                >
                  <Flashlight className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="p-2 bg-white/5 text-gold rounded-full hover:bg-white/10 transition-all border border-gold/20"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="text-center mb-8">
                <div className={cn(
                  "w-full h-full rounded-full p-1 shadow-[0_0_20px_rgba(212,175,55,0.2)]",
                  profile?.isVip ? "gold-gradient" : "bg-gray-800"
                )}>
                  <img 
                    src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover bg-black"
                  />
                </div>
                <button 
                  onClick={() => {
                    setEditName(profile?.displayName || '');
                    setEditPhone(profile?.phoneNumber || '');
                    setEditBio(profile?.bio || '');
                    setEditPhoto(profile?.photoURL || '');
                    setEditHidePhone(profile?.hidePhoneNumber || false);
                    setEditDiamondTheme(profile?.diamondTheme || 'purple-pink');
                    setEditHasBot(profile?.hasBot || false);
                    setIsEditingProfile(true);
                  }}
                  className="absolute bottom-0 right-0 p-2 bg-gold text-black rounded-full shadow-lg border-2 border-black"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                {profile?.displayName}
                <span className="text-xl">{getUserBadge(user?.uid || '', allUsers, profile)}</span>
                {profile?.role === 'owner' && <ShieldCheck className="w-5 h-5 text-gold" />}
              </h2>
              <p className="text-gray-400 text-sm mb-2">{profile?.email}</p>
              
              {profile?.phoneNumber && (!profile?.hidePhoneNumber || profile?.uid === user?.uid) && (
                <p className="text-gold/80 text-xs mb-4 flex items-center justify-center gap-2">
                  <Phone className="w-3 h-3" /> {profile.phoneNumber}
                </p>
              )}

              {currentMood && (
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold/10 border border-gold/30 rounded-full mb-4">
                  <span className="text-lg">{moodEmojis[currentMood]}</span>
                  <span className="text-xs font-bold text-gold uppercase tracking-widest">Feeling {currentMood}</span>
                </div>
              )}

              {profile?.bio && <p className="text-gray-300 text-sm max-w-xs mx-auto mb-4 italic">"{profile.bio}"</p>}

              {(!profile?.isVip && !profile?.isDiamond && (!viewingUserId || viewingUserId === user?.uid)) && (
                <div className="mb-8 p-6 bg-gold/5 border border-gold/20 rounded-[2.5rem] relative overflow-hidden group max-w-xs mx-auto">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gold/10 rounded-full">
                      <Crown className="w-8 h-8 text-gold" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 italic font-serif">Join the Elite</h3>
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-4">Unlock VIP & Diamond status today</p>
                  <button 
                    onClick={() => setShowVipSelection(true)}
                    className="w-full py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold-light transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  >
                    Send VIP Request <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Membership Status & Countdown */}
              {(profile?.isVip || profile?.isDiamond) && (
                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between max-w-xs mx-auto">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      profile.isDiamond ? "bg-purple-500/20 text-purple-400" : "bg-gold/20 text-gold"
                    )}>
                      {profile.isDiamond ? <Sparkles className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Membership</p>
                      <p className={cn("text-xs font-bold", profile.isDiamond ? "text-purple-400" : "text-gold")}>
                        {profile.isDiamond ? 'Diamond Elite' : 'VIP Prestige'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Expires</p>
                    <p className="text-white font-mono font-bold text-[10px]">
                      {(() => {
                        const expiry = profile.isDiamond ? profile.diamondExpiry : profile.vipExpiry;
                        if (!expiry) return "Lifetime";
                        const now = new Date().getTime();
                        const end = expiry.toMillis();
                        const diff = end - now;
                        if (diff <= 0) return "Expired";
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        if (days > 0) return `${days}d ${hours}h left`;
                        return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m left`;
                      })()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="font-bold text-gold">{profile?.followersCount || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gold">{profile?.followingCount || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Following</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                {viewingUserId && viewingUserId !== user?.uid && (
                  <button 
                    onClick={() => {
                      setSelectedRecipientId(viewingUserId);
                      seedGifts();
                      setShowGiftShop(true);
                    }}
                    className="px-6 py-2 bg-gold text-black font-bold rounded-xl flex items-center gap-2 hover:bg-gold-light transition-all"
                  >
                    <GiftIcon className="w-4 h-4" /> Send Gift
                  </button>
                )}
                {viewingUserId && viewingUserId !== user?.uid && (
                  <button 
                    onClick={() => handleFollow(viewingUserId)}
                    className={cn(
                      "px-6 py-2 font-bold rounded-xl transition-all",
                      following.includes(viewingUserId) ? "bg-white/10 text-white" : "bg-white text-black"
                    )}
                  >
                    {following.includes(viewingUserId) ? 'Following' : 'Follow'}
                  </button>
                )}
                {(!viewingUserId || viewingUserId === user?.uid) && (
                  <button 
                    onClick={() => setShowInnovationForm(true)}
                    className="flex-1 py-4 bg-gold/10 border border-gold/30 rounded-2xl text-gold font-bold flex items-center justify-center gap-2 hover:bg-gold/20 transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                  >
                    <Lightbulb className="w-5 h-5" /> 
                    <span className="text-xs uppercase tracking-widest">New Innovation Proposal</span>
                  </button>
                )}
              </div>

              {/* Proposals List */}
              {(!viewingUserId || viewingUserId === user?.uid) && proposals.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                      <ListChecks className="w-4 h-4" /> My Proposals
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {proposals.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedProposal(p)}
                        className="bg-black-soft border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-5 h-5 text-gold" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="font-bold text-sm text-white truncate">{p.title}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              {p.status} • {p.createdAt?.toDate().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="p-2 text-gold">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {isEditingProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black-soft border border-gold/30 rounded-3xl p-6 mb-8"
              >
                <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-3 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Phone (Exclusive)</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+251 ..."
                      className="w-full bg-black border border-gold/20 rounded-xl p-3 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Bio</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-3 h-20 focus:outline-none focus:border-gold resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Photo URL</label>
                    <input 
                      type="text" 
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      className="w-full bg-black border border-gold/20 rounded-xl p-3 focus:outline-none focus:border-gold"
                    />
                  </div>

                  {profile?.isDiamond && (
                    <div className="pt-4 border-t border-gold/10 space-y-4">
                      <h4 className="text-sm font-bold text-gold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Diamond Settings
                      </h4>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-gold/10">
                        <div>
                          <p className="text-xs font-bold text-white uppercase">Privacy</p>
                          <p className="text-[10px] text-gray-500">Hide my phone number from others</p>
                        </div>
                        <button 
                          onClick={() => setEditHidePhone(!editHidePhone)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            editHidePhone ? "bg-gold" : "bg-gray-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            editHidePhone ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-gold/10">
                        <div>
                          <p className="text-xs font-bold text-white uppercase">Diamond Bot</p>
                          <p className="text-[10px] text-gray-500">Enable personal AI bot assistant</p>
                        </div>
                        <button 
                          onClick={() => setEditHasBot(!editHasBot)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            editHasBot ? "bg-gold" : "bg-gray-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            editHasBot ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div>
                        <label className="text-xs text-gold uppercase font-bold mb-2 block">Diamond Theme</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setEditDiamondTheme('purple-pink')}
                            className={cn(
                              "p-3 rounded-xl border text-[10px] font-bold transition-all",
                              editDiamondTheme === 'purple-pink' ? "border-gold diamond-purple-pink text-white" : "border-white/5 bg-white/5 text-gray-400"
                            )}
                          >
                            Purple & Pink
                          </button>
                          <button 
                            onClick={() => setEditDiamondTheme('black-white')}
                            className={cn(
                              "p-3 rounded-xl border text-[10px] font-bold transition-all",
                              editDiamondTheme === 'black-white' ? "border-gold diamond-black-white text-white" : "border-white/5 bg-white/5 text-gray-400"
                            )}
                          >
                            Black & White
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 text-gray-400 font-bold">Cancel</button>
                    <button onClick={handleUpdateProfile} className="flex-1 py-3 bg-gold text-black font-bold rounded-xl">Save Changes</button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black-soft p-4 rounded-2xl border border-gold/10 text-center">
                <Coins className="w-6 h-6 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold">{profile?.coins}</p>
                <p className="text-xs text-gray-500 uppercase">ብር</p>
              </div>
              <div className="bg-black-soft p-4 rounded-2xl border border-gold/10 text-center">
                <Trophy className="w-6 h-6 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold">{profile?.isVip ? 'VIP' : 'Free'}</p>
                <p className="text-xs text-gray-500 uppercase">Status</p>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="mt-8 mb-8">
              <h3 className="text-gold font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                <Gem className="w-4 h-4" /> ዝርዝር ንብረቶች (Portfolio)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {luxuryAssets.filter(a => a.ownerId === (viewingUserId || user?.uid)).map(asset => (
                  <div key={asset.id} className="aspect-square rounded-xl border border-gold/30 overflow-hidden relative group">
                    <img src={asset.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-[8px] text-white font-bold text-center px-1">{asset.name}</p>
                    </div>
                  </div>
                ))}
                {luxuryAssets.filter(a => a.ownerId === (viewingUserId || user?.uid)).length === 0 && (
                  <div className="col-span-3 py-8 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center">
                    <p className="text-gray-600 text-xs italic">ምንም ንብረት የለም::</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <button 
                onClick={() => setShowDevicesManager(true)}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold flex items-center justify-between px-6 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-sm">Linked Devices</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-black">{profile?.devices?.length || 0}</span>
                   <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>
              </button>

              <button 
                onClick={() => auth.signOut()}
                className="w-full py-4 border border-red-500/30 text-red-500 rounded-2xl hover:bg-red-500/10 transition-all font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="p-6 max-w-lg mx-auto h-full overflow-y-auto pb-24">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setActiveTab('profile')} className="p-2 bg-white/5 rounded-full text-gold">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent italic font-serif">Elite Ranking</h2>
            </div>
            
            <div className="bg-black-soft border border-gold/20 rounded-[2rem] p-6 mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] rounded-full" />
               <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Top Net Worth Members</p>
               <div className="space-y-4">
                  {allUsers.sort((a,b) => (b.coins || 0) - (a.coins || 0)).slice(0, 20).map((u, i) => (
                    <motion.div 
                      key={u.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setViewingUserId(u.uid); setActiveTab('profile'); }}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center gap-4 transition-all hover:bg-gold/5 cursor-pointer",
                        i < 3 ? "bg-gold/10 border-gold/30" : "bg-white/5 border-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold italic",
                        i === 0 ? "bg-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]" : 
                        i === 1 ? "bg-silver text-black" :
                        i === 2 ? "bg-amber-700 text-white" : "text-gray-500"
                      )}>
                        {i + 1}
                      </div>
                      <img src={u.photoURL} className="w-12 h-12 rounded-full border border-gold/20 object-cover" alt="" />
                      <div className="flex-1">
                        <p className="font-bold flex items-center gap-2">
                          {u.displayName}
                          {u.isDiamond && <Sparkles className="w-3 h-3 text-gold" />}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                          {u.isDiamond ? 'Diamond Elite' : u.isVip ? 'VIP Member' : 'Elite Class'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-bold">{(u.coins || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">ብር</p>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="p-6 max-w-lg mx-auto h-full overflow-y-auto pb-24 text-center">
             <div className="flex items-center gap-4 mb-8 text-left">
              <button onClick={() => setActiveTab('profile')} className="p-2 bg-white/5 rounded-full text-gold">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent italic font-serif">Elite Privileges</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-black-soft border border-gold/30 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gold/5 blur-[40px] rounded-full scale-150 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Crown className="w-16 h-16 text-gold mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2 font-serif italic">Diamond Upgrade</h3>
                <p className="text-gray-400 text-sm mb-6">እንከን የሌለው ክብር እና ልዩ ጥቅማጥቅሞችን ያግኙ።</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {diamondPlans.map(plan => (
                    <button 
                      key={plan.name}
                      onClick={() => handleDiamondUpgrade(plan)}
                      className="p-4 bg-white/5 border border-gold/20 rounded-2xl hover:bg-gold/10 transition-all text-left"
                    >
                      <p className="text-gold font-bold text-sm tracking-tighter">{plan.name}</p>
                      <p className="text-white font-black text-lg">{plan.price.toLocaleString()}</p>
                      <p className="text-[8px] text-gray-500 uppercase">ብር</p>
                    </button>
                  ))}
                </div>
              </div>

               <div className="bg-black-soft border border-gold/30 rounded-[2rem] p-8 mt-6">
                <ListChecks className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Daily Elite Missions</h3>
                <p className="text-gray-400 text-xs mb-6 font-serif">ልዩ ሽልማቶችን ለማግኘት እነዚህን ተግባራት ያጠናቅቁ።</p>
                <div className="space-y-3 text-left">
                  {[
                    { id: 'mood', label: 'Set your mood', reward: 10, done: !!currentMood },
                    { id: 'proj', label: 'Engage Projector', reward: 15, done: false },
                    { id: 'land', label: 'Visit a Ministry', reward: 25, done: false }
                  ].map(task => (
                    <div key={task.id} className="p-4 bg-black rounded-2xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{task.label}</p>
                        <p className="text-[10px] text-gold">+{task.reward} Elite Coins</p>
                      </div>
                      <div className="flex items-center">
                        {task.done ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-8 h-8 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <div className="w-8 h-8 border-2 border-white/10 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mood Selection Modal */}
      <AnimatePresence>
        {(showMoodSelection || (!currentMood && user && !loading && user.email !== 'yewubdarhaileyesus8@gmail.com')) && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md text-center"
            >
              <h2 className="text-4xl font-bold mb-2 gold-gradient bg-clip-text text-transparent italic font-serif">melkahayu.nahom</h2>
              <p className="text-gray-400 mb-12 text-lg">How are you feeling right now?</p>
              
              <div className="grid grid-cols-3 gap-6 mb-12">
                {(Object.keys(moodEmojis) as MoodType[]).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-gold/10 group-hover:border-gold/50 transition-all duration-300 shadow-lg">
                      {moodEmojis[mood]}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gold transition-colors">
                      {mood}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">Your mood helps AI connect you with others</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {activeCommentPostId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-end justify-center">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-black-soft border-t border-gold/30 rounded-t-3xl w-full max-w-lg flex flex-col h-[70vh]"
            >
              <div className="p-4 border-b border-gold/10 flex justify-between items-center">
                <h3 className="text-lg font-bold">{comments.filter(c => c.postId === activeCommentPostId).length} Comments</h3>
                <button onClick={() => setActiveCommentPostId(null)} className="p-2 hover:bg-white/5 rounded-full">
                  <Plus className="w-6 h-6 text-gold rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {comments.filter(c => c.postId === activeCommentPostId).length > 0 ? (
                  comments.filter(c => c.postId === activeCommentPostId).map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <img src={comment.userPhoto} className="w-10 h-10 rounded-full border border-gold/20" alt="" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-gold">{comment.userName}</p>
                          <span className="text-[10px]">{getUserBadge(comment.userId, allUsers)}</span>
                        </div>
                        <p className="text-sm text-white/90 leading-tight">{comment.text}</p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {new Date(comment.createdAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                    <p>No comments yet. Be the first to say something!</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gold/10 bg-black/40 flex gap-3 items-center">
                <img src={profile?.photoURL} className="w-10 h-10 rounded-full border border-gold/20" alt="" />
                <input 
                  type="text"
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 bg-black border border-gold/20 rounded-full px-4 py-2 focus:outline-none focus:border-gold transition-all"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim()}
                  className="p-2 bg-gold text-black rounded-full disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Projector Modal */}
      <AnimatePresence>
        {showProjector && (
          <div className={cn(
            "fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 text-center transition-all duration-1000",
            flashlightOn && useScreenProjector ? "bg-white" : "bg-black"
          )}>
            {/* Background Beam Effect for Screen Mode */}
            {flashlightOn && useScreenProjector && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white"
              />
            )}

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={cn("w-full max-w-lg space-y-8 relative z-10", flashlightOn && useScreenProjector ? "text-black" : "text-white")}
            >
              <div className="relative">
                <div className={cn(
                  "w-48 h-48 mx-auto rounded-full p-1 animate-pulse transition-all duration-700 relative",
                  flashlightOn 
                    ? "bg-gradient-to-br from-gold via-white to-gold shadow-[0_0_100px_rgba(255,255,255,0.8)] scale-110" 
                    : "bg-gray-800 opacity-30"
                )}>
                  <div className={cn("w-full h-full rounded-full flex items-center justify-center", flashlightOn && useScreenProjector ? "bg-white" : "bg-black")}>
                    <Flashlight className={cn("w-20 h-20 transition-all duration-500", flashlightOn ? "text-gold" : "text-gray-900")} />
                  </div>
                  
                  {/* Decorative hardware light ring */}
                  {!useScreenProjector && flashlightOn && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-gold"
                    />
                  )}
                </div>
                
                {flashlightOn && (
                   <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {projectorTheme === 'stars' && <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-[180px] opacity-60 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">✨</motion.div>}
                      {projectorTheme === 'heart' && <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-[180px] opacity-60 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">❤️</motion.div>}
                      {projectorTheme === 'magic' && <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[180px] opacity-60 drop-shadow-[0_0_30px_rgba(0,191,255,0.5)]">⚡</motion.div>}
                   </div>
                )}
              </div>

              <div className="space-y-2">
                <h2 className={cn(
                  "text-4xl font-black italic tracking-tighter uppercase",
                  flashlightOn && useScreenProjector ? "text-black" : "gold-gradient bg-clip-text text-transparent"
                )}>የጨረር ሲስተም</h2>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", flashlightOn ? "bg-green-500 animate-ping" : "bg-red-500")} />
                    <p className="text-[10px] tracking-[0.4em] uppercase opacity-60 font-bold">
                      {useScreenProjector ? "በስክሪን እየበራ ነው" : "ሃርድዌር ዝግጁ ነው"}
                    </p>
                  </div>
                  {flashlightOn && (
                    <p className="text-xs font-black text-gold animate-bounce">
                      {projectorTheme.toUpperCase()} BEAM ACTIVE
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-50">
                    <span>ፕሮጀክሽን ሞድ</span>
                    <span>{useScreenProjector ? 'SOFTWARE' : 'HARDWARE'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setUseScreenProjector(false)}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        !useScreenProjector ? "bg-gold text-black border-gold" : "bg-white/5 border-white/10 text-gray-500"
                      )}
                    >
                      ሃርድዌር (Flash)
                    </button>
                    <button 
                      onClick={() => setUseScreenProjector(true)}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        useScreenProjector ? "bg-gold text-black border-gold" : "bg-white/5 border-white/10 text-gray-500"
                      )}
                    >
                      ስክሪን (Display)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['stars', 'heart', 'magic'] as const).map(theme => (
                  <button 
                    key={theme}
                    onClick={() => setProjectorTheme(theme)}
                    className={cn(
                      "group relative py-4 rounded-2xl border transition-all overflow-hidden",
                      projectorTheme === theme 
                        ? (flashlightOn && useScreenProjector ? "bg-black text-white border-black" : "bg-gold text-black border-gold")
                        : "bg-white/5 text-gray-400 border-white/10 hover:border-gold/30"
                    )}
                  >
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em]">{theme}</span>
                    {projectorTheme === theme && (
                      <motion.div layoutId="activeTheme" className="absolute inset-0 bg-white/10" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => toggleFlashlight(!flashlightOn)}
                  disabled={projectorCalibration}
                  className={cn(
                    "w-full py-6 rounded-[2rem] font-black text-xl uppercase tracking-tighter transition-all border-4 relative overflow-hidden",
                    projectorCalibration ? "bg-gray-800 text-gray-500 border-gray-700" :
                    flashlightOn 
                      ? "bg-red-600 text-white border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)]" 
                      : "bg-gold text-black border-gold hover:scale-[1.02] active:scale-95"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {projectorCalibration ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>ጨረሩ እየተስተካከለ ነው...</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-6 h-6" />
                        <span>{flashlightOn ? 'አጥፋ' : 'አብራ'}</span>
                      </>
                    )}
                  </span>
                </button>
                
                {useScreenProjector && flashlightOn && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 bg-gold/10 rounded-2xl border border-gold/20"
                  >
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <Zap className="w-3 h-3" />
                      ብርሃኑን ወደ ከፍተኛ ይጨምሩ
                    </p>
                  </motion.div>
                )}
                
                <button 
                  onClick={() => {
                    toggleFlashlight(false);
                    setShowProjector(false);
                  }}
                  className="w-full py-4 text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors"
                >
                  ዝጋ / CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black-soft border border-gold/30 rounded-3xl p-8 w-full max-w-md flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent">Share to Followers</h3>
                <button 
                  onClick={() => {
                    if (selectedFollowers.length === followers.length) {
                      setSelectedFollowers([]);
                    } else {
                      setSelectedFollowers(followers.map(f => f.uid));
                    }
                  }}
                  className="text-xs font-bold text-gold uppercase tracking-widest hover:opacity-80"
                >
                  {selectedFollowers.length === followers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-8 pr-2">
                {followers.length > 0 ? followers.map(follower => (
                  <div 
                    key={follower.uid}
                    onClick={() => {
                      if (selectedFollowers.includes(follower.uid)) {
                        setSelectedFollowers(selectedFollowers.filter(id => id !== follower.uid));
                      } else {
                        setSelectedFollowers([...selectedFollowers, follower.uid]);
                      }
                    }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer",
                      selectedFollowers.includes(follower.uid) ? "bg-gold/10 border-gold" : "bg-black border-white/5 hover:border-gold/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img src={follower.photoURL} className="w-10 h-10 rounded-full border border-gold/20" alt="" />
                      <span className="font-bold">{follower.displayName}</span>
                    </div>
                    {selectedFollowers.includes(follower.uid) ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-gold" />
                      </motion.div>
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No followers to share with yet.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowShareModal(false)} className="flex-1 py-3 text-gray-400 font-bold">Cancel</button>
                <button 
                  onClick={handleFinalShare}
                  disabled={selectedFollowers.length === 0}
                  className="flex-1 py-3 bg-gold text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share ({selectedFollowers.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 p-4 flex justify-around items-center z-50 transition-all duration-300",
        activeTab === 'home' && !viewingUserId
          ? "bg-gradient-to-t from-black/80 to-transparent"
          : "bg-black-soft/90 backdrop-blur-lg border-t border-gold/10"
      )}>
        <NavButton icon={<Home />} active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setViewingUserId(null); }} />
        <NavButton icon={<Globe />} active={activeTab === 'land'} onClick={() => setActiveTab('land')} />
        <NavButton icon={<PlusSquare className="w-8 h-8 text-gold" />} active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
        <NavButton icon={<MessageCircle />} active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
        <div className="relative">
          <NavButton icon={<UserIcon />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          {profile?.isDiamond && (
            <div className="absolute -top-1 -right-1">
              <DiamondBadge />
            </div>
          )}
        </div>
      </nav>

      {/* Floating Elite Concierge */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowLuxuryAdvisor(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-gold via-white to-gold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] z-[45] flex items-center justify-center border-2 border-black group"
      >
        <Sparkles className="w-7 h-7 text-black group-hover:animate-spin" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />
      </motion.button>

      {/* Luxury Advisor Modal */}
      <AnimatePresence>
        {showLuxuryAdvisor && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className={cn(
                "bg-black-soft border rounded-[2.5rem] w-full max-w-lg p-8 relative overflow-hidden flex flex-col shadow-2xl transition-all duration-1000",
                profile?.isDiamond ? "border-purple-500/50 shadow-[0_0_50px_rgba(112,0,255,0.2)] diamond-black-white" : "border-gold/40"
              )}
            >
              {profile?.isDiamond && <DiamondParticles />}
              <div className={cn("absolute top-0 left-0 w-full h-1", profile?.isDiamond ? "bg-gradient-to-r from-purple-500 via-white to-purple-500" : "bg-gradient-to-r from-transparent via-gold to-transparent")} />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={cn("text-3xl font-bold italic font-serif", profile?.isDiamond ? "text-white" : "bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent")}>
                    {profile?.isDiamond ? "Diamond Concierge" : "Elite Concierge"}
                  </h2>
                  <p className="text-gold/50 text-[10px] uppercase tracking-[0.4em]">Your personal AI Advisor</p>
                </div>
                <button onClick={() => setShowLuxuryAdvisor(false)} className="p-2 hover:bg-white/5 rounded-full text-gold/50">
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2 no-scrollbar min-h-[300px]">
                {luxuryAdvisorResponse ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gold/5 border border-gold/10 p-6 rounded-3xl text-gold/90 italic leading-relaxed font-serif text-lg"
                  >
                    "{luxuryAdvisorResponse}"
                    <div className="mt-4 flex justify-end">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce delay-200" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-gold/20 mx-auto mb-4" />
                    <p className="text-gray-500 font-serif">Ask me anything about elite lifestyle, wealth management, or the world of melkahayu.nahom.</p>
                  </div>
                )}
              </div>

              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Ask your advisor..."
                  value={luxuryAdvisorQuery}
                  onChange={(e) => setLuxuryAdvisorQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLuxuryAsk()}
                  className="w-full bg-black border-2 border-gold/20 rounded-2xl px-6 py-5 text-white pr-16 focus:outline-none focus:border-gold transition-all placeholder:text-gray-700 font-serif"
                />
                <button 
                  onClick={handleLuxuryAsk}
                  disabled={isLuxuryAdvisorLoading || !luxuryAdvisorQuery.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gold text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isLuxuryAdvisorLoading ? <RotateCcw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Diamond Vault Modal */}
      <AnimatePresence>
        {showVault && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black-soft border border-gold/30 rounded-[3rem] w-full max-w-2xl p-8 max-h-[85vh] overflow-hidden flex flex-col relative"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent italic font-serif">The Diamond Vault</h2>
                  <p className="text-gold/50 text-xs tracking-[0.3em] uppercase">Private Asset Exchange</p>
                </div>
                <button onClick={() => setShowVault(false)} className="p-3 bg-white/5 rounded-full text-gold">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                {luxuryAssets.length === 0 ? (
                  <div className="text-center py-20">
                    <Database className="w-20 h-20 text-gold/20 mx-auto mb-4" />
                    <p className="text-gold/40 italic">The vault is currently awaiting new excellence.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {luxuryAssets.map(asset => (
                      <motion.div 
                        key={asset.id}
                        whileHover={{ y: -5 }}
                        className="bg-black border border-white/10 rounded-3xl overflow-hidden group shadow-xl"
                      >
                        <div className="h-48 relative overflow-hidden">
                          <img src={asset.image} alt={asset.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-gold font-bold text-xs">
                            {asset.type.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2 font-serif">{asset.name}</h3>
                          <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">{asset.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gold font-bold text-lg">{asset.price.toLocaleString()} <span className="text-[10px]">ብር</span></p>
                              <p className="text-[10px] text-gray-600 uppercase">Acquisition Price</p>
                            </div>
                            <button 
                              onClick={() => {
                                if (profile && profile.coins >= asset.price) {
                                  // logic to purchase
                                  addToast("Acquisition Initiated", `Excellence, you are about to acquire ${asset.name}.`, "info");
                                } else {
                                  addToast("Insufficient Wealth", "Increase your holdings to acquire this asset.", "error");
                                }
                              }}
                              className="px-6 py-3 bg-gold text-black rounded-xl font-bold hover:scale-105 transition-all text-sm"
                            >
                              Acquire
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Owner Command Center Modal */}
      <AnimatePresence>
        {isAdminPanelOpen && profile?.role === 'owner' && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="bg-black-soft border-2 border-gold/40 rounded-[3rem] w-full max-w-4xl p-10 max-h-[90vh] overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.2)]"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                    <ShieldCheck className="w-10 h-10 text-black" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent italic uppercase tracking-tighter">Command Center</h2>
                    <p className="text-gold/50 text-[10px] tracking-[0.4em] uppercase">Ecosystem Governance & Management</p>
                  </div>
                </div>
                <button onClick={() => setIsAdminPanelOpen(false)} className="p-4 bg-white/5 rounded-2xl text-gold hover:bg-white/10 transition-all">
                  <ArrowLeft className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-black p-6 rounded-3xl border border-gold/20 flex flex-col items-center justify-center text-center">
                  <Users className="w-8 h-8 text-gold mb-3" />
                  <p className="text-3xl font-black text-white">{allUsers.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Citizens</p>
                </div>
                <div className="bg-black p-6 rounded-3xl border border-gold/20 flex flex-col items-center justify-center text-center">
                  <Coins className="w-8 h-8 text-gold mb-3" />
                  <p className="text-3xl font-black text-white">{allUsers.reduce((sum, u) => sum + (u.coins || 0), 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global Wealth Pool</p>
                </div>
                <div className="bg-black p-6 rounded-3xl border border-gold/20 flex flex-col items-center justify-center text-center">
                  <Zap className="w-8 h-8 text-gold mb-3" />
                  <p className="text-3xl font-black text-white">{posts.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Assets (Posts)</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-10 pr-4 no-scrollbar">
                <section>
                  <h3 className="text-gold font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                    <Database className="w-4 h-4" /> System Control
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={seedGifts} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-gold/10 transition-all group">
                      <GiftIcon className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-white">Seed Gift Catalog</p>
                      <p className="text-[10px] text-gray-500 uppercase">Populate initial luxury bazaar</p>
                    </button>
                    <button onClick={seedLuxuryAssets} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-gold/10 transition-all group">
                      <Gem className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-white">Seed Luxury Assets</p>
                      <p className="text-[10px] text-gray-500 uppercase">Initialize the Diamond Vault</p>
                    </button>
                    <button onClick={seedAds} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-gold/10 transition-all group">
                      <Megaphone className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-white">Seed Elite Ads</p>
                      <p className="text-[10px] text-gray-500 uppercase">Inject premium commercials</p>
                    </button>
                    <button 
                      onClick={() => {
                        setIsAdminPanelOpen(false);
                        setShowAdsManager(true);
                      }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-gold/10 transition-all group"
                    >
                      <Megaphone className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-white">Manage VIP Ads</p>
                      <p className="text-[10px] text-gray-500 uppercase">Inject media into VIP feed</p>
                    </button>
                    <button 
                      onClick={() => {
                        if (luxuryAssets.length > 0) {
                          startAuction(luxuryAssets[0].id);
                        } else {
                          addToast("Missing Assets", "Seed the vault first, excellence.", "info");
                        }
                      }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-gold/10 transition-all group"
                    >
                      <Gavel className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-white">Trigger Auction</p>
                      <p className="text-[10px] text-gray-500 uppercase">Start bidding for item #1</p>
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-gold font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Pending Elite Requests ({vipRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {vipRequests.length === 0 ? (
                      <p className="text-gray-500 italic text-sm">No pending requests at this time.</p>
                    ) : (
                      vipRequests.map(req => (
                        <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                              req.type === 'diamond' ? "diamond-purple-pink text-white" : "bg-gold text-black"
                            )}>
                              {req.type === 'diamond' ? 'D' : 'V'}
                            </div>
                            <div>
                              <p className="font-bold text-white text-lg">{allUsers.find(u => u.uid === req.userId)?.displayName || 'Unknown User'}</p>
                              <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                <span className={cn(req.type === 'diamond' ? "text-purple-400" : "text-gold")}>{req.plan}</span>
                                <span>ID: {req.transactionId}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => handleVipRequestAction(req.id, req.userId, 'approved', req.plan, req.type)}
                              className="flex-1 sm:px-6 py-2 bg-green-500 text-white font-bold rounded-xl text-xs hover:bg-green-600 transition-all uppercase tracking-widest"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleVipRequestAction(req.id, req.userId, 'rejected', req.plan, req.type)}
                              className="flex-1 sm:px-6 py-2 bg-red-500/10 text-red-500 font-bold border border-red-500/20 rounded-xl text-xs hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-gold font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Elite Management
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    {allUsers.slice(0, 10).map(u => (
                      <div key={u.uid} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                          <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-sm">{u.displayName}</p>
                            <p className="text-[10px] text-gray-500">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded-lg border border-gold/20">MANAGE</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed top-24 left-4 right-4 z-[2000] pointer-events-none flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto backdrop-blur-xl border rounded-2xl p-4 shadow-2xl flex gap-3 items-center max-w-sm transition-all duration-500",
                profile?.isDiamond 
                  ? "diamond-black-white border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                  : "bg-black-soft/90 border-gold/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                profile?.isDiamond ? "bg-white/20" : "bg-gold/10"
              )}>
                {profile?.isDiamond ? <DiamondBadge /> : <Bell className="w-5 h-5 text-gold" />}
              </div>
              <div className="flex-1">
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", profile?.isDiamond ? "text-white" : "text-gold")}>{toast.title}</p>
                <p className="text-sm text-white/90 line-clamp-1 font-serif italic">{toast.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* VIP Modal */}
      <AnimatePresence>
        {showVipModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black-soft border border-gold/30 rounded-3xl p-8 w-full max-w-md"
            >
              <h3 className={cn("text-2xl font-bold mb-4", isDiamondTab ? "text-purple-400" : "text-white")}>
                {isDiamondTab ? 'Diamond Upgrade' : 'Submit Payment'}
              </h3>
              <p className="text-gray-400 mb-6 font-bold text-sm">
                {isDiamondTab ? 'Upgrade costs 1500+ ETB. Send payment and enter Transaction ID.' : 'Enter the Transaction ID from your bank message.'}
              </p>
              
              <input 
                type="text" 
                placeholder="Transaction ID" 
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className={cn(
                  "w-full bg-black border rounded-xl p-4 mb-6 focus:outline-none transition-all",
                  isDiamondTab ? "border-purple-500/50 focus:border-purple-500" : "border-gold/20 focus:border-gold"
                )}
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowVipModal(false);
                    setIsDiamondTab(false);
                  }}
                  className="flex-1 py-3 text-gray-400 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitVipRequest}
                  className={cn(
                    "flex-1 py-3 font-bold rounded-xl",
                    isDiamondTab ? "diamond-purple-pink text-white" : "bg-gold text-black"
                  )}
                >
                  Submit ID
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Innovation Proposal Form */}
      <AnimatePresence>
        {showInnovationForm && (
          <InnovationProposalForm 
            onClose={() => setShowInnovationForm(false)}
            onSubmit={handleProposalSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProposal && (
          <ProposalDetail 
            proposal={selectedProposal}
            onClose={() => setSelectedProposal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRoyalWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden"
          >
            {/* Visual background accents */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[120px]" />
            </div>

            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="relative text-center px-6"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8 flex justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center border border-gold/40 shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                  <Crown className="w-12 h-12 text-gold" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-7xl font-bold italic font-serif text-white mb-4 tracking-tight"
              >
                Welcome to <br />
                <span className="text-gold royal-text-shadow">Nahom's Royal Kingdom</span>
              </motion.h1>

              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-6 mx-auto max-w-sm"
              />

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gold/60 uppercase tracking-[0.5em] text-[10px] font-bold"
              >
                Access Granted • Premium Experience
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Manager Modal */}
      <AnimatePresence>
        {showDevicesManager && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-black-soft border border-gold/20 rounded-[3rem] w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold italic font-serif text-gold">Linked Devices</h3>
                <button onClick={() => setShowDevicesManager(false)} className="p-2 hover:bg-white/5 rounded-full">
                   <Plus className="w-6 h-6 rotate-45 text-gray-500" />
                </button>
              </div>
              <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4 no-scrollbar">
                {profile?.devices?.map(dev => (
                  <div key={dev.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-gold/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gold/10 rounded-xl">
                        {dev.type === 'mobile' ? <Smartphone className="w-5 h-5 text-gold" /> : <Laptop className="w-5 h-5 text-gold" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{dev.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{dev.model}</p>
                      </div>
                    </div>
                    {dev.isCurrent ? (
                      <div className="text-[8px] bg-gold text-black font-black px-2 py-1 rounded-full">CURRENT</div>
                    ) : (
                      <button 
                        onClick={async () => {
                          if (!user) return;
                          const filtered = profile.devices?.filter(d => d.id !== dev.id);
                          await updateDoc(doc(db, 'users', user.uid), { devices: filtered });
                          addToast("Terminated", "Device access has been revoked.", "success");
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {(!profile?.devices || profile.devices.length === 0) && (
                  <div className="text-center py-12 text-gray-600">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="italic">No linked hardware found.</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-white/5 mt-auto bg-black-soft/50 backdrop-blur-md">
                <button 
                  onClick={handleAddDevice}
                  className="w-full py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  <Plus className="w-5 h-5" /> Add Another Device
                </button>
                <p className="text-center text-[8px] text-gray-500 mt-4 uppercase tracking-[0.3em] font-black leading-relaxed">
                  Secure Biometric Sync • 256-bit Encryption
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Shop Modal */}
      <AnimatePresence>
        {showGiftShop && (
          <GiftShopModal 
            gifts={giftCatalog} 
            onSend={(gift: Gift) => {
              if (selectedRecipientId) {
                handleSendGift(selectedRecipientId, gift);
              } else {
                // If no recipient selected, maybe buying for self or just browsing
                addToast("Error", "Please select a user to send a gift to!", "error");
              }
            }} 
            onClose={() => {
              setShowGiftShop(false);
              setSelectedRecipientId(null);
            }} 
            coins={profile?.coins || 0}
          />
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black-soft border border-gold/30 rounded-3xl p-8 w-full max-w-md text-center"
            >
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-gold animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{comingSoonTitle}</h3>
              <p className="text-gray-400 mb-8">This feature is currently under development and will be available in the next update! ✨</p>
              
              <button 
                onClick={() => setShowComingSoon(false)}
                className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-gold-light transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hearts Animation */}
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, scale: 0.5, x: heart.x, y: heart.y }}
            animate={{ opacity: 0, scale: 1.5, y: heart.y - 150, x: heart.x + (Math.random() * 100 - 50) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed pointer-events-none z-[9999] text-red-500"
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 bg-black z-[500] flex flex-col">
            {/* Camera Preview */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black-soft z-50">
                  <CameraOff className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Camera Error</h3>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6 max-w-xs">
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                      {cameraError}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm"
                      >
                        Go Back
                      </button>
                      <button 
                        onClick={() => setCameraRetryKey(prev => prev + 1)}
                        className="flex-1 px-6 py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold-light transition-all text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        Retry
                      </button>
                    </div>

                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="w-full px-6 py-3 bg-blue-600/20 text-blue-400 font-bold rounded-xl hover:bg-blue-600/30 transition-all text-sm border border-blue-600/30"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video 
                    ref={cameraVideoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                  />
                  <canvas 
                    ref={cameraCanvasRef}
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover z-20 transition-all duration-500",
                      cameraFacing === 'user' && "scale-x-[-1]"
                    )}
                    style={getFilterStyle(activeFilter)}
                  />
                </div>
              )}

              {/* Camera Controls Overlay */}
              <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center z-30">
                <button onClick={() => setShowFilters(false)} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCameraFacing(f => f === 'user' ? 'environment' : 'user')}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Recording</span>
                </div>
              )}
            </div>

            {/* Filter Selection & Capture */}
            <div className="bg-black-soft p-6 rounded-t-[3rem] border-t border-gold/30 z-40">
              {/* Mode Selection */}
              <div className="flex justify-center gap-8 mb-8">
                <button 
                  onClick={() => setCaptureMode('photo')}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-all",
                    captureMode === 'photo' ? "text-gold scale-110" : "text-gray-500"
                  )}
                >
                  Photo
                </button>
                <button 
                  onClick={() => setCaptureMode('video')}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-all",
                    captureMode === 'video' ? "text-gold scale-110" : "text-gray-500"
                  )}
                >
                  Video
                </button>
              </div>

              {/* Filter List */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 mb-8">
                {[
                  { id: 'none', name: 'Original', icon: '📸' },
                  { id: 'dog', name: 'Ultra Dog', icon: '🐶' },
                  { id: 'glasses', name: 'Ultra Shades', icon: '😎' },
                  { id: 'emoji', name: 'Ultra Mood', icon: '😂' },
                  { id: 'funny', name: 'Ultra Wacky', icon: '🤪' },
                  { id: 'beauty', name: 'Ultra Beauty', icon: '✨' },
                  { id: 'vintage', name: 'Vintage', icon: '🎞️' },
                  { id: 'glitch', name: 'Cyber', icon: '👾' },
                  { id: 'bw', name: 'Noir', icon: '📽️' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl border transition-all",
                      activeFilter === filter.id ? "bg-gold/10 border-gold" : "bg-black border-white/5"
                    )}
                  >
                    <span className="text-2xl">{filter.icon}</span>
                    <span className="text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap">{filter.name}</span>
                  </button>
                ))}
              </div>

              {/* Capture Button */}
              <div className="flex justify-center items-center gap-12">
                <div className="w-12 h-12" /> {/* Spacer */}
                <button 
                  onClick={handleCapture}
                  className={cn(
                    "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all active:scale-90",
                    captureMode === 'video' ? "border-red-500" : "border-white"
                  )}
                >
                  <div className={cn(
                    "rounded-full transition-all",
                    captureMode === 'video' 
                      ? (isRecording ? "w-8 h-8 rounded-sm bg-red-500" : "w-16 h-16 bg-red-500")
                      : "w-16 h-16 bg-white"
                  )} />
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 font-bold text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black-soft border border-white/10 rounded-[40px] w-full max-w-md h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gold" />
                  Notifications
                </h3>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                    <Bell className="w-12 h-12 opacity-20" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <motion.div 
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-4 rounded-3xl border transition-all flex gap-4 items-start relative group",
                        notification.isRead ? "bg-white/5 border-transparent" : "bg-gold/5 border-gold/20"
                      )}
                    >
                      <img 
                        src={notification.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.senderId}`} 
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        alt=""
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-bold text-white">{notification.senderName}</span>
                          {" "}
                          <span className="text-gray-400">{notification.text}</span>
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">
                          {notification.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 transition-all"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ads Manager Modal (Owner Only) */}
      <AnimatePresence>
        {showAdsManager && profile?.role === 'owner' && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[700] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black-soft border border-gold/30 rounded-[3rem] w-full max-w-2xl p-8 max-h-[85vh] overflow-hidden flex flex-col relative"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gold italic font-serif">VIP Ad Manager</h2>
                  <p className="text-gray-500 text-xs tracking-widest uppercase">Visible only to VIPs (not Diamond)</p>
                </div>
                <button onClick={() => setShowAdsManager(false)} className="p-3 bg-white/5 rounded-full text-gold">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-6 mb-8 bg-black/40 p-6 rounded-3xl border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAdType('video')}
                    className={cn(
                      "py-3 rounded-xl font-bold transition-all border",
                      adType === 'video' ? "bg-gold text-black border-gold" : "bg-white/5 text-gray-500 border-white/10"
                    )}
                  >
                    Video Ad
                  </button>
                  <button 
                    onClick={() => setAdType('image')}
                    className={cn(
                      "py-3 rounded-xl font-bold transition-all border",
                      adType === 'image' ? "bg-gold text-black border-gold" : "bg-white/5 text-gray-500 border-white/10"
                    )}
                  >
                    Image Ad
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-black mb-2 block tracking-widest">Media URL (Video/Photo)</label>
                  <input 
                    type="text" 
                    value={adContent}
                    onChange={(e) => setAdContent(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-gold/20 rounded-2xl p-4 text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <button 
                  onClick={handleAddAd}
                  disabled={!adContent}
                  className="w-full py-4 bg-gold text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  Launch Advertisement
                </button>
              </div>

              {/* Broadcast Section */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-gold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Global Broadcast
                </h3>
                <textarea 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type an announcement for all users..."
                  className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-gold mb-3"
                />
                <button 
                  onClick={handleSendBroadcast}
                  disabled={!broadcastMessage.trim()}
                  className="w-full py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  Blast Announcement
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                <h3 className="text-gold text-xs font-black uppercase tracking-widest mb-4">Active Campaigns</h3>
                <div className="space-y-4">
                  {ads.length === 0 ? (
                    <p className="text-gray-600 italic text-center py-8">No active ads. Launch your first campaign above.</p>
                  ) : (
                    ads.map(ad => (
                      <div key={ad.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                          {ad.type === 'video' ? (
                            <video src={ad.content} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={ad.content} className="w-full h-full object-cover" alt="" />
                          )}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-xs font-bold text-white truncate">{ad.content}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{ad.type}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory Membership Choice */}
      <AnimatePresence>
        {mustChooseMembership && (
          <div className="fixed inset-0 bg-black z-[1100] flex items-center justify-center p-0 md:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full md:h-auto md:max-w-4xl bg-black-pure md:rounded-[40px] md:border border-white/10 overflow-hidden relative flex flex-col md:flex-row"
            >
              {/* Left Side: Diamond */}
              <div className="flex-1 p-10 flex flex-col items-center justify-center text-center relative group overflow-hidden">
                <DiamondParticles />
                <div className="absolute inset-0 diamond-purple-pink opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />
                <Gem className="w-20 h-20 text-white mb-6 drop-shadow-[0_0_20px_white]" />
                <h2 className="text-4xl font-black text-white italic mb-4">DIAMOND ELITE</h2>
                <ul className="text-white/60 space-y-2 mb-8 text-sm">
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> NO ADS EVER</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Diamond Icon & Theme</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 24/7 Flying Owls</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> The Diamond Vault</li>
                </ul>
                <button 
                  onClick={() => {
                    setIsDiamondTab(true);
                    setMustChooseMembership(false);
                    setShowVipModal(true);
                  }}
                  className="px-10 py-5 diamond-purple-pink text-white font-black uppercase tracking-widest rounded-2xl hover:scale-110 transition-all shadow-[0_0_40px_rgba(255,0,255,0.4)]"
                >
                  Choose Diamond
                </button>
              </div>

              {/* Center Divider */}
              <div className="w-px h-full bg-white/10 hidden md:block" />

              {/* Right Side: VIP */}
              <div className="flex-1 p-10 flex flex-col items-center justify-center text-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-gold opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />
                <Crown className="w-20 h-20 text-gold mb-6 drop-shadow-[0_0_20px] shadow-gold/40" />
                <h2 className="text-4xl font-black text-gold italic mb-4">VIP PRESTIGE</h2>
                <ul className="text-gold/60 space-y-2 mb-8 text-sm">
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-gold" /> Exclusive Ads Included</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-gold" /> VIP Status Badge</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-gold" /> Pro Video Filters</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-gold" /> Luxury Benefits</li>
                </ul>
                <button 
                  onClick={() => {
                    setIsDiamondTab(false);
                    setMustChooseMembership(false);
                    setShowVipModal(true);
                  }}
                  className="px-10 py-5 bg-gold text-black font-black uppercase tracking-widest rounded-2xl hover:scale-110 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)]"
                >
                  Choose VIP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seen By Modal */}
      <AnimatePresence>
        {showSeenByModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black-soft border border-gold/30 rounded-[2.5rem] w-full max-w-md p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent italic font-serif">Seen By</h2>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Users who viewed this</p>
                </div>
                <button onClick={() => setShowSeenByModal(false)} className="p-2 bg-white/5 rounded-full text-gray-500">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                {seenByUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No views yet</p>
                  </div>
                ) : (
                  seenByUsers.map((u) => (
                    <div key={u.uid} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-12 h-12 rounded-full border border-gold/20" alt="" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{u.displayName}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{u.isVip ? 'VIP Member' : 'Member'}</p>
                      </div>
                      {u.isVip && <Crown className="w-4 h-4 text-gold" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getFilterStyle = (filterId?: string) => {
  switch (filterId) {
    case 'funny': return { filter: 'hue-rotate(90deg) saturate(2)' };
    case 'beauty': return { filter: 'brightness(1.1) contrast(1.1) saturate(1.2)' };
    case 'vintage': return { filter: 'sepia(0.5) contrast(1.2) brightness(0.9)' };
    case 'glitch': return { filter: 'hue-rotate(180deg) invert(0.1)' };
    case 'bw': return { filter: 'grayscale(1)' };
    case 'warm': return { filter: 'sepia(0.3) saturate(1.5)' };
    default: return {};
  }
};

function TikTokPost({ post, onLike, onView, onShowSeenBy, isVip, isDiamondUser, onProfileClick, onFollow, isFollowing, isOwnPost, onShare, onComment, onSendGift, allUsers }: any) {
  const authorProfile = allUsers.find((u: any) => u.uid === post.authorId);
  const isDiamondAuthor = authorProfile?.isDiamond;
  const isAd = post.isAd;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState<{ id: number; x: number; y: number } | null>(null);

  const lastTap = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
          onView?.();
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap
      onLike(e);
      const rect = e.currentTarget.getBoundingClientRect();
      setShowHeart({
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setTimeout(() => setShowHeart(null), 1000);
    } else {
      // Single tap
      togglePlay();
    }
    lastTap.current = now;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const videoUrls = [
    "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-in-the-wind-1150-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-at-the-beach-1151-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-dancing-in-the-rain-1152-large.mp4"
  ];
  const videoSrc = post.mediaUrl || videoUrls[Math.abs(post.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % videoUrls.length];

  return (
    <div className="h-full w-full snap-start relative bg-black flex items-center justify-center overflow-hidden">
      {/* Video/Image/Audio Content */}
      <div className="absolute inset-0 flex items-center justify-center" onClick={handleTap}>
        <div className={cn(
          "w-full h-full relative",
          isDiamondAuthor && (authorProfile?.diamondTheme === 'purple-pink' ? "border-[6px] border-purple-500 shadow-[0_0_40px_rgba(112,0,255,0.4)]" : "border-[6px] border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.3)]")
        )} style={getFilterStyle(post.filterId)}>
          {isDiamondUser && <FlyingOwls count={10} />}
          {isDiamondAuthor && (
            <div className={cn(
              "absolute top-2 left-2 px-6 py-1.5 rounded-full text-[12px] font-black uppercase italic tracking-[0.2em] z-20 shadow-2xl",
              authorProfile?.diamondTheme === 'purple-pink' ? "diamond-purple-pink" : "diamond-black-white"
            )}>
              Diamond Elite Flag
            </div>
          )}
          {post.type === 'video' ? (
            <video 
              ref={videoRef}
              src={videoSrc} 
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : post.type === 'audio' ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-gold/20 flex flex-col items-center justify-center p-8">
              <div className="w-48 h-48 rounded-full bg-gold/10 border-4 border-gold/30 flex items-center justify-center mb-8 relative">
                <Music className={cn("w-24 h-24 text-gold", isPlaying && "animate-bounce")} />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-4 border-gold animate-ping opacity-20" />
                )}
              </div>
              <audio 
                ref={videoRef as any}
                src={post.mediaUrl}
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <p className="text-gold font-bold text-xl mb-2">Audio Post</p>
              <p className="text-gray-400 text-sm">Tap to {isPlaying ? 'pause' : 'play'}</p>
            </div>
          ) : (
            <img 
              src={post.mediaUrl || `https://picsum.photos/seed/${post.id}/1080/1920`} 
              alt="Post" 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Filter Overlays */}
        {isAd && (
          <div className="absolute top-20 left-4 z-40 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-gold/40 flex items-center gap-2">
            <Megaphone className="w-3 h-3 text-gold" />
            <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Sponsored Ad</span>
          </div>
        )}
        {post.filterId === 'funny' && (
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 text-5xl pointer-events-none"
          >
            🤪
          </motion.div>
        )}
        {post.filterId === 'cockroach-mouth' && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-4xl pointer-events-none"
          >
            🪳
          </motion.div>
        )}
        {post.filterId === 'cockroach-nose' && (
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-3xl pointer-events-none"
          >
            🪳
          </motion.div>
        )}
        
        {!isPlaying && post.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-16 h-16 text-white/50" />
          </div>
        )}

        {showHeart && (
          <motion.div
            key={showHeart.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
            style={{ left: showHeart.x - 50, top: showHeart.y - 50 }}
            className="absolute pointer-events-none z-50"
          >
            <Heart className="w-24 h-24 text-gold fill-gold" />
          </motion.div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <div className="flex flex-col items-center">
          <button 
            onClick={onProfileClick}
            className={cn(
              "w-12 h-12 rounded-full border-2 p-0.5 bg-black mb-1 relative",
              isDiamondAuthor ? (authorProfile?.diamondTheme === 'purple-pink' ? "border-purple-500 shadow-[0_0_15px_rgba(112,0,255,0.6)]" : "border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]") : "border-gold"
            )}
          >
            <img 
              src={authorProfile?.photoURL || post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} 
              className="w-full h-full rounded-full object-cover" 
              alt="" 
            />
            {isDiamondAuthor && (
              <div className="absolute -top-1 -right-1 scale-75">
                <DiamondBadge />
              </div>
            )}
          </button>
          {!isOwnPost && !isFollowing && (
            <button 
              onClick={onFollow}
              className="w-5 h-5 bg-gold rounded-full flex items-center justify-center -mt-3 border-2 border-black"
            >
              <Plus className="w-3 h-3 text-black" />
            </button>
          )}
        </div>

        <button onClick={(e) => onLike(e)} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-gold transition-colors">
            <Heart className={cn("w-7 h-7", post.likes > 0 && "fill-gold text-gold")} />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{post.likes}</span>
        </button>

        <button onClick={onComment} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-gold transition-colors">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{post.commentsCount}</span>
        </button>

        <button onClick={() => onSendGift(post.authorId)} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-gold transition-all">
            <GiftIcon className="w-7 h-7" />
          </div>
        </button>

        <button onClick={() => onShare("Check this out!", post.content)} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-gold transition-colors">
            <Share2 className="w-7 h-7" />
          </div>
        </button>

        <button onClick={onShowSeenBy} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-active:scale-90 transition-all border border-white/10">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-lg">{post.views || 0}</span>
        </button>

        {post.filterId && post.filterId !== 'none' && (
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[8px] font-bold text-gold uppercase tracking-tighter">{post.filterId}</span>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10">
        <div className="pr-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-bold text-white text-lg flex items-center gap-2">
              {post.authorName}
              <span className="text-sm">{getUserBadge(post.authorId, allUsers)}</span>
            </div>
            {isVip && <Crown className="w-4 h-4 text-gold" />}
          </div>
          <p className="text-white text-sm line-clamp-2 mb-3">{post.content}</p>
          
          {post.aiMusicSuggestion && (
            <div className="flex items-center gap-2 text-gold text-xs font-medium">
              <Music className="w-3 h-3 animate-spin-slow" />
              <span className="truncate">AI Suggestion: {post.aiMusicSuggestion}</span>
            </div>
          )}

          {post.aiComment && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-4 bg-gold/10 backdrop-blur-md p-3 rounded-xl border border-gold/20 flex gap-3 items-start max-w-xs"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/30 flex-shrink-0">
                <img src="input_file_2.png" className="w-full h-full object-cover scale-[1.3]" alt="" />
              </div>
              <div>
                <p className="text-[8px] text-gold uppercase font-bold mb-1">Nahom's assistant</p>
                <p className="text-[10px] italic text-gray-200 leading-tight">"{post.aiComment}"</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

const moodEmojis: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😡',
  tired: '😴',
  love: '❤️',
  lonely: '😔',
  excited: '🤩'
};

function getUserBadge(userId: string, allUsers: UserProfile[], profile?: UserProfile | null) {
  const index = allUsers.sort((a,b) => (b.coins || 0) - (a.coins || 0)).findIndex(u => u.uid === userId);
  const badges = [];
  
  const userProfile = allUsers.find(u => u.uid === userId) || (profile?.uid === userId ? profile : null);
  
  if (userProfile?.role === 'owner') badges.push('🗝️');
  if (userProfile?.isDiamond) badges.push('💎');
  if (userProfile?.isVip) badges.push('👑');
  
  if (index === 0) badges.push('🥇');
  else if (index === 1) badges.push('🥈');
  else if (index === 2) badges.push('🥉');
  
  return (
    <span className="inline-flex items-center gap-0.5">
      {userProfile?.role === 'owner' && <ShieldCheck className="w-3 h-3 text-gold fill-gold/20" />}
      {userProfile?.isDiamond && <Gem className="w-3 h-3 text-purple-400 fill-purple-400/20 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />}
      {userProfile?.isVip && !userProfile?.isDiamond && <Crown className="w-3 h-3 text-gold fill-gold/20" />}
      <span className="ml-1 text-[10px]">{badges.filter(b => typeof b === 'string').join('')}</span>
    </span>
  );
}

function GiftShopModal({ gifts, onSend, onClose, coins }: { gifts: Gift[], onSend: (gift: Gift) => void, onClose: () => void, coins: number }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-black-soft border border-gold/30 rounded-3xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Gift Shop</h3>
          <div className="flex items-center gap-1 bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-gold font-bold">{coins} ብር</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {gifts.map(gift => (
            <button
              key={gift.id}
              onClick={() => onSend(gift)}
              className="flex flex-col items-center p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-gold/50 transition-all group"
            >
              <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">{gift.icon}</span>
              <span className="text-xs font-bold text-white mb-1">{gift.name}</span>
              <span className="text-[10px] text-gold">{gift.price} ብር</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

function MoodPostCard({ post, onReact, onView, onShowSeenBy, onProfileClick, allUsers }: { post: MoodPost, onReact: (type: 'heart' | 'hug' | 'thumb') => void, onView?: () => void, onShowSeenBy?: () => void, onProfileClick?: () => void, allUsers: UserProfile[] }) {
  useEffect(() => {
    onView?.();
  }, []);

  const authorProfile = allUsers.find(u => u.uid === post.userId);
  const isDiamondAuthor = authorProfile?.isDiamond;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-black-soft border rounded-3xl p-6 shadow-xl transition-all relative overflow-hidden",
        isDiamondAuthor 
          ? (authorProfile?.diamondTheme === 'purple-pink' ? "border-purple-500 shadow-[0_0_20px_rgba(112,0,255,0.3)]" : "border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]")
          : "border-white/5 hover:border-gold/20"
      )}
    >
      {isDiamondAuthor && (
        <div className={cn(
          "absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase italic tracking-tighter z-10",
          authorProfile?.diamondTheme === 'purple-pink' ? "diamond-purple-pink" : "diamond-black-white"
        )}>
          Diamond Flag
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-2xl">
            {moodEmojis[post.mood]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gold uppercase tracking-widest">Feeling {post.mood}</p>
              <button onClick={onShowSeenBy} className="flex items-center gap-1 text-gray-500 hover:text-gold transition-colors">
                <Eye className="w-3 h-3" />
                <span className="text-[8px] font-bold">{post.views || 0}</span>
              </button>
            </div>
            <button 
              onClick={onProfileClick}
              disabled={post.isAnonymous}
              className={cn("text-sm font-medium flex items-center gap-2", post.isAnonymous ? "text-gray-500" : "text-white hover:text-gold transition-colors")}
            >
              {post.isAnonymous ? 'Anonymous' : (
                <>
                  {allUsers.find(u => u.uid === post.userId)?.displayName || 'User'}
                  <span className="text-xs">{getUserBadge(post.userId, allUsers)}</span>
                </>
              )}
            </button>
          </div>
        </div>
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">
          {new Date(post.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p className="text-lg text-white/90 mb-6 leading-relaxed italic">"{post.text}"</p>

      <div className="flex gap-2">
        <button 
          onClick={() => onReact('heart')}
          className="flex-1 py-2 bg-white/5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
        >
          <span className="text-lg">❤️</span>
          <span className="text-xs font-bold">{post.reactions.heart}</span>
        </button>
        <button 
          onClick={() => onReact('hug')}
          className="flex-1 py-2 bg-white/5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-transparent hover:border-blue-500/20"
        >
          <span className="text-lg">🤗</span>
          <span className="text-xs font-bold">{post.reactions.hug}</span>
        </button>
        <button 
          onClick={() => onReact('thumb')}
          className="flex-1 py-2 bg-white/5 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/10 hover:text-gold transition-all border border-transparent hover:border-gold/20"
        >
          <span className="text-lg">👍</span>
          <span className="text-xs font-bold">{post.reactions.thumb}</span>
        </button>
      </div>
    </motion.div>
  );
}

function PostCard({ post, onLike, isVip, onProfileClick, onFollow, isFollowing, isOwnPost, onShare }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "bg-black-soft rounded-3xl overflow-hidden border border-gold/10",
        isVip && "vip-shine border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
      )}
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-gold/20 p-0.5 hover:scale-110 transition-transform"
          >
            <img 
              src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} 
              alt="Author" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          <div>
            <p className="font-bold text-sm flex items-center gap-1">
              {post.authorName}
              {isVip && <Crown className="w-3 h-3 text-gold" />}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              {post.createdAt?.toDate().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {!isOwnPost && (
          <button 
            onClick={onFollow}
            className={cn(
              "px-4 py-1 rounded-full text-xs font-bold transition-all",
              isFollowing ? "bg-white/10 text-white" : "bg-gold text-black"
            )}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="aspect-square bg-black flex items-center justify-center relative group">
        {post.type === 'video' ? (
          <video 
            src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4" 
            className="w-full h-full object-cover"
            loop
            muted
            autoPlay
            playsInline
          />
        ) : (
          <img 
            src={`https://picsum.photos/seed/${post.id}/800/800`} 
            alt="Post" 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Interaction Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
          <div className="flex gap-4">
            <button onClick={(e) => onLike(e)} className="flex items-center gap-1 text-white hover:text-gold transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-sm font-bold">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-white hover:text-gold transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-bold">{post.commentsCount}</span>
            </button>
            <button onClick={() => onShare("New Post", post.content)} className="flex items-center gap-1 text-white hover:text-gold transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Post Footer */}
      <div className="p-4">
        <p className="text-sm mb-3">{post.content}</p>
        
        {post.aiMusicSuggestion && (
          <div className="flex items-center gap-2 text-xs text-gold bg-gold/5 p-2 rounded-lg border border-gold/10 mb-3">
            <Music className="w-3 h-3" />
            <span>AI Suggestion: {post.aiMusicSuggestion}</span>
          </div>
        )}

        {post.aiComment && (
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex gap-3 items-start">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/30 flex-shrink-0">
              <img 
                src="input_file_2.png" 
                alt="Nahom's Assistant" 
                className="w-full h-full object-cover scale-[1.3]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-[10px] text-gold uppercase font-bold">Nahom's assistant</p>
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-2 h-2 text-white" />
                </div>
              </div>
              <p className="text-xs italic text-gray-300">"{post.aiComment}"</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NavButton({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl transition-all",
        active ? "text-gold scale-110" : "text-gray-500 hover:text-white"
      )}
    >
      {icon}
    </button>
  );
}

function PlanCard({ title, price, selected, onClick }: { title: string, price: string, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex justify-between items-center p-4 rounded-2xl border transition-all",
        selected ? "bg-gold/10 border-gold" : "bg-black border-white/10 hover:border-gold/30"
      )}
    >
      <div className="text-left">
        <p className={cn("font-bold", selected ? "text-gold" : "text-white")}>{title}</p>
        <p className="text-xs text-gray-500">Full Access</p>
      </div>
      <p className="font-bold text-gold">{price}</p>
    </button>
  );
}

function SettingItem({ icon, title, subtitle, onClick }: { icon: any, title: string, subtitle?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all border-b border-white/5 last:border-none"
    >
      <div className="flex items-center gap-4">
        <div className="text-gold">{icon}</div>
        <div className="text-left">
          <p className="font-medium text-white">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </button>
  );
}
