// Utility functions for generating placeholder images and managing image URLs

export const generatePlaceholderImage = (
  width: number = 400,
  height: number = 300,
  text: string = 'Image',
  bgColor: string = '4ade80', // emerald-400
  textColor: string = 'ffffff' // white
): string => {
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

export const getHeroImage = (): string => {
  return generatePlaceholderImage(800, 600, 'Modern Workspace', '10b981', 'ffffff');
};

export const getFreelancerAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return generatePlaceholderImage(200, 200, initials, '06b6d4', 'ffffff');
};

export const getPortfolioImage = (index: number): string => {
  const colors = ['10b981', '06b6d4', '3b82f6', '8b5cf6', 'f59e0b'];
  const color = colors[index % colors.length];
  return generatePlaceholderImage(400, 300, `Portfolio ${index + 1}`, color, 'ffffff');
};

export const getServiceIcon = (service: string): string => {
  const serviceIcons: { [key: string]: string } = {
    'Web Development': '💻',
    'Mobile Development': '📱',
    'UI/UX Design': '🎨',
    'Graphic Design': '🖼️',
    'Content Writing': '✍️',
    'Digital Marketing': '📈',
    'SEO': '🔍',
    'Video Editing': '🎬',
    'Photography': '📸',
    'Branding': '🏷️',
    'Consulting': '💡',
    'Other': '⚡'
  };
  
  return serviceIcons[service] || '⚡';
};

export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Web Development': 'from-emerald-500 to-cyan-500',
    'Mobile Development': 'from-cyan-500 to-blue-500',
    'UI/UX Design': 'from-blue-500 to-indigo-500',
    'Graphic Design': 'from-indigo-500 to-purple-500',
    'Content Writing': 'from-purple-500 to-pink-500',
    'Digital Marketing': 'from-pink-500 to-rose-500',
    'SEO': 'from-rose-500 to-red-500',
    'Video Editing': 'from-red-500 to-orange-500',
    'Photography': 'from-orange-500 to-yellow-500',
    'Branding': 'from-yellow-500 to-lime-500',
    'Consulting': 'from-lime-500 to-green-500',
    'Other': 'from-gray-500 to-slate-500'
  };
  
  return colors[category] || 'from-gray-500 to-slate-500';
};

export const getRandomGradient = (): string => {
  const gradients = [
    'from-emerald-500 to-cyan-500',
    'from-cyan-500 to-blue-500',
    'from-blue-500 to-indigo-500',
    'from-indigo-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500'
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
};
