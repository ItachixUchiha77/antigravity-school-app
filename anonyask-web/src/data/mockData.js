// Mock data for AnonyASK

export const CLASSES = [
  { id: 'cls-10a', name: 'Class 10A', grade: 10, section: 'A', studentCount: 34 },
  { id: 'cls-10b', name: 'Class 10B', grade: 10, section: 'B', studentCount: 32 },
  { id: 'cls-9a',  name: 'Class 9A',  grade: 9,  section: 'A', studentCount: 36 },
  { id: 'cls-11a', name: 'Class 11A', grade: 11, section: 'A', studentCount: 28 },
];

export const SUBJECTS = [
  { id: 'math',     name: 'Mathematics',    emoji: '📐', color: '#3B82F6' },
  { id: 'science',  name: 'Science',        emoji: '🔬', color: '#22C55E' },
  { id: 'english',  name: 'English',        emoji: '📖', color: '#F59E0B' },
  { id: 'history',  name: 'History',        emoji: '🏛️', color: '#A855F7' },
  { id: 'computer', name: 'Computer Science',emoji: '💻', color: '#EC4899' },
  { id: 'hindi',    name: 'Hindi',          emoji: '🗣️', color: '#14B8A6' },
];

export const USERS = {
  // Students
  's-001': { id: 's-001', name: 'You (Student)', role: 'student', classId: 'cls-10a', avatar: null, initials: 'YS' },
  's-002': { id: 's-002', name: 'Aisha Sharma',  role: 'student', classId: 'cls-10a', avatar: null, initials: 'AS' },
  's-003': { id: 's-003', name: 'Rohan Verma',   role: 'student', classId: 'cls-10a', avatar: null, initials: 'RV' },
  's-004': { id: 's-004', name: 'Priya Singh',   role: 'student', classId: 'cls-10a', avatar: null, initials: 'PS' },
  's-005': { id: 's-005', name: 'Arjun Mehta',   role: 'student', classId: 'cls-10b', avatar: null, initials: 'AM' },
  // Teachers
  't-001': { id: 't-001', name: 'Mr. Kapoor',    role: 'teacher', subjects: ['math'],     avatar: null, initials: 'MK' },
  't-002': { id: 't-002', name: 'Ms. Sharma',    role: 'teacher', subjects: ['science'],  avatar: null, initials: 'SS' },
  't-003': { id: 't-003', name: 'Mr. Patel',     role: 'teacher', subjects: ['english'],  avatar: null, initials: 'MP' },
  't-004': { id: 't-004', name: 'Ms. Gupta',     role: 'teacher', subjects: ['history'],  avatar: null, initials: 'MG' },
  't-005': { id: 't-005', name: 'Mr. Khan',      role: 'teacher', subjects: ['computer'], avatar: null, initials: 'MKh' },
  // Admin
  'a-001': { id: 'a-001', name: 'Principal Nair', role: 'admin',  avatar: null, initials: 'PN' },
};

export const DEMO_ACCOUNTS = [
  { role: 'student', userId: 's-001', label: 'Student',   description: 'Ask anonymous questions, upvote, chat privately with teachers' },
  { role: 'teacher', userId: 't-001', label: 'Teacher',   description: 'Answer questions, post announcements, manage channels' },
  { role: 'admin',   userId: 'a-001', label: 'Admin',     description: 'Full access — manage users, classes, school settings' },
];

export const QUESTIONS = [
  {
    id: 'q-001',
    classId: 'cls-10a',
    subjectId: 'math',
    text: "Ma'am, I still don't understand when to use sin vs cos in a right triangle. Can you explain again?",
    upvotes: 14,
    upvotedBy: ['s-002', 's-003', 's-004'],
    answered: true,
    answer: "Great question! Here's an easy way to remember: **SOH-CAH-TOA**\n\n- **Sin** = Opposite / Hypotenuse\n- **Cos** = Adjacent / Hypotenuse\n- **Tan** = Opposite / Adjacent\n\nTip: Always identify which angle you're working from first, then label Opposite, Adjacent, and Hypotenuse relative to that angle. We'll practice this more in tomorrow's class! 😊",
    answeredBy: 't-001',
    answeredAt: '2026-04-12T08:30:00Z',
    createdAt: '2026-04-11T14:20:00Z',
  },
  {
    id: 'q-002',
    classId: 'cls-10a',
    subjectId: 'math',
    text: "What is the difference between permutation and combination? I keep getting confused.",
    upvotes: 9,
    upvotedBy: ['s-002', 's-004'],
    answered: false,
    answer: null,
    answeredBy: null,
    answeredAt: null,
    createdAt: '2026-04-12T07:10:00Z',
  },
  {
    id: 'q-003',
    classId: 'cls-10a',
    subjectId: 'math',
    text: "Is the formula for area of a sector (θ/360) × πr² or (θ/2π) × πr²? I've seen both in different textbooks.",
    upvotes: 6,
    upvotedBy: ['s-003'],
    answered: true,
    answer: "Both are correct! The first uses degrees and the second uses radians.\n\n- **Degrees:** Area = (θ/360°) × πr²\n- **Radians:** Area = (θ/2π) × πr² = ½r²θ\n\nFor Class 10, always use the degree formula unless specifically told to use radians.",
    answeredBy: 't-001',
    answeredAt: '2026-04-12T09:00:00Z',
    createdAt: '2026-04-12T06:45:00Z',
  },
  {
    id: 'q-004',
    classId: 'cls-10a',
    subjectId: 'science',
    text: "What exactly happens during the S phase of mitosis? Is DNA replication same as chromosome duplication?",
    upvotes: 11,
    upvotedBy: ['s-002', 's-003', 's-004'],
    answered: true,
    answer: "DNA replication and chromosome duplication are related but not the same thing.\n\nDuring the **S phase** (Synthesis phase) of interphase:\n1. Each DNA molecule **replicates** — so you go from 2 chromatids to 4\n2. The chromosomes haven't visibly duplicated yet — they become **sister chromatids** joined at the centromere\n\nSo: DNA replication → sister chromatid formation → during M phase these separate = chromosome duplication. Does that help? 🔬",
    answeredBy: 't-002',
    answeredAt: '2026-04-11T15:00:00Z',
    createdAt: '2026-04-11T12:30:00Z',
  },
  {
    id: 'q-005',
    classId: 'cls-10a',
    subjectId: 'science',
    text: "In Ohm's law, if we increase resistance and keep voltage constant, current decreases. But how does the circuit 'know' to decrease current?",
    upvotes: 17,
    upvotedBy: ['s-002', 's-003'],
    answered: false,
    answer: null,
    answeredBy: null,
    answeredAt: null,
    createdAt: '2026-04-12T10:15:00Z',
  },
  {
    id: 'q-006',
    classId: 'cls-10a',
    subjectId: 'english',
    text: "In chapter 'The Hack Driver', why does the narrator feel embarrassed at the end? Is it because he was fooled or something else?",
    upvotes: 5,
    upvotedBy: [],
    answered: true,
    answer: "Both, actually! The narrator feels embarrassed for two reasons:\n\n1. **He was fooled** — he spent the whole day being driven around by Oliver Lutkins himself without recognizing him\n2. **Professional embarrassment** — as a 'smart city lawyer', being outsmarted by a simple country man wounded his pride\n\nThe irony is that the narrator trusted Lutkins completely because he seemed friendly and helpful — exactly the opposite of what a wanted man would seem. Sinclair Lewis uses this to comment on how naive book-learning can be vs real-world wisdom. 📚",
    answeredBy: 't-003',
    answeredAt: '2026-04-10T14:30:00Z',
    createdAt: '2026-04-10T11:00:00Z',
  },
  {
    id: 'q-007',
    classId: 'cls-10a',
    subjectId: 'computer',
    text: "What is the difference between == and === in JavaScript? When should I use which?",
    upvotes: 8,
    upvotedBy: ['s-003'],
    answered: false,
    answer: null,
    answeredBy: null,
    answeredAt: null,
    createdAt: '2026-04-12T11:20:00Z',
  },
];

export const ANNOUNCEMENTS = [
  {
    id: 'ann-001',
    classId: null, // school-wide
    title: '📅 Annual Sports Day — Registration Open!',
    content: 'Dear Students and Staff,\n\nWe are excited to announce that registrations for Annual Sports Day 2026 are now open! The event will be held on **April 25th, 2026** on the school grounds.\n\nEvents include: 100m Sprint, Long Jump, Relay Race, Cricket, Badminton, and Tug-of-War.\n\nAll students must register with their class teacher by **April 18th**. Participation certificates will be awarded to all.\n\n– Administration',
    priority: 'important',
    postedBy: 'a-001',
    createdAt: '2026-04-12T09:00:00Z',
    pinned: true,
  },
  {
    id: 'ann-002',
    classId: 'cls-10a',
    title: '📝 Class 10A — Mathematics Unit Test',
    content: 'This is a reminder that the **Mathematics Unit Test** for Trigonometry and Statistics chapters will be held on **April 16th, 2026 (Thursday)** during the 2nd period.\n\nSyllabus:\n- Trigonometry: Chapter 8 & 9\n- Statistics: Chapter 14\n\nPlease bring your geometry box and scientific calculator.\n\n– Mr. Kapoor',
    priority: 'urgent',
    postedBy: 't-001',
    createdAt: '2026-04-11T16:00:00Z',
    pinned: false,
  },
  {
    id: 'ann-003',
    classId: null,
    title: '🏖️ Summer Vacation Notice',
    content: 'This is to inform all students and parents that the school will remain closed for **Summer Vacation from May 5th to June 15th, 2026**.\n\nNew academic session begins June 16th. Admit cards and timetables will be distributed before vacation.\n\nHave a safe and enjoyable vacation!\n\n– Principal',
    priority: 'general',
    postedBy: 'a-001',
    createdAt: '2026-04-10T10:00:00Z',
    pinned: false,
  },
  {
    id: 'ann-004',
    classId: 'cls-10a',
    title: '🔬 Science Project Submission — Extended!',
    content: 'Good news! The Science Project deadline has been extended by **3 days**.\n\nNew submission date: **April 19th, 2026**.\n\nProjects must include a working model OR a detailed report. Marks distribution: 40% for the project, 60% for viva.\n\n– Ms. Sharma',
    priority: 'important',
    postedBy: 't-002',
    createdAt: '2026-04-09T14:00:00Z',
    pinned: false,
  },
];

export const PRIVATE_MESSAGES = {
  // Conversation between current student (s-001) and Mr. Kapoor (t-001)
  'conv-s001-t001': {
    participants: ['s-001', 't-001'],
    messages: [
      { id: 'm-001', senderId: 's-001', text: "Sir, I wanted to ask about the unit test. Will coordinate geometry be included?", createdAt: '2026-04-11T17:30:00Z', read: true },
      { id: 'm-002', senderId: 't-001', text: "Good question! No, coordinate geometry will NOT be in this unit test. Focus only on Trigonometry (Ch 8 & 9) and Statistics (Ch 14).", createdAt: '2026-04-11T18:05:00Z', read: true },
      { id: 'm-003', senderId: 's-001', text: "Thank you sir! Also, should we study the proofs for trigonometric identities?", createdAt: '2026-04-11T18:10:00Z', read: true },
      { id: 'm-004', senderId: 't-001', text: "Yes, the 3 fundamental identities:\n1. sin²θ + cos²θ = 1\n2. 1 + tan²θ = sec²θ\n3. 1 + cot²θ = cosec²θ\n\nYou should know how to prove them and apply them in problems.", createdAt: '2026-04-11T18:15:00Z', read: true },
      { id: 'm-005', senderId: 's-001', text: "Perfect, understood! Thank you so much sir 🙏", createdAt: '2026-04-11T18:17:00Z', read: true },
      { id: 'm-006', senderId: 't-001', text: "All the best! Study well 👍", createdAt: '2026-04-11T18:20:00Z', read: true },
    ]
  },
  'conv-s001-t002': {
    participants: ['s-001', 't-002'],
    messages: [
      { id: 'm-007', senderId: 't-002', text: "Hi! Just a reminder — your science project needs to include a bibliography. A lot of students missed it last time.", createdAt: '2026-04-10T09:00:00Z', read: true },
      { id: 'm-008', senderId: 's-001', text: "Oh! I didn't know that ma'am. Is it mandatory?", createdAt: '2026-04-10T14:30:00Z', read: true },
      { id: 'm-009', senderId: 't-002', text: "Yes, 5 marks are allocated for it. Please include at least 3 references — books, websites, or journals.", createdAt: '2026-04-10T16:00:00Z', read: true },
    ]
  }
};

export const GROUP_MESSAGES = {
  'cls-10a': [
    { id: 'gm-001', senderId: 's-002', text: "Has anyone finished the History assignment? I'm stuck on question 5 😭", createdAt: '2026-04-12T15:00:00Z' },
    { id: 'gm-002', senderId: 's-003', text: "Which question 5? The one about partition or the Industrial Revolution one?", createdAt: '2026-04-12T15:02:00Z' },
    { id: 'gm-003', senderId: 's-002', text: "Industrial Revolution! I can't find answers anywhere", createdAt: '2026-04-12T15:03:00Z' },
    { id: 'gm-004', senderId: 't-004', text: "Hi everyone! For question 5, check NCERT pages 134–138. The answer is all there. Don't copy paste though — write in your own words 😊", createdAt: '2026-04-12T15:10:00Z' },
    { id: 'gm-005', senderId: 's-004', text: "Thank you ma'am!! 🙏🙏", createdAt: '2026-04-12T15:11:00Z' },
    { id: 'gm-006', senderId: 's-003', text: "Big thanks Ms. Gupta! 🙏", createdAt: '2026-04-12T15:12:00Z' },
    { id: 'gm-007', senderId: 's-001', text: "Also does anyone have the formula sheet for the math test?", createdAt: '2026-04-12T17:00:00Z' },
    { id: 'gm-008', senderId: 's-002', text: "Mr. Kapoor shared one in the Math channel — check the announcements there! 📐", createdAt: '2026-04-12T17:05:00Z' },
  ]
};

export const NOTIFICATIONS = [
  { id: 'n-001', type: 'answer',       text: 'Mr. Kapoor answered your question in Mathematics',     subjectId: 'math',    createdAt: '2026-04-12T08:32:00Z', read: false },
  { id: 'n-002', type: 'announcement', text: 'New urgent announcement: Mathematics Unit Test',        classId: 'cls-10a',   createdAt: '2026-04-11T16:01:00Z', read: false },
  { id: 'n-003', type: 'message',      text: 'Mr. Kapoor sent you a private message',                 convId: 'conv-s001-t001', createdAt: '2026-04-11T18:20:00Z', read: true },
  { id: 'n-004', type: 'announcement', text: 'School-wide: Annual Sports Day Registration Open',      createdAt: '2026-04-12T09:01:00Z', read: true },
  { id: 'n-005', type: 'message',      text: 'Ms. Sharma sent you a private message',                 convId: 'conv-s001-t002', createdAt: '2026-04-10T09:01:00Z', read: true },
];
