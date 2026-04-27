export const mockAvailableLendingBooks = [
  {
    id: 101,
    title: "الفيزياء الجامعية",
    author: "سيرواي",
    category: "علوم",
    copiesCount: 3,
    status: "active",
  },
  {
    id: 102,
    title: "التفاضل والتكامل",
    author: "ستيوارت",
    category: "رياضيات",
    copiesCount: 5,
    status: "active",
  },
  {
    id: 103,
    title: "هياكل البيانات",
    author: "سيدجويك",
    category: "حاسوب",
    copiesCount: 2,
    status: "active",
  },
  {
    id: 104,
    title: "علم الأدوية",
    author: "ليبينكوت",
    category: "طب",
    copiesCount: 1,
    status: "active",
  },
];

export const mockLendingRecords = [
  {
    id: 2001,
    bookId: 101,
    studentName: "محمد علي",
    condition: 0,
    cost: 1,
    borrowingDurationInDays: 14,
    state: 0,
  },
  {
    id: 2002,
    bookId: 101,
    studentName: "سارة خالد",
    condition: 1,
    cost: 1,
    borrowingDurationInDays: 7,
    state: 0,
  },
];

export const mockBorrowingRequests = [
  {
    id: 501,
    lendingRecordId: 1001,
    bookTitle: "الفيزياء الجامعية",
    studentName: "محمد علي",
    requestDate: new Date(Date.now() - 86400000).toISOString(),
    expectedReturnDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: "Pending",
  },
  {
    id: 502,
    lendingRecordId: 1002,
    bookTitle: "التفاضل والتكامل",
    studentName: "سارة خالد",
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    expectedReturnDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: "Accepted",
  },
  {
    id: 503,
    lendingRecordId: 1003,
    bookTitle: "علم الأدوية",
    studentName: "يوسف أحمد",
    requestDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    expectedReturnDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "Rejected",
  },
];

export const mockMyCopies = [
  {
    id: 701,
    bookId: 21,
    title: "إحصاء تطبيقي",
    author: "عبد الرحمن سلامة",
    condition: 1,
    state: "Available",
    isOnLendingList: true,
    bookCoverImageUrl: "",
  },
  {
    id: 702,
    bookId: 22,
    title: "مبادئ المحاسبة",
    author: "مها محمود",
    condition: 2,
    state: "Available",
    isOnLendingList: false,
    bookCoverImageUrl: "",
  },
];

export const mockTransactions = [
  {
    id: 801,
    bookTitle: "هياكل البيانات",
    borrowingStudentName: "أحمد سامي",
    ownerName: "منى حسين",
    deliveryDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    expectedReturnDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: "Active",
  },
  {
    id: 802,
    bookTitle: "علم الأدوية",
    borrowingStudentName: "خالد أمين",
    ownerName: "يوسف أحمد",
    deliveryDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    expectedReturnDate: new Date(Date.now() - 86400000 * 6).toISOString(),
    actualReturnDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "Returned",
  },
];
