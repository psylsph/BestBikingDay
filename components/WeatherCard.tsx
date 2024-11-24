import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { WeatherForecast } from '../app/services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';

interface WeatherCardProps {
  forecast: WeatherForecast;
}

export default function WeatherCard({ forecast }: WeatherCardProps) {
  const styles = useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      elevation: 5,
      backgroundColor: 'transparent',
      minHeight: 100,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 160,
      maxWidth: 200,
    },
    dateSection: {
      flex: 0.4,
      minWidth: 65,
    },
    weatherSection: {
      flex: 0.6,
      alignItems: 'flex-start',
      minWidth: 85,
    },
    centerSection: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      flex: 1,
      minWidth: 120,
      maxWidth: 160,
    },
    rightSection: {
      flex: 1,
      minWidth: 110,
      maxWidth: 160,
      justifyContent: 'center',
      gap: 8,
    },
    scoreSection: {
      alignItems: 'center',
    },
    detailsSection: {
      justifyContent: 'center',
      gap: 8,
    },
    dateContainer: {
      marginBottom: 6,
    },
    weatherInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'nowrap',
    },
    mainInfo: {
      marginBottom: 10,
    },
    date: {
      fontSize: 13,
      fontWeight: '600',
      color: '#ffffff',
      lineHeight: 17,
    },
    hours: {
      fontSize: 10,
      color: '#ffffff99',
      marginTop: 1,
    },
    icon: {
      width: 32,
      height: 32,
    },
    temp: {
      fontSize: 16,
      fontWeight: 'bold',
      marginHorizontal: 8,
      color: '#ffffff',
    },
    description: {
      fontSize: 12,
      color: '#ffffffcc',
      textTransform: 'capitalize',
      flexShrink: 1,
    },
    scoreWheel: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      borderWidth: 3,
      borderColor: '#ffffff40',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      elevation: 5,
    },
    scoreNumber: {
      color: 'white',
      fontSize: 28,
      fontWeight: 'bold',
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    },
    scoreLabel: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 1,
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    },
    scoreNotch: {
      position: 'absolute',
      top: -3,
      width: 2,
      height: 8,
      backgroundColor: 'white',
      borderRadius: 1,
    },
    bikingMessage: {
      marginTop: 5,
      paddingVertical: 3,
      borderRadius: 4,
    },
    bikingText: {
      fontSize: 11,
      color: '#ffffff',
      textAlign: 'center',
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailLabel: {
      fontSize: 11,
      color: '#ffffff99',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailText: {
      fontSize: 12,
      color: '#ffffff',
      fontWeight: '500',
    },
  }), []);

  // Function to get score colors based on the biking score
  const getScoreColors = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#388E3C'];
    if (score >= 60) return ['#8BC34A', '#689F38'];
    if (score >= 40) return ['#FFC107', '#FFA000'];
    if (score >= 20) return ['#FF9800', '#F57C00'];
    return ['#f44336', '#d32f2f'];
  };

  const colors = getScoreColors(forecast.bikingScore.score);

  return (
    <LinearGradient
      colors={[colors[0] + '20', colors[1] + '40']}
      style={styles.card}
    >
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <View style={styles.dateSection}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{forecast.date}</Text>
              <Text style={styles.hours}>{forecast.dayHours}</Text>
            </View>
          </View>
          
          <View style={styles.weatherSection}>
            <View style={styles.mainInfo}>
              <View style={styles.weatherInfo}>
                <Image
                  source={{ uri: `https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png` }}
                  style={styles.icon}
                />
                <Text style={styles.temp}>{Math.round(forecast.temp.day)}°</Text>
                <Text style={styles.description}>{forecast.weather.description}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.centerSection}>
          <LinearGradient
            colors={colors}
            style={styles.scoreWheel}
          >
            {[...Array(12)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.scoreNotch,
                  {
                    transform: [{ rotate: `${i * 30}deg` }],
                    top: -3,
                  },
                ]}
              />
            ))}
            <Text style={styles.scoreNumber}>{forecast.bikingScore.score}</Text>
            <Text style={styles.scoreLabel}>{getScoreLabel(forecast.bikingScore.score)}</Text>
          </LinearGradient>
          <View style={[styles.bikingMessage, { backgroundColor: colors[0] + '40' }]}>
            <Text style={styles.bikingText}>{forecast.bikingScore.message}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.detailsSection}>
            <View style={styles.details}>
              <Text style={styles.detailLabel}>WIND</Text>
              <Text style={styles.detailText}>{Math.round(forecast.wind_speed)} km/h</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.detailLabel}>HUMIDITY</Text>
              <Text style={styles.detailText}>{forecast.humidity}%</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.detailLabel}>RAIN</Text>
              <Text style={styles.detailText}>{Math.round(forecast.precipitation)}%</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// Function to get score label
const getScoreLabel = (score: number) => {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'MODERATE';
  if (score >= 20) return 'POOR';
  return 'BAD';
};
