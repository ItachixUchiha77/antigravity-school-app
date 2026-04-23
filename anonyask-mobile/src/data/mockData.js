export const CLASSES = [
  { id: 'cls-10a', name: 'Class 10A', grade: 10, section: 'A', studentCount: 34 },
  { id: 'cls-10b', name: 'Class 10B', grade: 10, section: 'B', studentCount: 32 },
  { id: 'cls-9a',  name: 'Class 9A',  grade: 9,  section: 'A', studentCount: 36 },
  { id: 'cls-11a', name: 'Class 11A', grade: 11, section: 'A', studentCount: 28 },
];

export const SUBJECTS = [
  { id: 'math',     name: 'Mathematics',     emoji: '📐', color: '#3B82F6' },
  { id: 'science',  name: 'Science',         emoji: '🔬', color: '#22C55E' },
  { id: 'english',  name: 'English',         emoji: '📖', color: '#F59E0B' },
  { id: 'history',  name: 'History',         emoji: '🏛️', color: '#A855F7' },
  { id: 'computer', name: 'Computer Science', emoji: '💻', color: '#EC4899' },
  { id: 'hindi',    name: 'Hindi',           emoji: '🗣️', color: '#14B8A6' },
];

export const USERS = {
  's-001': { id: 's-001', name: 'Rahul Kumar',    role: 'student', classId: 'cls-10a', initials: 'RK' },
  's-002': { id: 's-002', name: 'Aisha Sharma',   role: 'student', classId: 'cls-10a', initials: 'AS' },
  's-003': { id: 's-003', name: 'Rohan Verma',    role: 'student', classId: 'cls-10a', initials: 'RV' },
  's-004': { id: 's-004', name: 'Priya Singh',    role: 'student', classId: 'cls-10a', initials: 'PS' },
  's-005': { id: 's-005', name: 'Arjun Mehta',    role: 'student', classId: 'cls-10b', initials: 'AM' },
  't-001': { id: 't-001', name: 'Mr. Kapoor',     role: 'teacher', subjects: ['math'],     initials: 'MK' },
  't-002': { id: 't-002', name: 'Ms. Sharma',     role: 'teacher', subjects: ['science'],  initials: 'SS' },
  't-003': { id: 't-003', name: 'Mr. Patel',      role: 'teacher', subjects: ['english'],  initials: 'MP' },
  't-004': { id: 't-004', name: 'Ms. Gupta',      role: 'teacher', subjects: ['history'],  initials: 'MG' },
  't-005': { id: 't-005', name: 'Mr. Khan',       role: 'teacher', subjects: ['computer'], initials: 'MKh' },
  'a-001': { id: 'a-001', name: 'Principal Nair', role: 'admin',   initials: 'PN' },
};

export const DEMO_ACCOUNTS = [
  { role: 'student', userId: 's-001', label: 'Student (Rahul)',  email: 'rahul@school.com',     password: 'password' },
  { role: 'teacher', userId: 't-001', label: 'Teacher (Kapoor)', email: 'kapoor@school.com',    password: 'password' },
  { role: 'admin',   userId: 'a-001', label: 'Admin (Principal)',email: 'principal@school.com', password: 'password' },
];

export const QUESTIONS = [
  {
    id: 'q-001', classId: 'cls-10a', subjectId: 'math', askedBy: 's-001',
    text: "Ma'am, I still don't understand when to use sin vs cos in a right triangle. Can you explain again?",
    upvotes: 14, upvotedBy: ['s-002', 's-003', 's-004'],
    answered: true,
    answer: "Great question! Remember SOH-CAH-TOA:\n• Sin = Opposite / Hypotenuse\n• Cos = Adjacent / Hypotenuse\n• Tan = Opposite / Adjacent",
    answeredBy: 't-001', answeredAt: '2026-04-12T08:30:00Z', createdAt: '2026-04-11T14:20:00Z',
  },
  {
    id: 'q-002', classId: 'cls-10a', subjectId: 'math', askedBy: 's-002',
    text: 'What is the difference between permutation and combination? I keep getting confused.',
    upvotes: 9, upvotedBy: ['s-002', 's-004'],
    answered: false, answer: null, answeredBy: null, answeredAt: null,
    createdAt: '2026-04-12T07:10:00Z',
  },
  {
    id: 'q-003', classId: 'cls-10a', subjectId: 'science', askedBy: 's-003',
    text: "In Ohm's law, if we increase resistance and keep voltage constant, current decreases. But how does the circuit 'know' to decrease current?",
    upvotes: 17, upvotedBy: ['s-002', 's-003'],
    answered: false, answer: null, answeredBy: null, answeredAt: null,
    createdAt: '2026-04-12T10:15:00Z',
  },
  {
    id: 'q-004', classId: 'cls-10a', subjectId: 'science', askedBy: 's-002',
    text: 'What exactly happens during the S phase of mitosis? Is DNA replication same as chromosome duplication?',
    upvotes: 11, upvotedBy: ['s-002', 's-003', 's-004'],
    answered: true,
    answer: 'During the S phase:\n1. DNA replicates\n2. Sister chromatids form\n3. They separate during M phase\n\nSo DNA replication → sister chromatid formation → chromosome duplication.',
    answeredBy: 't-002', answeredAt: '2026-04-11T15:00:00Z', createdAt: '2026-04-11T12:30:00Z',
  },
];

export const ANNOUNCEMENTS = [
  {
    id: 'ann-001', classId: null,
    title: '📅 Annual Sports Day — Registration Open!',
    content: 'Registrations for Annual Sports Day 2026 are now open! The event will be held on April 25th on the school grounds.\n\nAll students must register with their class teacher by April 18th.',
    priority: 'important', postedBy: 'a-001', createdAt: '2026-04-12T09:00:00Z', pinned: true,
  },
  {
    id: 'ann-002', classId: 'cls-10a',
    title: '📝 Class 10A — Mathematics Unit Test',
    content: 'The Mathematics Unit Test for Trigonometry and Statistics will be held on April 16th during the 2nd period.\n\nPlease bring your geometry box and scientific calculator.',
    priority: 'urgent', postedBy: 't-001', createdAt: '2026-04-11T16:00:00Z', pinned: false,
  },
  {
    id: 'ann-003', classId: null,
    title: '🏖️ Summer Vacation Notice',
    content: 'School will remain closed for Summer Vacation from May 5th to June 15th, 2026.\n\nNew academic session begins June 16th.',
    priority: 'general', postedBy: 'a-001', createdAt: '2026-04-10T10:00:00Z', pinned: false,
  },
];

export const PRIVATE_MESSAGES = {
  'conv-s001-t001': {
    participants: ['s-001', 't-001'],
    messages: [],
  },
};

export const GROUP_MESSAGES = {
  'cls-10a': [],
};

export const NOTIFICATIONS = [
  { id: 'n-001', userId: 's-001', type: 'answer',       text: 'Mr. Kapoor answered your question in Mathematics', subjectId: 'math',    createdAt: '2026-04-12T08:32:00Z', read: false },
  { id: 'n-002', userId: 's-001', type: 'announcement', text: 'New urgent announcement: Mathematics Unit Test',    classId: 'cls-10a',   createdAt: '2026-04-11T16:01:00Z', read: false },
  { id: 'n-006', userId: 't-001', type: 'message',      text: 'Rahul Kumar sent you a private message',           convId: 'conv-s001-t001', createdAt: '2026-04-11T18:17:00Z', read: false },
  { id: 'n-011', userId: 'a-001', type: 'announcement', text: 'Your announcement was posted school-wide',          createdAt: '2026-04-12T09:00:00Z', read: false },
];

export const POLLS = [
  {
    id: 'poll-001', classId: 'cls-10a', subjectId: 'math', createdBy: 't-001',
    question: 'Which topic do you find most challenging this semester?',
    options: [
      { id: 'o1', text: 'Trigonometry',        votes: ['s-002', 's-003'] },
      { id: 'o2', text: 'Statistics',           votes: ['s-004'] },
      { id: 'o3', text: 'Probability',          votes: [] },
      { id: 'o4', text: 'Coordinate Geometry', votes: ['s-001'] },
    ],
    createdAt: '2026-04-12T09:30:00Z',
  },
];

export const QUIZZES = [
  {
    id: 'quiz-001', classId: 'cls-10a', subjectId: 'math', createdBy: 't-001',
    title: 'Trigonometry Quick Check',
    questions: [
      { id: 'qs-1', text: 'What is sin(90°)?',      options: ['0', '1', '−1', '1/√2'], correctIndex: 1 },
      { id: 'qs-2', text: 'sin²θ + cos²θ = ?',      options: ['0', '2', '1', 'tan θ'], correctIndex: 2 },
      { id: 'qs-3', text: 'What is tan(45°)?',       options: ['0', '√3', '1/√3', '1'], correctIndex: 3 },
    ],
    submissions: {}, createdAt: '2026-04-11T14:00:00Z',
  },
];

export const ASSIGNMENTS = [
  {
    id: 'asn-001', classId: 'cls-10a', subjectId: 'math', createdBy: 't-001',
    title: 'Trigonometry Problem Set — Ex 8.1 & 8.2',
    description: 'Complete all problems from Exercise 8.1 and 8.2 (Chapter 8). Show all working steps.',
    dueDate: '2026-04-20T23:59:00Z', submissions: [], createdAt: '2026-04-11T09:00:00Z',
  },
];

export const VIDEOS = [
  {
    id: 'vid-001', classId: 'cls-10a', subjectId: 'math', uploadedBy: 't-001',
    title: 'Introduction to Trigonometry — SOH-CAH-TOA',
    description: 'Learn how to use SOH-CAH-TOA to solve right triangle problems.',
    thumbnail: '📐', url: 'https://youtu.be/F21S9Wpi0y8', duration: '18:32',
    createdAt: '2026-04-10T08:00:00Z',
  },
  {
    id: 'vid-002', classId: 'cls-10a', subjectId: 'science', uploadedBy: 't-002',
    title: 'Cell Division — Mitosis & Meiosis Explained',
    description: 'Visual walkthrough of cell division phases with labelled diagrams.',
    thumbnail: '🔬', url: 'https://youtu.be/qCLmR9-YY7o', duration: '22:15',
    createdAt: '2026-04-09T10:00:00Z',
  },
];
