// src/config/staticData/index.js

// Banner images (from public/images/homeImages)
export const bannerImages = [
  "/images/homeImages/img5.jpg",
  "/images/homeImages/img6.jpg",
  "/images/homeImages/img7.jpg",
];

// Banner text content
export const bannerText = {
  heading: "Welcome to EasyPG Manager",
  subheading:
    "Hassle-free Hostel & PG Management System for Owners and Tenants",
  cta: "Get Started",
};

export const features = [
  {
    title: "Easy Room Management",
    desc: "Add, edit, and manage rooms effortlessly with our intuitive interface."
  },
  {
    title: "Automated Billing",
    desc: "Generate invoices automatically and keep track of payments with ease."
  },
  {
    title: "Tenant Tracking",
    desc: "Monitor tenants' details, lease periods, and history efficiently."
  },
  {
    title: "Attendance Management",
    desc: "Keep track of tenant attendance and room usage for smooth operations."
  },
  {
    title: "Custom Notifications",
    desc: "Send reminders, alerts, and announcements to tenants directly."
  },
  {
    title: "Reports & Analytics",
    desc: "Gain insights with detailed reports and analytics for smarter decisions."
  }
];


// Contact page static data
export const contactInfo = {
  email: "business-support@easyPGmanager.com",
  supportPhone: "+91 0000000000",
  infoPhone: "+91 000000000",
  timing: "Monday–Friday [9:00 AM to 6:00 PM]",
};

export const contactCTA = {
  demo: {
    title: "What are you still waiting for?",
    description:
      "Automate your operations, manage your hostel/PGs business efficiently, and boost profits!",
    button: "SCHEDULE A DEMO →",
  },
  touch: {
    title: "Get in touch with us!",
    placeholder: "Email*",
    button: "Submit",
  },
};


// src/config/staticData/index.js

// About page static data
export const aboutIntro = {
  title: "About EasyPG Manager",
  description:
    "EasyPG Manager is your trusted platform for simplified PG living. We combine smart technology with user-friendly design to make rental management seamless for tenants and owners alike.",
};

export const aboutWhoWeServe = [
  {
    role: "Tenants",
    desc: "Find PGs, manage billing, raise complaints, and connect directly with owners.",
  },
  {
    role: "Owners",
    desc: "Manage rules, billing, agreements, and tenant communication effortlessly.",
  },
  {
    role: "Students & Professionals",
    desc: "Flexible rental plans and transparent agreements for peace of mind.",
  },
];

export const aboutFeatures = [
  {
    title: "Smart Billing",
    desc: "Itemized bills for rent, electricity, Wi-Fi, and maintenance with flexible payment plans.",
  },
  {
    title: "Complaint System",
    desc: "Raise and track complaints visible only to your PG owner for quick resolution.",
  },
  {
    title: "Direct Owner Contact",
    desc: "Communicate directly with PG owners for agreements, rules, and updates.",
  },
  {
    title: "Flexible Rentals",
    desc: "Choose monthly, quarterly, or yearly payment options to suit your lifestyle.",
  },
];

export const aboutWhyChooseUs =
  "We believe PG living should be stress-free. Our platform ensures transparency, convenience, and trust between tenants and owners. With a premium design and intuitive features, EasyPG Manager makes smart living truly simplified.";

export const aboutReviews = [
  {
    text: "“Managing my PG has never been easier. Billing and complaints are all in one place.”",
    author: "PG Owner",
  },
  {
    text: "“I love the transparency. I can see my rent breakdown and contact my owner instantly.”",
    author: "Tenant",
  },
];

export const services = [
  {
    id: 1,
    title: "PG Management",
    description: "Streamline tenant records, rent tracking, and PG operations with ease.",
    icon: "🏠",
  },
  {
    id: 2,
    title: "Billing & Payments",
    description: "Automated invoices, reminders, and secure payment integrations.",
    icon: "💳",
  },
  {
    id: 3,
    title: "Support & Maintenance",
    description: "Track service requests and manage maintenance schedules efficiently.",
    icon: "🛠️",
  },
];

  export const faqs = [
  {
    id: 1,
    question: "What is EasyPG Manager?",
    answer: "EasyPG Manager is a platform designed to simplify PG and hostel management with modern tools."
  },
  {
    id: 2,
    question: "Can tenants pay rent online?",
    answer: "Yes, tenants can pay securely online through integrated billing and payment features."
  },
  {
    id: 3,
    question: "Is there support for PG owners?",
    answer: "Absolutely. Owners can track tenants, manage billing, and handle service requests efficiently."
  },
  {
    id: 4,
    question: "Does EasyPG Manager provide maintenance tracking?",
    answer: "Yes, you can log service requests and track maintenance schedules directly in the dashboard."
  }
];


// Gender options
export const genderOptions = ["Any", "Boys", "Girls", "Co-living"];

// Occupancy options
export const occupancyOptions = ["Any", "Single", "Double", "Triple", "3+"];

// Rent cycle options
export const rentCycleOptions = ["Any", "01-01", "10-10", "15-15"];

// Grace period options
export const gracePeriodOptions = ["Any", "Nil", "5 Days", "7 Days", "10 Days"];

// Amenities list
export const amenitiesList = [
  "Hygienic Food", "Daily Newspaper", "Power Backup", "Wi-fi", "Fully Furnished",
  "RO Water", "Water Cooler", "Parking", "CCTV", "Attached Washroom", "AC",
  "Geyser", "Peaceful Living", "Balcony", "Desert Cooler", "Gas/Induction",
  "Fridge", "Laundry/Washing Machine", "Bed + Mattress", "TV/LED", "Wardrobe/Almirah",
];

// Additional facilities list
export const extrasList = [
  "Kitchen Amenities", "Table-Chair", "Library", "First Aid Medical Facility", "Cleaning", "GYM"
];

export const pgdetails = [
  {
    id: 1,
    name: "Sunrise PG",
    location: "Nadiad",
    address: "123 MG Road, Nadiad",

    startingPrice: "₹4500 / month",

    amenities: ["WiFi", "Laundry", "Meals"],
    facilities: ["WiFi", "Laundry", "Meals", "Common Room", "Hot Water"],

    ownerName: "Mr. Ramesh Patel",
    ownerContact: "9876543210",

    rulesList: [
      { icon: "nosmoke", text: "No smoking inside the premises" },
      { icon: "nopet", text: "No pets allowed" },
      { icon: "music", text: "Maintain silence after 10 PM" },
      { icon: "noguest", text: "No guests allowed" },
      { icon: "clean", text: "Keep the rooms and common areas clean" },
    ],

    sharing: [
      { type: "Single Sharing", price: "₹6500 / month" },
      { type: "Double Sharing", price: "₹4500 / month" },
    ],

    gender: "Male",
    rating: 4.3,

    image: "/images/sunrise-pg.jpg",
    roomImages: [
      "/images/sunriseimg/roomimg1.jpeg",
      "/images/sunriseimg/roomimg2.jpeg",
      "/images/sunriseimg/roomimg3.jpeg",
    ],
  },
  {
    id: 2,
    name: "GreenNest PG",
    location: "Ahmedabad",
    address: "45 Green Street, Ahmedabad",
    price: "₹5500/month",
    rent: 5500,
    amenities: ["AC", "Parking", "Security"],
    facilities: ["AC", "Parking", "Security", "Gym", "Common Kitchen"],
    ownerName: "Mrs. Seema Shah",
    ownerContact: "9123456780",
    rulesList: [
      { icon: "noguest", text: "No guests allowed" },
      { icon: "clean", text: "Keep the premises clean" },
    ],
    gender: "Female",
    rating: 4.7,
    image: "/images/greennest-pg.jpg",
    roomImages: []
  },
];

export const hosteldetails = [
  {
    id: 102,
    name: "CityHostel",
    location: "Vadodara",
    address: "89 Central Avenue, Vadodara",
    price: "₹4000/month",
    rent: 4000,
    amenities: ["WiFi", "Gym", "CCTV"],
    facilities: ["WiFi", "Gym", "CCTV", "Common Area", "Laundry"],
    ownerName: "Mr. Jay Mehta",
    ownerContact: "9988776655",
    rulesList: [
      { icon: "nosmoke", text: "No smoking allowed" },
      { icon: "music", text: "No loud music" },
      { icon: "clean", text: "Keep common areas clean" },
    ],
    gender: "Male",
    rating: 4.2,
    image: "/images/cityhostel.jpg",
    roomImages: []
  },
  {
    id: 101,
    name: "Elite Hostel",
    location: "Nadiad",
    address: "22 Elite Street, Nadiad",
    price: "₹6000/month",
    rent: 6000,
    amenities: ["AC", "Meals", "Security"],
    facilities: ["AC", "Meals", "Security", "Study Room", "Hot Water"],
    ownerName: "Ms. Anjali Desai",
    ownerContact: "9871122334",
    rulesList: [
      { icon: "clean", text: "Maintain cleanliness" },
      { icon: "nopet", text: "No pets allowed" },
    ],
    gender: "Female",
    rating: 4.6,
    image: "/images/elitehostel.jpg",
    roomImages: []
  },
];


// =====================
// TERMS & CONDITIONS
// =====================
// src/config/staticData.js

export const termsConditionsData = [
  {
    title: "1. Acceptance of Terms",
    description:
      "By accessing and using EasyPG Manager, you agree to comply with and be bound by these Terms and Conditions."
  },
  {
    title: "2. User Accounts",
    description:
      "Users must provide accurate and complete information while registering on the platform."
  },
  {
    title: "3. Booking Policy",
    description:
      "Only logged-in users can make bookings. Bookings without login are not permitted."
  },
  {
    title: "4. Payments",
    description:
      "Payments made on the platform are subject to the terms mentioned during checkout."
  },
  {
    title: "5. Account Termination",
    description:
      "EasyPG Manager reserves the right to suspend or terminate accounts violating policies."
  }
];


// =====================
// PRIVACY POLICY
// =====================
export const privacyPolicyData = {
  title: "Privacy Policy",
  lastUpdated: "January 2025",
  sections: [
    {
      heading: "Information We Collect",
      content:
        "We collect personal details such as name, email, phone number, and booking information."
    },
    {
      heading: "Usage of Information",
      content:
        "Your information is used to process bookings, improve services, and communicate updates."
    },
    {
      heading: "Data Security",
      content:
        "We use industry-standard security practices to protect your data."
    },
    {
      heading: "Third-Party Sharing",
      content:
        "We do not sell or share your personal information with third parties except when required by law."
    },
    {
      heading: "User Rights",
      content:
        "You may request access, correction, or deletion of your data by contacting us."
    }
  ]
};
export const homeBannerStats = [
  {
    value: "100+",
    label: "Customers Worldwide",
  },
  {
    value: "10k+",
    label: "Daily Users",
  },
  {
    value: "100k+",
    label: "Worth of Rent Managed",
  },
];

