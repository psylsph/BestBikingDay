import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, Platform } from 'react-native';
import { WeatherForecast } from '../app/services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';

interface WeatherCardProps {
  forecast: WeatherForecast;
}

export default function WeatherCard({ forecast }: WeatherCardProps) {
  const [isMobile, setIsMobile] = useState(
    Platform.OS === 'ios' || Platform.OS === 'android' || Dimensions.get('window').width < 768
  );

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(
        Platform.OS === 'ios' || Platform.OS === 'android' || Dimensions.get('window').width < 768
      );
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription.remove();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: isMobile ? 10 : 12,
      padding: isMobile ? 8 : 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      backgroundColor: 'transparent',
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: isMobile ? 8 : 10,
    },
    leftSection: {
      flex: 3,
    },
    rightSection: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? 6 : 8,
    },
    dateContainer: {
      flex: 1,
    },
    date: {
      fontSize: isMobile ? 12 : 14,
      fontWeight: '600',
      color: '#ffffff',
      lineHeight: isMobile ? 16 : 18,
    },
    hours: {
      fontSize: isMobile ? 10 : 11,
      color: '#ffffff99',
      marginTop: 1,
    },
    weatherInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      width: isMobile ? 32 : 36,
      height: isMobile ? 32 : 36,
    },
    temp: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: 'bold',
      marginHorizontal: isMobile ? 6 : 8,
      color: '#ffffff',
    },
    description: {
      fontSize: isMobile ? 12 : 13,
      color: '#ffffffcc',
      textTransform: 'capitalize',
    },
    scoreWheel: {
      width: isMobile ? 80 : 90,
      height: isMobile ? 80 : 90,
      borderRadius: isMobile ? 40 : 45,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      borderWidth: 3,
      borderColor: '#ffffff40',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scoreNumber: {
      color: 'white',
      fontSize: isMobile ? 24 : 28,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    scoreLabel: {
      color: 'white',
      fontSize: isMobile ? 8 : 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    scoreNotch: {
      position: 'absolute',
      top: -2,
      width: 2,
      height: 8,
      backgroundColor: 'white',
      borderRadius: 1,
    },
    bikingMessage: {
      marginTop: isMobile ? 4 : 5,
      paddingVertical: isMobile ? 2 : 3,
      borderRadius: 4,
    },
    bikingText: {
      fontSize: isMobile ? 10 : 11,
      color: '#ffffff',
      textAlign: 'center',
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isMobile ? 6 : 8,
    },
    details: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: isMobile ? 9 : 10,
      color: '#ffffff99',
      marginBottom: 1,
    },
    detailText: {
      fontSize: isMobile ? 10 : 11,
      color: '#ffffff',
      fontWeight: '500',
    },
  }), [isMobile]);

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
      colors={[colors[0] + '20', colors[1] + '40']} // Using hex alpha for transparency
      style={styles.card}
    >
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <View style={styles.mainInfo}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{forecast.date}</Text>
              <Text style={styles.hours}>{forecast.dayHours}</Text>
            </View>
            <View style={styles.weatherInfo}>
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png` }}
                style={styles.icon}
              />
              <Text style={styles.temp}>{Math.round(forecast.temp.day)}°</Text>
              <Text style={styles.description}>{forecast.weather.description}</Text>
            </View>
          </View>

          <View style={styles.bikingMessage}>
            <Text style={styles.bikingText}>{forecast.bikingScore.message}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.details}>
              <Text style={styles.detailLabel}>Min/Max</Text>
              <Text style={styles.detailText}>{Math.round(forecast.temp.min)}° / {Math.round(forecast.temp.max)}°</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailText}>{Math.round(forecast.wind_speed)} m/s</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.detailLabel}>Rain/Snow</Text>
              <Text style={styles.detailText}>{forecast.precipitation.toFixed(1)} mm</Text>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <LinearGradient
            colors={colors}
            style={styles.scoreWheel}
          >
            <Text style={styles.scoreNumber}>{forecast.bikingScore.score}</Text>
            <Text style={styles.scoreLabel}>{getScoreLabel(forecast.bikingScore.score)}</Text>
            <View style={styles.scoreNotch} />
          </LinearGradient>
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
