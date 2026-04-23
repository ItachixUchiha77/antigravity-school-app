import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  Modal, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, useQAStore, useSubjectStore } from '../../src/store/index.js';
import { USERS } from '../../src/data/mockData.js';

function Avatar({ userId, size = 8 }) {
  const user = USERS[userId];
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626'];
  const color  = colors[userId?.charCodeAt(0) % colors.length] || '#2563EB';
  return (
    <View
      style={{ width: size * 4, height: size * 4, backgroundColor: color, borderRadius: 999 }}
      className="items-center justify-center"
    >
      <Text style={{ color: '#fff', fontSize: size * 1.8, fontWeight: 'bold' }}>
        {user?.initials?.[0] ?? '?'}
      </Text>
    </View>
  );
}

function QuestionCard({ q, currentUser, subjects, onUpvote, onAnswer }) {
  const subject  = subjects.find((s) => s.id === q.subjectId);
  const answerer = q.answeredBy ? USERS[q.answeredBy] : null;
  const voted    = q.upvotedBy?.includes(currentUser?.id);

  return (
    <View className="bg-bg-elevated border border-border-default rounded-2xl p-4 mb-3">
      {/* Subject tag */}
      {subject && (
        <View className="flex-row items-center gap-1 mb-2">
          <Text className="text-xs">{subject.emoji}</Text>
          <Text className="text-xs text-text-muted font-medium">{subject.name}</Text>
        </View>
      )}

      {/* Question */}
      <View className="flex-row items-start gap-2 mb-3">
        <View className="w-7 h-7 bg-accent-purple/20 rounded-full items-center justify-center">
          <Text className="text-[10px] text-accent-purple-light font-bold">A</Text>
        </View>
        <Text className="text-text-primary text-sm flex-1 leading-5">{q.text}</Text>
      </View>

      {/* Answer */}
      {q.answered && q.answer && (
        <View className="bg-success/5 border border-success/20 rounded-xl p-3 mb-3">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Text className="text-success text-xs font-semibold">✓ {answerer?.name ?? 'Teacher'}</Text>
          </View>
          <Text className="text-text-secondary text-sm leading-5">{q.answer}</Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => onUpvote(q.id)}
          className={`flex-row items-center gap-1 px-3 py-1.5 rounded-lg ${voted ? 'bg-accent-blue/20' : 'bg-bg-card'}`}
        >
          <Text className="text-sm">👍</Text>
          <Text className={`text-xs font-semibold ${voted ? 'text-accent-blue-light' : 'text-text-muted'}`}>
            {q.upvotes}
          </Text>
        </TouchableOpacity>

        {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && !q.answered && (
          <TouchableOpacity
            onPress={() => onAnswer(q)}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-card"
          >
            <Text className="text-xs text-accent-blue-light font-medium">Answer</Text>
          </TouchableOpacity>
        )}

        {q.answered && (
          <View className="px-2 py-1 bg-success/15 rounded-full">
            <Text className="text-success text-[10px] font-semibold">Answered</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function QnAScreen() {
  const { currentUser }                   = useAuthStore();
  const { questions, loading, fetchQuestions, askQuestion, upvote, answerQuestion } = useQAStore();
  const { subjects, fetchSubjects }       = useSubjectStore();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [askModal, setAskModal]               = useState(false);
  const [answerModal, setAnswerModal]         = useState(null);
  const [questionText, setQuestionText]       = useState('');
  const [answerText, setAnswerText]           = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [search, setSearch]                   = useState('');

  const classId = currentUser?.classId || 'cls-10a';

  useEffect(() => {
    fetchQuestions(classId);
    fetchSubjects();
  }, []);

  const filtered = questions
    .filter((q) => !selectedSubject || q.subjectId === selectedSubject)
    .filter((q) => !search || q.text.toLowerCase().includes(search.toLowerCase()));

  async function handleAsk() {
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await askQuestion(classId, selectedSubject || subjects[0]?.id, questionText.trim());
      setQuestionText(''); setAskModal(false);
    } catch (e) { Alert.alert('Error', e.message); }
    setSubmitting(false);
  }

  async function handleAnswer() {
    if (!answerText.trim() || !answerModal) return;
    setSubmitting(true);
    try {
      await answerQuestion(answerModal.id, answerText.trim());
      setAnswerText(''); setAnswerModal(null);
    } catch (e) { Alert.alert('Error', e.message); }
    setSubmitting(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['bottom']}>
      {/* Search */}
      <View className="px-4 pt-3 pb-2">
        <View className="bg-bg-elevated border border-border-default rounded-xl px-3 py-2 flex-row items-center gap-2">
          <Text className="text-text-muted text-base">🔍</Text>
          <TextInput
            className="flex-1 text-text-primary text-sm"
            placeholder="Search questions…"
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Subject filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2" style={{ flexGrow: 0 }}>
        <TouchableOpacity
          onPress={() => setSelectedSubject(null)}
          className={`mr-2 px-3 py-1.5 rounded-full border ${!selectedSubject ? 'bg-accent-blue border-accent-blue' : 'border-border-default bg-bg-elevated'}`}
        >
          <Text className={`text-xs font-medium ${!selectedSubject ? 'text-white' : 'text-text-muted'}`}>All</Text>
        </TouchableOpacity>
        {subjects.map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
            className={`mr-2 px-3 py-1.5 rounded-full border flex-row items-center gap-1 ${selectedSubject === s.id ? 'bg-accent-blue border-accent-blue' : 'border-border-default bg-bg-elevated'}`}
          >
            <Text className="text-xs">{s.emoji}</Text>
            <Text className={`text-xs font-medium ${selectedSubject === s.id ? 'text-white' : 'text-text-muted'}`}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading
        ? <ActivityIndicator color="#3B82F6" className="mt-10" />
        : (
          <FlatList
            data={filtered}
            keyExtractor={(q) => q.id}
            contentContainerStyle={{ padding: 16, paddingTop: 4 }}
            renderItem={({ item }) => (
              <QuestionCard
                q={item}
                currentUser={currentUser}
                subjects={subjects}
                onUpvote={upvote}
                onAnswer={setAnswerModal}
              />
            )}
            ListEmptyComponent={
              <View className="items-center mt-16">
                <Text className="text-4xl mb-3">🙋</Text>
                <Text className="text-text-muted text-sm">No questions yet. Be the first!</Text>
              </View>
            }
          />
        )
      }

      {/* Ask button (students only) */}
      {currentUser?.role === 'student' && (
        <TouchableOpacity
          onPress={() => setAskModal(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-accent-blue rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-2xl font-light">+</Text>
        </TouchableOpacity>
      )}

      {/* Ask modal */}
      <Modal visible={askModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-bg-primary px-5 pt-6">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-text-primary text-lg font-bold">Ask Anonymously</Text>
            <TouchableOpacity onPress={() => setAskModal(false)}>
              <Text className="text-text-muted text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-text-muted text-xs mb-2">Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" style={{ flexGrow: 0 }}>
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSubject(s.id)}
                className={`mr-2 px-3 py-2 rounded-xl border flex-row items-center gap-1 ${selectedSubject === s.id ? 'bg-accent-blue border-accent-blue' : 'border-border-default bg-bg-elevated'}`}
              >
                <Text>{s.emoji}</Text>
                <Text className={`text-sm ${selectedSubject === s.id ? 'text-white' : 'text-text-secondary'}`}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-text-muted text-xs mb-2">Your question</Text>
          <TextInput
            className="bg-bg-elevated border border-border-default text-text-primary rounded-xl px-4 py-4 text-sm"
            placeholder="What do you want to ask? Your name will not be shown."
            placeholderTextColor="#64748B"
            value={questionText}
            onChangeText={setQuestionText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleAsk}
            disabled={submitting || !questionText.trim()}
            className="bg-accent-blue rounded-xl py-4 items-center mt-4"
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold">Post Question</Text>
            }
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Answer modal */}
      <Modal visible={!!answerModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-bg-primary px-5 pt-6">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-text-primary text-lg font-bold">Answer Question</Text>
            <TouchableOpacity onPress={() => setAnswerModal(null)}>
              <Text className="text-text-muted text-lg">✕</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-bg-elevated rounded-xl p-4 mb-4">
            <Text className="text-text-secondary text-sm">{answerModal?.text}</Text>
          </View>
          <TextInput
            className="bg-bg-elevated border border-border-default text-text-primary rounded-xl px-4 py-4 text-sm"
            placeholder="Write your answer…"
            placeholderTextColor="#64748B"
            value={answerText}
            onChangeText={setAnswerText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleAnswer}
            disabled={submitting || !answerText.trim()}
            className="bg-success rounded-xl py-4 items-center mt-4"
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold">Post Answer</Text>
            }
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
