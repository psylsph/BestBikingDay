import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { WeatherForecast } from '../app/services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';

interface WeatherCardProps {
  forecast: WeatherForecast;
}

export default function WeatherCard({ forecast }: WeatherCardProps) {
  // Function to get score colors based on the biking score
  const getScoreColors = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#388E3C'];
    if (score >= 60) return ['#8BC34A', '#689F38'];
    if (score >= 40) return ['#FFC107', '#FFA000'];
    if (score >= 20) return ['#FF9800', '#F57C00'];
    return ['#F44336', '#D32F2F'];
  };

  // Function to get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'MODERATE';
    if (score >= 20) return 'POOR';
    return 'BAD';
  };

  const colors = getScoreColors(forecast.bikingScore.score);

  return (
    <LinearGradient
      colors={[colors[0] + '20', colors[1] + '40']} // Using hex alpha for transparency
      style={styles.card}
    >
      <View style={styles.mainInfo}>
        <View style={styles.dateContainer}>
          <View>
            <Text style={styles.date}>{forecast.date}</Text>
            <Text style={styles.hours}>{forecast.dayHours}</Text>
          </View>
        </View>
        <View style={styles.weatherInfo}>
          <Image
            style={styles.icon}
            source={{
              uri: `https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png`,
            }}
          />
          <Text style={styles.temp}>{Math.round(forecast.temp.day)}°</Text>
          <Text style={styles.description}>{forecast.weather.description}</Text>
        </View>
      </View>

      <View style={styles.scoreSection}>
        <LinearGradient
          colors={colors}
          style={styles.scoreWheel}
        >
          <Text style={styles.scoreNumber}>{forecast.bikingScore.score}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(forecast.bikingScore.score)}</Text>
          <View style={styles.scoreNotch} />
        </LinearGradient>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 15,
    marginVertical: 8,
    padding: 15,
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
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 20,
  },
  hours: {
    fontSize: 12,
    color: '#ffffff99',
    marginTop: 2,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: 15,
  },
  scoreWheel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 4,
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
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scoreLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scoreNotch: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  weatherInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    width: 50,
    height: 50,
  },
  temp: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#ffffff',
  },
  description: {
    fontSize: 16,
    color: '#ffffffcc',
    textTransform: 'capitalize',
  },
  bikingMessage: {
    marginVertical: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bikingText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ffffff20',
    paddingTop: 10,
    marginTop: 4,
  },
  details: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#ffffff99',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});
