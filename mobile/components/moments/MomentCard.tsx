import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Bookmark, Eye } from 'lucide-react-native';
import type { Moment } from '../../../shared/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

function scoreBadgeColor(score: number): string {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-lime-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatViewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

interface MomentCardProps {
  moment: Moment;
  onToggleSave?: (id: string, saved: boolean) => void;
}

export default function MomentCard({ moment, onToggleSave }: MomentCardProps) {
  return (
    <Pressable
      className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
      style={{ width: CARD_WIDTH }}
      onPress={() => router.push(`/moments/${moment.id}`)}
    >
      {/* Image with overlays */}
      <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * (4 / 3) }}>
        {moment.imageUrl ? (
          <Image
            source={{ uri: moment.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 bg-gray-200 dark:bg-gray-700 items-center justify-center">
            <Text className="text-gray-400 dark:text-gray-500 text-xs">No image</Text>
          </View>
        )}

        {/* Save button - top left */}
        <Pressable
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/40 items-center justify-center"
          onPress={() => onToggleSave?.(moment.id, moment.isSaved)}
          hitSlop={8}
        >
          <Bookmark
            size={16}
            color="#FFFFFF"
            fill={moment.isSaved ? '#FFFFFF' : 'none'}
          />
        </Pressable>

        {/* Score badge - top right */}
        {moment.compositeScore != null && (
          <View
            className={`absolute top-2 right-2 ${scoreBadgeColor(moment.compositeScore)} rounded-full w-8 h-8 items-center justify-center`}
          >
            <Text className="text-white text-xs font-bold">
              {moment.compositeScore.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Bottom overlay - user + place */}
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6">
          <View className="flex-row items-center">
            {moment.user.avatarUrl ? (
              <Image
                source={{ uri: moment.user.avatarUrl }}
                className="w-5 h-5 rounded-full bg-gray-300"
                contentFit="cover"
              />
            ) : (
              <View className="w-5 h-5 rounded-full bg-purple-400 items-center justify-center">
                <Text className="text-white text-[8px] font-bold">
                  {(moment.user.name || '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <Text className="text-white text-xs font-medium ml-1.5" numberOfLines={1}>
              {moment.user.name || moment.user.username}
            </Text>
          </View>
          {moment.place && (
            <Text className="text-white/80 text-[10px] mt-0.5 ml-0.5" numberOfLines={1}>
              {moment.place.name}
            </Text>
          )}
        </View>
      </View>

      {/* View count footer */}
      <View className="flex-row items-center px-2.5 py-2">
        <Eye size={12} color="#9CA3AF" />
        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
          {formatViewCount(moment.viewCount)}
        </Text>
      </View>
    </Pressable>
  );
}
