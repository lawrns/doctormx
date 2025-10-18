import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';

export default function HealthCommunity() {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const tabs = [
    { id: 'feed', label: 'Feed', icon: '📰' },
    { id: 'groups', label: 'Grupos', icon: '👥' },
    { id: 'challenges', label: 'Desafíos', icon: '🏆' },
    { id: 'trending', label: 'Tendencia', icon: '🔥' }
  ];

  const categories = [
    { id: 'general', label: 'General', icon: '💊' },
    { id: 'nutrition', label: 'Nutrición', icon: '🥗' },
    { id: 'exercise', label: 'Ejercicio', icon: '🏃‍♂️' },
    { id: 'mental_health', label: 'Salud Mental', icon: '🧠' },
    { id: 'chronic_conditions', label: 'Condiciones Crónicas', icon: '🫀' },
    { id: 'prevention', label: 'Prevención', icon: '🛡️' }
  ];

  const postTypes = [
    { id: 'tip', label: 'Consejo', icon: '💡' },
    { id: 'question', label: 'Pregunta', icon: '❓' },
    { id: 'experience', label: 'Experiencia', icon: '📖' },
    { id: 'achievement', label: 'Logro', icon: '🎉' },
    { id: 'support', label: 'Apoyo', icon: '🤝' }
  ];

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setPosts([
        {
          id: 'post1',
          userId: 'user1',
          content: '¡Hoy completé mi primera semana de ejercicio regular! 💪 Me siento más energético y motivado. ¿Alguien más está empezando su rutina de ejercicio?',
          type: 'achievement',
          category: 'exercise',
          tags: ['ejercicio', 'motivación', 'rutina'],
          likes: 24,
          comments: 8,
          shares: 3,
          createdAt: '2024-01-23T10:30:00Z',
          users: { name: 'Ana García', avatar_url: null }
        },
        {
          id: 'post2',
          userId: 'user2',
          content: '¿Alguien tiene consejos para mantener una dieta saludable durante el trabajo? Siempre termino comiendo comida rápida por falta de tiempo.',
          type: 'question',
          category: 'nutrition',
          tags: ['dieta', 'trabajo', 'saludable'],
          likes: 15,
          comments: 12,
          shares: 2,
          createdAt: '2024-01-23T09:15:00Z',
          users: { name: 'Carlos López', avatar_url: null }
        },
        {
          id: 'post3',
          userId: 'user3',
          content: 'Consejo del día: Beber un vaso de agua antes de cada comida ayuda a controlar el apetito y mantenerte hidratado. ¡Pruébalo! 💧',
          type: 'tip',
          category: 'nutrition',
          tags: ['hidratación', 'consejo', 'salud'],
          likes: 32,
          comments: 5,
          shares: 8,
          createdAt: '2024-01-23T08:45:00Z',
          users: { name: 'María Rodríguez', avatar_url: null }
        }
      ]);

      setGroups([
        {
          id: 'group1',
          name: 'Ejercicio en Casa',
          description: 'Comparte rutinas de ejercicio que puedes hacer en casa',
          category: 'exercise',
          memberCount: 1250,
          isPublic: true,
          isVerified: true,
          tags: ['ejercicio', 'casa', 'rutina']
        },
        {
          id: 'group2',
          name: 'Alimentación Saludable',
          description: 'Tips y recetas para una alimentación balanceada',
          category: 'nutrition',
          memberCount: 890,
          isPublic: true,
          isVerified: true,
          tags: ['alimentación', 'recetas', 'saludable']
        },
        {
          id: 'group3',
          name: 'Salud Mental',
          description: 'Apoyo y consejos para el bienestar mental',
          category: 'mental_health',
          memberCount: 2100,
          isPublic: true,
          isVerified: true,
          tags: ['salud mental', 'bienestar', 'apoyo']
        }
      ]);

      setChallenges([
        {
          id: 'challenge1',
          name: '30 Días de Hidratación',
          description: 'Bebe 8 vasos de agua al día durante 30 días',
          category: 'hydration',
          duration: 30,
          difficulty: 'easy',
          participants: 450,
          isActive: true,
          rewards: { points: 500, badge: '💧' },
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        {
          id: 'challenge2',
          name: 'Caminar 10,000 Pasos',
          description: 'Camina 10,000 pasos diarios durante 2 semanas',
          category: 'fitness',
          duration: 14,
          difficulty: 'medium',
          participants: 320,
          isActive: true,
          rewards: { points: 750, badge: '🚶‍♂️' },
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-29T23:59:59Z'
        }
      ]);

    } catch (error) {
      console.error('Error loading community data:', error);
      toast.error('Error al cargar datos de la comunidad');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
      
      toast.success('¡Post liked!');
    } catch (error) {
      toast.error('Error al dar like');
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost = {
        id: `post${Date.now()}`,
        ...postData,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
        users: { name: 'Usuario Actual', avatar_url: null }
      };
      
      setPosts([newPost, ...posts]);
      setShowCreatePost(false);
      toast.success('Post creado exitosamente');
    } catch (error) {
      toast.error('Error al crear post');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGroups(groups.map(group => 
        group.id === groupId 
          ? { ...group, memberCount: group.memberCount + 1 }
          : group
      ));
      
      toast.success('¡Te uniste al grupo!');
    } catch (error) {
      toast.error('Error al unirse al grupo');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChallenges(challenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, participants: challenge.participants + 1 }
          : challenge
      ));
      
      toast.success('¡Te uniste al desafío!');
    } catch (error) {
      toast.error('Error al unirse al desafío');
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-MX');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Comunidad de Salud
              </h2>
              <p className="text-gray-600">
                Conecta con otros usuarios y comparte tu viaje de salud
              </p>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
            >
              Crear Post
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-medical-500 text-medical-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
                      <span className="text-medical-600 font-semibold">
                        {post.users.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{post.users.name}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{getTimeAgo(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {postTypes.find(t => t.id === post.type)?.icon} {postTypes.find(t => t.id === post.type)?.label}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {categories.find(c => c.id === post.category)?.icon} {categories.find(c => c.id === post.category)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-900">{post.content}</p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-medical-100 text-medical-700 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-medical-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-medical-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-medical-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="text-sm">{post.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Grupos Populares</h3>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Crear Grupo
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{group.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {categories.find(c => c.id === group.category)?.icon} {categories.find(c => c.id === group.category)?.label}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{group.memberCount} miembros</span>
                        </div>
                      </div>
                      {group.isVerified && (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="w-full py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                    >
                      Unirse al Grupo
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Desafíos Activos</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{challenge.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {challenge.difficulty === 'easy' ? '🟢' : challenge.difficulty === 'medium' ? '🟡' : '🔴'} {challenge.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{challenge.duration} días</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{challenge.participants} participantes</span>
                        </div>
                      </div>
                      <div className="text-2xl">{challenge.rewards.badge}</div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{challenge.rewards.points} puntos</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-medical-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="w-full py-2 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors"
                    >
                      Unirse al Desafío
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendencias</h3>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{category.label}</h4>
                          <p className="text-sm text-gray-600">Posts populares en esta categoría</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-medical-600">+15%</div>
                        <div className="text-sm text-gray-500">esta semana</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
