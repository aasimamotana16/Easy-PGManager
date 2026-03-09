const users = [
  {
    _id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$rjgLPi9M84U1iBu4Wg8joOjuQF98vQX7B15hCAdkyL9xJGs0cdkH6',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const owners = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    address: '123 Main St, Bangalore',
    idProof: 'aadhaar',
    idProofNumber: '123456789012',
    status: 'active',
    totalPGs: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const pgs = [
  {
    _id: '1',
    name: 'Sunshine PG',
    owner: { _id: '1', name: 'John Doe', email: 'john@example.com' },
    address: '456 MG Road, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    type: 'boys',
    totalRooms: 10,
    availableRooms: 3,
    rentPerMonth: 8000,
    deposit: 16000,
    amenities: ['WiFi', 'Food', 'Laundry', 'Parking'],
    images: [],
    description: 'Comfortable PG with all amenities',
    status: 'active',
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const complaints = [
  {
    _id: '1',
    title: 'Water leakage in bathroom',
    description: 'Water is leaking from the bathroom tap',
    complainantName: 'Rahul Kumar',
    complainantEmail: 'rahul@example.com',
    complainantPhone: '+91 9876543211',
    pgId: { _id: '1', name: 'Sunshine PG', address: '456 MG Road, Bangalore' },
    type: 'maintenance',
    priority: 'medium',
    status: 'pending',
    assignedTo: null,
    resolution: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const agreements = [
  {
    _id: '1',
    agreementNumber: 'AGR001',
    owner: { _id: '1', name: 'John Doe', email: 'john@example.com' },
    pg: { _id: '1', name: 'Sunshine PG', address: '456 MG Road, Bangalore' },
    tenantName: 'Rahul Kumar',
    tenantEmail: 'rahul@example.com',
    tenantPhone: '+91 9876543211',
    tenantIdProof: 'aadhaar',
    tenantIdProofNumber: '123456789013',
    roomNumber: '101',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    monthlyRent: 8000,
    deposit: 16000,
    terms: 'Standard rental agreement terms and conditions',
    status: 'active',
    documentUrl: '',
    signedByOwner: true,
    signedByTenant: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const documents = [
  {
    _id: '1',
    title: 'Owner ID Proof',
    type: 'id-proof',
    relatedTo: 'owner',
    relatedId: '1',
    fileName: 'john_aadhaar.pdf',
    filePath: '/uploads/documents/john_aadhaar.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    uploadedBy: { _id: '1', username: 'admin', email: 'admin@example.com' },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  users,
  owners,
  pgs,
  complaints,
  agreements,
  documents
};
