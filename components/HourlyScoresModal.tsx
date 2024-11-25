import React from 'react';
import { StyleSheet, View, Text, Modal, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HourlyScore {
  time: string;
  score: number;
  message: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

interface HourlyScoresModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
  hourlyScores: HourlyScore[];
}

export default function HourlyScoresModal({ visible, onClose, date, hourlyScores }: HourlyScoresModalProps) {
  const getScoreColors = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#388E3C'];
    if (score >= 60) return ['#8BC34A', '#689F38'];
    if (score >= 40) return ['#FFC107', '#FFA000'];
    if (score >= 20) return ['#FF9800', '#F57C00'];
    return ['#f44336', '#d32f2f'];
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <LinearGradient
            colors={['#0d1b2a', '#1b263b']}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>Hourly Forecast</Text>
              <Text style={styles.dateText}>{date}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView}>
              {hourlyScores.map((score, index) => (
                <View key={index} style={styles.hourlyItem}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{score.time}</Text>
                  </View>
                  <LinearGradient
                    colors={getScoreColors(score.score)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scoreContainer}
                  >
                    <Text style={styles.scoreText}>{score.score}</Text>
                  </LinearGradient>
                  <View style={styles.detailsContainer}>
                    <Text style={styles.messageText}>{score.message}</Text>
                    <View style={styles.weatherDetails}>
                      <Text style={styles.detailText}>🌡️ {score.temperature}°C</Text>
                      <Text style={styles.detailText}>💨 {score.windSpeed} km/h</Text>
                      <Text style={styles.detailText}>🌧️ {score.precipitation}%</Text>
                    </View>
                    <Text style={styles.descriptionText}>{score.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1b263b',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff99',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 24,
  },
  scrollView: {
    padding: 16,
  },
  hourlyItem: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  scoreContainer: {
    padding: 8,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailsContainer: {
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#ffffff99',
  },
  descriptionText: {
    fontSize: 14,
    color: '#ffffff99',
    fontStyle: 'italic',
  },
});
