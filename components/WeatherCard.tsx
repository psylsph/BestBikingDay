import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherForecast } from '../app/services/weatherService';

interface WeatherCardProps {
  forecast: WeatherForecast;
}

export default function WeatherCard({ forecast }: WeatherCardProps) {
  const getScoreColors = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#388E3C'];
    if (score >= 60) return ['#8BC34A', '#689F38'];
    if (score >= 40) return ['#FFC107', '#FFA000'];
    if (score >= 20) return ['#FF9800', '#F57C00'];
    return ['#f44336', '#d32f2f'];
  };

  const colors = getScoreColors(forecast.bikingScore.score);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#2d2d2d',
      borderRadius: 12,
      padding: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
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
    hours: {
      fontSize: 10,
      color: '#ffffff99',
    },
    weatherInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      width: 32,
      height: 32,
    },
    temp: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      marginLeft: 4,
    },
    description: {
      fontSize: 12,
      color: '#ffffffcc',
      textTransform: 'capitalize',
    },
    detailsSection: {
      alignItems: 'flex-end',
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailLabel: {
      fontSize: 11,
      color: '#ffffff99',
    },
    detailText: {
      fontSize: 12,
      color: '#ffffff',
      fontWeight: '500',
    },
    scoreSection: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    scoreWheel: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#ffffff40',
    },
    scoreNumber: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    scoreLabel: {
      color: 'white',
      fontSize: 9,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <LinearGradient
      colors={[colors[0] + '20', colors[1] + '40']}
      style={styles.card}
    >
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <View>
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
          <View style={styles.details}>
            <Text style={styles.detailLabel}>Wind: </Text>
            <Text style={styles.detailText}>{Math.round(forecast.wind_speed)} km/h</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.detailLabel}>Humidity: </Text>
            <Text style={styles.detailText}>{forecast.humidity}%</Text>
          </View>
          {forecast.precipitation > 0 && (
            <View style={styles.details}>
              <Text style={styles.detailLabel}>Rain: </Text>
              <Text style={styles.detailText}>{Math.round(forecast.precipitation)}%</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
