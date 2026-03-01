import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface UserAvatarProps {
  avatarUrl: string | null;
  name: string | null;
  size?: number;
  fontSize?: string;
}

export default function UserAvatar({ avatarUrl, name, size = 40, fontSize = 'text-sm' }: UserAvatarProps) {
  const sizeClass = `w-[${size}px] h-[${size}px]`;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-gray-200"
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-purple-100 dark:bg-purple-900 items-center justify-center"
    >
      <Text className={`text-purple-600 dark:text-purple-300 font-bold ${fontSize}`}>
        {(name || '?')[0].toUpperCase()}
      </Text>
    </View>
  );
}
