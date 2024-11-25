import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherForecast } from '../app/services/weatherService';
import HourlyScoresModal from './HourlyScoresModal';

interface WeatherCardProps {
  forecast: WeatherForecast;
}

export default function WeatherCard({ forecast }: WeatherCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const getScoreColors = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#388E3C'];
    if (score >= 60) return ['#8BC34A', '#689F38'];
    if (score >= 40) return ['#FFC107', '#FFA000'];
    if (score >= 20) return ['#FF9800', '#F57C00'];
    return ['#f44336', '#d32f2f'];
  };

  const getWindIcons = (speed: number) => {
    // Scale: 0-10: 1, 11-20: 2, 21-30: 3, 31-40: 4, 40+: 5
    const count = Math.min(5, Math.max(1, Math.ceil(speed / 10)));
    return '💨'.repeat(count);
  };

  const getUVIDescription = (uvi: number) => {
    if (uvi <= 2) return 'Low';
    if (uvi <= 5) return 'Moderate';
    if (uvi <= 7) return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
  };

  const getUVIColor = (uvi: number) => {
    if (uvi <= 2) return '#4CAF50';  // Green
    if (uvi <= 5) return '#FFC107';  // Yellow
    if (uvi <= 7) return '#FF9800';  // Orange
    if (uvi <= 10) return '#F44336'; // Red
    return '#9C27B0';  // Purple
  };

  const getRainIcons = (precipitation: number) => {
    // Scale: 0-20: 1, 21-40: 2, 41-60: 3, 61-80: 4, 81-100: 5
    const count = Math.min(5, Math.max(1, Math.ceil(precipitation / 20)));
    return '🌧️'.repeat(count);
  };

  const colors = getScoreColors(forecast.bikingScore.score);

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      padding: 16,
      elevation: 3,
      boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flex: 1,
      maxWidth: '40%',
    },
    mainInfo: {
      gap: 8,
    },
    dateContainer: {
      marginBottom: 4,
    },
    date: {
      fontSize: 13,
      fontWeight: '600',
      color: '#ffffff',
    },
    sunTimes: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    sunIcon: {
      fontSize: 14,
    },
    sunTime: {
      fontSize: 12,
      color: '#ffffff99',
      marginRight: 8,
    },
    weatherInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    icon: {
      width: 32,
      height: 32,
    },
    temp: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    description: {
      fontSize: 12,
      color: '#ffffffcc',
      textTransform: 'capitalize',
    },
    scoreSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreWheel: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#ffffff40',
    },
    scoreNumber: {
      color: 'white',
      fontSize: 32,
      fontWeight: 'bold',
    },
    scoreLabel: {
      color: 'white',
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 2,
    },
    detailsSection: {
      flex: 1,
      maxWidth: '30%',
      gap: 8,
      alignItems: 'flex-end',
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    detailIcon: {
      fontSize: 16,
      color: '#ffffff99',
    },
    weatherIcons: {
      fontSize: 16,
      letterSpacing: -2,
    },
    detailText: {
      fontSize: 13,
      color: '#ffffff',
      fontWeight: '500',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
  });

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <LinearGradient
          colors={['#0d1b2a', '#1b263b']}
          style={styles.card}
        >
          <View style={styles.contentContainer}>
            <View style={styles.leftSection}>
              <View style={styles.mainInfo}>
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>{forecast.date}</Text>
                  <View style={styles.sunTimes}>
                    <Text style={styles.sunIcon}>🌅</Text>
                    <Text style={styles.sunTime}>{forecast.sunrise}</Text>
                    <Text style={styles.sunIcon}>🌇</Text>
                    <Text style={styles.sunTime}>{forecast.sunset}</Text>
                  </View>
                </View>
                <View style={styles.weatherInfo}>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png` }}
                    style={styles.icon}
                  />
                  <Text style={styles.temp}>{Math.round(forecast.temp.day)}°</Text>
                </View>
                <Text style={styles.description}>{forecast.weather.description}</Text>
              </View>
            </View>

            <View style={styles.scoreSection}>
              <LinearGradient
                colors={colors}
                style={styles.scoreWheel}
              >
                <Text style={styles.scoreNumber}>{forecast.bikingScore.score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </LinearGradient>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
              <Text style={styles.detailText}>
                  {Math.round(forecast.wind_speed)} m/s
                </Text>
                <Text style={styles.detailIcon}>💨</Text>
              </View>
              <View style={styles.detailRow}>
              <Text style={[styles.detailText, { color: getUVIColor(forecast.uvi) }]}>
                  UV {getUVIDescription(forecast.uvi)}
                </Text>
                <Text style={styles.detailIcon}>☀️</Text>
              </View>
              {forecast.precipitation > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    {Math.round(forecast.precipitation)}%
                  </Text>
                  <Text style={styles.detailIcon}>🌧️</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <HourlyScoresModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        date={forecast.date}
        hourlyScores={forecast.hourlyForecasts}
      />
    </>
  );
}
