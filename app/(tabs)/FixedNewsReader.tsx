import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Share,
  Alert,
  Easing,
  ActivityIndicator,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import i18n from "@/i18n/i18n";
import { useNavigation } from '@react-navigation/native';

const NEWS_API_KEY = 'pub_ec0593ecc10341e0a6ed42b08344dd2e';
const NEWS_API_URL = 'https://newsdata.io/api/1/news';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'ka', label: 'ಕನ್ನಡ' },
  { code: 'ma', label: 'मराठी' },
  { code: 'pu', label: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[];
  creator: string[];
  description: string;
  content: string;
  pubDate: string;
  image_url: string;
  source_name: string;
  readTime?: string;
}

// Fixed mock data that works without API
const MOCK_ARTICLES: NewsArticle[] = [
  {
    article_id: '1',
    title: 'Revolutionizing Agriculture with Drone Technology',
    link: 'https://example.com/drone-agriculture',
    keywords: ['drones', 'agriculture', 'technology', 'farming'],
    creator: ['Sarah Johnson'],
    description: 'How drone technology is transforming modern farming practices and increasing crop yields.',
    content: 'Drone technology has revolutionized the way farmers approach crop management. From precision spraying to crop monitoring, drones are providing farmers with unprecedented insights into their fields. This technology allows for targeted application of fertilizers and pesticides, reducing waste and environmental impact while maximizing yields.',
    pubDate: '2024-01-15T10:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1560472354-b7908d6bb6c5?w=800',
    source_name: 'AgriTech Today',
    readTime: '5 min read'
  },
  {
    article_id: '2',
    title: 'Smart Farming: IoT Solutions for Modern Agriculture',
    link: 'https://example.com/smart-farming',
    keywords: ['IoT', 'smart farming', 'sensors', 'automation'],
    creator: ['Michael Chen'],
    description: 'Internet of Things devices are making farms smarter and more efficient than ever before.',
    content: 'Smart farming technologies are transforming agriculture through IoT sensors, automated irrigation systems, and real-time data analytics. These innovations help farmers make data-driven decisions, optimize resource usage, and improve crop quality while reducing environmental impact.',
    pubDate: '2024-01-14T15:45:00Z',
    image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=800',
    source_name: 'TechFarm Weekly',
    readTime: '7 min read'
  },
  {
    article_id: '3',
    title: 'Sustainable Agriculture: The Future of Farming',
    link: 'https://example.com/sustainable-farming',
    keywords: ['sustainability', 'organic farming', 'environment', 'green agriculture'],
    creator: ['Emma Rodriguez'],
    description: 'Exploring sustainable farming practices that protect the environment while ensuring food security.',
    content: 'Sustainable agriculture is becoming increasingly important as we face climate change challenges. This approach focuses on farming practices that maintain soil health, conserve water, reduce chemical inputs, and promote biodiversity while ensuring long-term food production.',
    pubDate: '2024-01-13T09:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    source_name: 'Green Agriculture',
    readTime: '6 min read'
  }
];

const FixedNewsReader = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeAnimation] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('');
  const pan = useRef(new Animated.ValueXY()).current;
  const { height, width } = Dimensions.get('window');
  const swipeThreshold = width * 0.3;

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setApiStatus('Testing API connection...');
      
      // Try to fetch from API first
      const apiUrl = `${NEWS_API_URL}?apikey=${NEWS_API_KEY}&language=en&category=technology&size=5`;
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.results && data.results.length > 0) {
            const processedArticles = data.results.map((article: any) => ({
              ...article,
              readTime: `${Math.ceil((article.content?.length || 500) / 200)} min read`
            }));
            setArticles(processedArticles);
            setApiStatus('Live news loaded successfully');
          } else {
            throw new Error('No articles in response');
          }
        } else {
          throw new Error(`API Error: ${response.status}`);
        }
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError);
        setApiStatus('Using sample data - API unavailable');
        setArticles(MOCK_ARTICLES);
      }
      
      setLikeCount(Math.floor(Math.random() * 100) + 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setArticles(MOCK_ARTICLES);
      setApiStatus('Using sample data due to error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articles.length > 0) {
      setLikeCount(Math.floor(Math.random() * 100) + 10);
      setLiked(false);
    }
  }, [currentArticleIndex, articles]);

  const animateLike = () => {
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.5,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    animateLike();
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setMenuVisible(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > swipeThreshold && articles.length > 1) {
          loadNextArticle();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const loadNextArticle = () => {
    Animated.timing(pan, {
      toValue: { x: 0, y: height },
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setCurrentArticleIndex(prev => (prev + 1) % articles.length);
      setBookmarked(false);
    });
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    Alert.alert(
      bookmarked ? 'Removed' : 'Saved',
      bookmarked ? 'Article removed from bookmarks' : 'Article saved to bookmarks'
    );
  };

  const shareArticle = async () => {
    if (articles.length === 0) return;
    
    try {
      const article = articles[currentArticleIndex];
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.description?.substring(0, 100)}...\n\n${article.link}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatContent = (content: string) => {
    if (!content) return ['No content available'];
    const cleanContent = content.replace(/\[.*?\]/g, '').replace(/<[^>]*>/g, '');
    const paragraphs = cleanContent.split('\n').filter(p => p.trim().length > 0);
    return paragraphs.length > 0 ? paragraphs : [cleanContent.substring(0, 200) + '...'];
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading news...</Text>
        {apiStatus ? <Text style={styles.statusText}>{apiStatus}</Text> : null}
      </View>
    );
  }

  const currentArticle = articles[currentArticleIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
          <Text style={styles.headerTitle}>News Reader</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {apiStatus && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>{apiStatus}</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.articleContainer,
          { transform: [{ translateY: pan.y }] }
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView>
          <Image
            source={{ uri: currentArticle.image_url || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800' }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <Text style={styles.title}>{currentArticle.title}</Text>
            
            <View style={styles.metaContainer}>
              <Text style={styles.department}>{currentArticle.source_name || 'News'}</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.date}>
                {formatDate(currentArticle.pubDate)} • {currentArticle.readTime}
              </Text>
            </View>

            <Text style={styles.author}>
              By {currentArticle.creator?.[0] || 'Staff Writer'}
            </Text>

            {currentArticle.keywords && currentArticle.keywords.length > 0 && (
              <View style={styles.tags}>
                {currentArticle.keywords.slice(0, 3).map((tag, index) => (
                  <Text key={index} style={styles.tag}>{tag}</Text>
                ))}
              </View>
            )}

            {formatContent(currentArticle.content).map((paragraph, index) => (
              <Text key={index} style={styles.body}>{paragraph}</Text>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLike}
            >
              <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
                <Icon 
                  name={liked ? "heart" : "heart"} 
                  size={24} 
                  color={liked ? "#FF4081" : "#777"} 
                />
              </Animated.View>
              <Text style={[styles.actionText, liked && styles.likedText]}>
                {likeCount}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={toggleBookmark}>
              <Icon 
                name={bookmarked ? "bookmark" : "bookmark"} 
                size={24} 
                color={bookmarked ? "#4CAF50" : "#777"} 
              />
              <Text style={styles.actionText}>
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={shareArticle}>
              <Icon name="share-2" size={24} color="#777" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {articles.length > 1 && (
            <View style={styles.swipeIndicator}>
              <Icon name="chevrons-down" size={24} color="#4CAF50" />
              <Text style={styles.swipeText}>Swipe for more articles</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Language Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity 
                key={lang.code} 
                style={styles.modalItem}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={styles.modalItemText}>{lang.label}</Text>
                {i18n.language === lang.code && (
                  <Icon name="check" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  statusBanner: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#1976D2',
    fontSize: 12,
  },
  articleContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    lineHeight: 30,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  department: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  date: {
    color: '#777',
    fontSize: 14,
  },
  author: {
    color: '#777',
    fontSize: 14,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: '#E0F2E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    color: '#2e7d32',
  },
  body: {
    marginBottom: 20,
    color: '#444',
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    color: '#555',
    fontSize: 14,
  },
  likedText: {
    color: '#FF4081',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 30,
  },
  swipeText: {
    color: '#4CAF50',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default FixedNewsReader;
