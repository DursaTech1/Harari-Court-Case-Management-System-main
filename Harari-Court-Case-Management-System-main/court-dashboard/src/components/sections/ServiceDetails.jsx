import React, { useState, useRef, useEffect } from 'react';
import './ServiceDetails.css';
import { submitServiceRequest } from '../../api/api';

// onSubmitted is called after a successful submission so Dashboard can refresh stats

const ServiceDetails = ({ service, onStartService, onBack, onSubmitted }) => {
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [appointments, setAppointments] = useState([]); // New state for appointments list
  const [selectedAppointment, setSelectedAppointment] = useState(null); // For appointment details view
  const fileInputRef = useRef(null);
  
  // Mock database of stored court documents
  const storedCourtDocuments = [
    {
      id: 'DOC-001',
      caseNumber: 'ETB-2024-001',
      caseTitle: 'Civil Contract Dispute - Johnson vs Smith',
      documentType: 'judgment',
      fileName: 'Judgment_ETB-2024-001.pdf',
      fileSize: '2.4 MB',
      uploadDate: '2024-01-15',
      caseYear: 2024,
      description: 'Final judgment on civil contract dispute case',
      keywords: ['contract', 'breach', 'compensation', 'civil'],
      accessLevel: 'public',
      courtLocation: 'Main Court Building',
      judgeName: 'Judge Michael Anderson',
      fileContent: 'This is a mock PDF content for Civil Contract Dispute case. The judgment was delivered on January 15, 2024, resolving the contract dispute between Johnson and Smith. The court found in favor of Johnson and awarded compensatory damages of $50,000 for breach of contract.'
    },
    {
      id: 'DOC-002',
      caseNumber: 'ETB-2024-002',
      caseTitle: 'Criminal Theft Case - State vs Roberts',
      documentType: 'order',
      fileName: 'Court_Order_ETB-2024-002.pdf',
      fileSize: '1.8 MB',
      uploadDate: '2024-01-20',
      caseYear: 2024,
      description: 'Court order for evidence submission',
      keywords: ['theft', 'evidence', 'criminal'],
      accessLevel: 'restricted',
      courtLocation: 'North Branch Court',
      judgeName: 'Judge Sarah Williams',
      fileContent: 'This is a mock PDF content for Criminal Theft Case. Court order issued for evidence submission in State vs Roberts case. The defendant is ordered to produce all relevant documents and evidence within 14 days.'
    },
    {
      id: 'DOC-003',
      caseNumber: 'ETB-2023-045',
      caseTitle: 'Family Custody Case - Miller vs Miller',
      documentType: 'certificate',
      fileName: 'Custody_Certificate_ETB-2023-045.pdf',
      fileSize: '1.2 MB',
      uploadDate: '2023-12-10',
      caseYear: 2023,
      description: 'Child custody arrangement certificate',
      keywords: ['family', 'custody', 'child', 'divorce'],
      accessLevel: 'restricted',
      courtLocation: 'Family Court Branch',
      judgeName: 'Judge Robert Johnson',
      fileContent: 'This is a mock PDF content for Family Custody Case. Custody arrangement certificate issued for Miller vs Miller case. Joint custody granted with primary residence to the mother and visitation rights to the father.'
    },
    {
      id: 'DOC-004',
      caseNumber: 'ETB-2024-015',
      caseTitle: 'Commercial Breach of Contract',
      documentType: 'filing',
      fileName: 'Case_Filing_ETB-2024-015.pdf',
      fileSize: '3.1 MB',
      uploadDate: '2024-02-05',
      caseYear: 2024,
      description: 'Initial case filing documents',
      keywords: ['commercial', 'contract', 'business'],
      accessLevel: 'public',
      courtLocation: 'Commercial Court',
      judgeName: 'Judge Elizabeth Brown',
      fileContent: 'This is a mock PDF content for Commercial Breach of Contract case. Initial filing documents submitted to the commercial court. The plaintiff alleges breach of commercial agreement and seeks damages of $250,000.'
    },
    {
      id: 'DOC-005',
      caseNumber: 'ETB-2023-102',
      caseTitle: 'Property Boundary Dispute',
      documentType: 'evidence',
      fileName: 'Evidence_Files_ETB-2023-102.zip',
      fileSize: '15.2 MB',
      uploadDate: '2023-11-30',
      caseYear: 2023,
      description: 'Evidence files including photos and surveys',
      keywords: ['property', 'boundary', 'land', 'survey'],
      accessLevel: 'restricted',
      courtLocation: 'Property Court',
      judgeName: 'Judge Thomas Davis',
      fileContent: 'This is a mock ZIP content for Property Boundary Dispute case. Contains evidence files, photos, and survey documents showing property boundaries and disputed areas.'
    },
    {
      id: 'DOC-006',
      caseNumber: 'ETB-2024-008',
      caseTitle: 'Labor Dispute - Wrongful Dismissal',
      documentType: 'judgment',
      fileName: 'Labor_Judgment_ETB-2024-008.pdf',
      fileSize: '2.7 MB',
      uploadDate: '2024-01-25',
      caseYear: 2024,
      description: 'Judgment on wrongful dismissal case',
      keywords: ['labor', 'employment', 'dismissal', 'compensation'],
      accessLevel: 'public',
      courtLocation: 'Labor Court',
      judgeName: 'Judge Patricia Wilson',
      fileContent: 'This is a mock PDF content for Labor Dispute case. Judgment delivered on wrongful dismissal claim. The court found the dismissal to be unjust and awarded the plaintiff compensation equivalent to 12 months salary.'
    },
    {
      id: 'DOC-007',
      caseNumber: 'ETB-2022-078',
      caseTitle: 'Administrative Appeal Case',
      documentType: 'order',
      fileName: 'Appeal_Order_ETB-2022-078.pdf',
      fileSize: '1.5 MB',
      uploadDate: '2022-09-15',
      caseYear: 2022,
      description: 'Order for administrative appeal hearing',
      keywords: ['administrative', 'appeal', 'government'],
      accessLevel: 'public',
      courtLocation: 'Administrative Court',
      judgeName: 'Judge David Miller',
      fileContent: 'This is a mock PDF content for Administrative Appeal Case. Court order for appeal hearing scheduled for November 15, 2022. Both parties are ordered to submit their arguments 10 days before the hearing.'
    },
    {
      id: 'DOC-008',
      caseNumber: 'ETB-2024-003',
      caseTitle: 'Criminal Fraud Investigation',
      documentType: 'evidence',
      fileName: 'Fraud_Evidence_ETB-2024-003.zip',
      fileSize: '8.9 MB',
      uploadDate: '2024-02-01',
      caseYear: 2024,
      description: 'Evidence files for fraud investigation',
      keywords: ['fraud', 'criminal', 'investigation', 'financial'],
      accessLevel: 'restricted',
      courtLocation: 'Criminal Court',
      judgeName: 'Judge Jennifer Taylor',
      fileContent: 'This is a mock ZIP content for Criminal Fraud Investigation. Contains evidence files and investigation documents related to alleged financial fraud and misappropriation of funds.'
    }
  ];

  // Court cause types and their fee calculation formulas
  const courtCauseTypes = {
    'Civil Case': {
      description: 'Disputes between individuals or organizations',
      calculateFee: (amount) => {
        if (amount <= 1000) return 15;
        if (amount <= 5000) return 50;
        if (amount <= 10000) return 75;
        if (amount <= 50000) return 150;
        if (amount <= 100000) return 300;
        if (amount <= 500000) return 500;
        if (amount <= 1000000) return 1000;
        if (amount <= 5000000) return 2000;
        if (amount <= 10000000) return 3500;
        if (amount <= 20000000) return 5000;
        if (amount <= 30000000) return 7500;
        if (amount <= 40000000) return 10000;
        if (amount <= 50000000) return 12500;
        if (amount <= 75000000) return 15000;
        if (amount <= 100000000) return 20000;
        return 25000;
      }
    },
    'Criminal Case': {
      description: 'Offenses against the state or society',
      calculateFee: (amount) => {
        if (amount <= 1000) return 10;
        if (amount <= 5000) return 30;
        if (amount <= 10000) return 50;
        if (amount <= 50000) return 100;
        if (amount <= 100000) return 200;
        if (amount <= 500000) return 300;
        if (amount <= 1000000) return 500;
        if (amount <= 5000000) return 1000;
        if (amount <= 10000000) return 2000;
        if (amount <= 20000000) return 3000;
        if (amount <= 30000000) return 4000;
        if (amount <= 40000000) return 5000;
        if (amount <= 50000000) return 6000;
        if (amount <= 75000000) return 7500;
        if (amount <= 100000000) return 10000;
        return 15000;
      }
    },
    'Family Case': {
      description: 'Marriage, divorce, child custody, inheritance',
      calculateFee: (amount) => {
        if (amount <= 1000) return 5;
        if (amount <= 5000) return 20;
        if (amount <= 10000) return 30;
        if (amount <= 50000) return 60;
        if (amount <= 100000) return 120;
        if (amount <= 500000) return 200;
        if (amount <= 1000000) return 300;
        if (amount <= 5000000) return 600;
        if (amount <= 10000000) return 1200;
        if (amount <= 20000000) return 1800;
        if (amount <= 30000000) return 2400;
        if (amount <= 40000000) return 3000;
        if (amount <= 50000000) return 3600;
        if (amount <= 75000000) return 4500;
        if (amount <= 100000000) return 6000;
        return 8000;
      }
    },
    'Commercial Case': {
      description: 'Business disputes, contracts, trade',
      calculateFee: (amount) => {
        if (amount <= 1000) return 20;
        if (amount <= 5000) return 60;
        if (amount <= 10000) return 90;
        if (amount <= 50000) return 180;
        if (amount <= 100000) return 360;
        if (amount <= 500000) return 600;
        if (amount <= 1000000) return 1200;
        if (amount <= 5000000) return 2400;
        if (amount <= 10000000) return 4200;
        if (amount <= 20000000) return 6000;
        if (amount <= 30000000) return 9000;
        if (amount <= 40000000) return 12000;
        if (amount <= 50000000) return 15000;
        if (amount <= 75000000) return 18000;
        if (amount <= 100000000) return 24000;
        return 30000;
      }
    },
    'Labor Case': {
      description: 'Disputes between employers and employees',
      calculateFee: (amount) => {
        if (amount <= 1000) return 8;
        if (amount <= 5000) return 25;
        if (amount <= 10000) return 40;
        if (amount <= 50000) return 80;
        if (amount <= 100000) return 160;
        if (amount <= 500000) return 250;
        if (amount <= 1000000) return 400;
        if (amount <= 5000000) return 800;
        if (amount <= 10000000) return 1400;
        if (amount <= 20000000) return 2000;
        if (amount <= 30000000) return 3000;
        if (amount <= 40000000) return 4000;
        if (amount <= 50000000) return 5000;
        if (amount <= 75000000) return 6000;
        if (amount <= 100000000) return 8000;
        return 10000;
      }
    },
    'Property Case': {
      description: 'Land and property ownership disputes',
      calculateFee: (amount) => {
        if (amount <= 1000) return 12;
        if (amount <= 5000) return 40;
        if (amount <= 10000) return 60;
        if (amount <= 50000) return 120;
        if (amount <= 100000) return 240;
        if (amount <= 500000) return 400;
        if (amount <= 1000000) return 800;
        if (amount <= 5000000) return 1600;
        if (amount <= 10000000) return 2800;
        if (amount <= 20000000) return 4000;
        if (amount <= 30000000) return 6000;
        if (amount <= 40000000) return 8000;
        if (amount <= 50000000) return 10000;
        if (amount <= 75000000) return 12000;
        if (amount <= 100000000) return 16000;
        return 20000;
      }
    }
  };

  // Service-specific configurations - UPDATED for Daily Appointment
  const serviceConfigs = {
    'Document Submission': {
      steps: [
        { number: 1, title: 'Document Overview', description: 'Learn about submission requirements' },
        { number: 2, title: 'Upload Documents', description: 'Upload your legal documents' },
        { number: 3, title: 'Review & Submit', description: 'Verify and submit documents to court' }
      ],
      requiredDocuments: [
        { id: 1, name: 'Identification Document', description: 'Valid ID or Passport (PDF, JPG, PNG)', required: true },
        { id: 2, name: 'Case Documents', description: 'Legal documents to submit', required: true },
        { id: 3, name: 'Cover Letter', description: 'Explanation letter (optional)', required: false },
      ],
      processingTime: '1-2 business days',
      showDocumentUpload: true,
      showPayment: false,
      showSearch: false,
      showAppointment: false,
      showComplaintForm: false,
      showFeedback: false,
      showLocation: false,
      showContact: false
    },
    'Arbitration Fee': {
      steps: [
        { number: 1, title: 'Case Information', description: 'Enter case details and amount' },
        { number: 2, title: 'Payment Details', description: 'Complete payment information' },
        { number: 3, title: 'Review & Submit', description: 'Verify and submit payment' }
      ],
      processingTime: 'Immediate confirmation',
      showDocumentUpload: false,
      requiredDocuments: [],
      showPayment: true,
      showSearch: false,
      showAppointment: false,
      showComplaintForm: false,
      showFeedback: false,
      showLocation: false,
      showContact: false
    },
    'Search Document': {
      steps: [
        { number: 1, title: 'Search Criteria', description: 'Enter search parameters' },
        { number: 2, title: 'Search Results', description: 'Review found documents' },
        { number: 3, title: 'Request Access', description: 'Request document access or download' }
      ],
      processingTime: '3-5 business days',
      showDocumentUpload: false,
      requiredDocuments: [],
      showPayment: false,
      showSearch: true,
      showAppointment: false,
      showComplaintForm: false,
      showFeedback: false,
      showLocation: false,
      showContact: false
    },
    'Daily Appointment': {
      steps: [
        { number: 1, title: 'View Appointments', description: 'Browse daily court appointments' },
        { number: 2, title: 'Appointment Details', description: 'View appointment information' },
        { number: 3, title: 'Schedule New', description: 'Book a new appointment' }
      ],
      processingTime: 'Confirmation within 1 hour',
      showDocumentUpload: false,
      showPayment: false,
      showSearch: false,
      showAppointment: true,
      showAppointmentList: true, // NEW: Flag to show appointments list
      showComplaintForm: false,
      showFeedback: false,
      showLocation: true,
      showContact: false
    },
    'Complaint Form': {
      steps: [
        { number: 1, title: 'Complaint Details', description: 'Describe your complaint' },
        { number: 2, title: 'Supporting Evidence', description: 'Upload supporting documents' },
        { number: 3, title: 'Review & Submit', description: 'Verify and submit complaint' }
      ],
      processingTime: '5-7 business days',
      showDocumentUpload: true,
      requiredDocuments: [
        { id: 1, name: 'Complaint Statement', description: 'Detailed complaint description (PDF, DOC)', required: true },
        { id: 2, name: 'Supporting Evidence', description: 'Photos, documents, or other evidence', required: false },
        { id: 3, name: 'Witness Statements', description: 'Statements from witnesses (if any)', required: false },
      ],
      showPayment: false,
      showSearch: false,
      showAppointment: false,
      showComplaintForm: true,
      showFeedback: false,
      showLocation: false,
      showContact: true
    },
    'FeedBack': {
      steps: [
        { number: 1, title: 'Service Feedback', description: 'Rate and review services' },
        { number: 2, title: 'Additional Comments', description: 'Provide detailed feedback' },
        { number: 3, title: 'Review & Submit', description: 'Verify and submit feedback' }
      ],
      processingTime: 'Submitted immediately',
      showDocumentUpload: false,
      showPayment: false,
      showSearch: false,
      showAppointment: false,
      showComplaintForm: false,
      showFeedback: true,
      showLocation: false,
      showContact: false
    },
  };

  // Get configuration for current service
  const config = serviceConfigs[service.name] || serviceConfigs['Document Submission'];
  const steps = config.steps;
  const requiredDocuments = config.requiredDocuments || [];

  // Mock appointments data
  const mockAppointments = [
    {
      id: 'APT-001',
      caseNumber: 'ETB-2024-001',
      caseTitle: 'Civil Contract Dispute - Johnson vs Smith',
      scheduledDate: '2024-03-15',
      scheduledTime: '09:00 AM',
      duration: '1 hour',
      courtRoom: 'Courtroom 3A',
      judge: 'Judge Michael Anderson',
      purpose: 'Hearing',
      status: 'Scheduled',
      parties: ['John Johnson', 'Robert Smith'],
      lawyer: 'Attorney Sarah Miller',
      notes: 'Pre-trial hearing for contract dispute'
    },
    {
      id: 'APT-002',
      caseNumber: 'ETB-2024-002',
      caseTitle: 'Criminal Theft Case - State vs Roberts',
      scheduledDate: '2024-03-15',
      scheduledTime: '10:30 AM',
      duration: '2 hours',
      courtRoom: 'Courtroom 2B',
      judge: 'Judge Sarah Williams',
      purpose: 'Evidence Presentation',
      status: 'In Progress',
      parties: ['State of Ethiopia', 'David Roberts'],
      lawyer: 'Public Defender James Wilson',
      notes: 'Presentation of evidence phase'
    },
    {
      id: 'APT-003',
      caseNumber: 'ETB-2024-003',
      caseTitle: 'Family Custody Case - Miller vs Miller',
      scheduledDate: '2024-03-15',
      scheduledTime: '02:00 PM',
      duration: '1.5 hours',
      courtRoom: 'Family Court 1',
      judge: 'Judge Robert Johnson',
      purpose: 'Mediation Session',
      status: 'Scheduled',
      parties: ['Alice Miller', 'Bob Miller'],
      lawyer: 'Attorney Patricia Brown',
      notes: 'Child custody mediation'
    },
    {
      id: 'APT-004',
      caseNumber: 'ETB-2024-015',
      caseTitle: 'Commercial Breach of Contract',
      scheduledDate: '2024-03-16',
      scheduledTime: '11:00 AM',
      duration: '3 hours',
      courtRoom: 'Commercial Court A',
      judge: 'Judge Elizabeth Brown',
      purpose: 'Trial',
      status: 'Scheduled',
      parties: ['ABC Corporation', 'XYZ Ltd'],
      lawyer: 'Attorney David Clark',
      notes: 'Main trial proceedings'
    },
    {
      id: 'APT-005',
      caseNumber: 'ETB-2023-102',
      caseTitle: 'Property Boundary Dispute',
      scheduledDate: '2024-03-16',
      scheduledTime: '09:30 AM',
      duration: '1 hour',
      courtRoom: 'Property Court 2',
      judge: 'Judge Thomas Davis',
      purpose: 'Final Judgment',
      status: 'Completed',
      parties: ['Landowner Association', 'Neighbor Group'],
      lawyer: 'Attorney Jennifer Taylor',
      notes: 'Final judgment reading'
    },
    {
      id: 'APT-006',
      caseNumber: 'ETB-2024-008',
      caseTitle: 'Labor Dispute - Wrongful Dismissal',
      scheduledDate: '2024-03-16',
      scheduledTime: '03:00 PM',
      duration: '2 hours',
      courtRoom: 'Labor Court B',
      judge: 'Judge Patricia Wilson',
      purpose: 'Hearing',
      status: 'Scheduled',
      parties: ['Employee Union', 'TechCorp Inc'],
      lawyer: 'Attorney Richard Moore',
      notes: 'Wrongful dismissal hearing'
    },
    {
      id: 'APT-007',
      caseNumber: 'ETB-2022-078',
      caseTitle: 'Administrative Appeal Case',
      scheduledDate: '2024-03-17',
      scheduledTime: '10:00 AM',
      duration: '1.5 hours',
      courtRoom: 'Administrative Court',
      judge: 'Judge David Miller',
      purpose: 'Appeal Hearing',
      status: 'Postponed',
      parties: ['Government Department', 'Appellant'],
      lawyer: 'Attorney Susan Lee',
      notes: 'Postponed to next week'
    },
    {
      id: 'APT-008',
      caseNumber: 'ETB-2024-003',
      caseTitle: 'Criminal Fraud Investigation',
      scheduledDate: '2024-03-17',
      scheduledTime: '02:30 PM',
      duration: '2 hours',
      courtRoom: 'Criminal Court 4',
      judge: 'Judge Jennifer Taylor',
      purpose: 'Evidence Review',
      status: 'Scheduled',
      parties: ['State Prosecutor', 'Defendant'],
      lawyer: 'Defense Attorney Mark Johnson',
      notes: 'Review of financial evidence'
    }
  ];

  // Load appointments on component mount
  useEffect(() => {
    if (service.name === 'Daily Appointment') {
      // Simulate API call to fetch appointments
      setTimeout(() => {
        setAppointments(mockAppointments);
      }, 500);
    }
  }, [service.name]);

  // Calculate court fee based on selected case type and claim amount
  useEffect(() => {
    if (service.name === 'Arbitration Fee' && formData.courtCauseType && formData.claimAmount) {
      const selectedType = courtCauseTypes[formData.courtCauseType];
      const amount = parseFloat(formData.claimAmount.replace(/,/g, '')) || 0;
      
      if (selectedType && selectedType.calculateFee) {
        const calculatedFee = selectedType.calculateFee(amount);
        setPaymentAmount(calculatedFee);
      }
    } else {
      setPaymentAmount(0);
    }
  }, [formData.courtCauseType, formData.claimAmount, service.name]);

  // Load submitted requests from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('submittedRequests');
    if (savedRequests) {
      setSubmittedRequests(JSON.parse(savedRequests));
    }
  }, []);

  // Save submitted requests to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
  }, [submittedRequests]);

  const handleFileSelect = () => {
    if (config.showDocumentUpload) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    if (!config.showDocumentUpload) return;
    
    const files = Array.from(event.target.files);
    setIsUploading(true);
    
    setTimeout(() => {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toLocaleString(),
        status: 'uploaded',
        previewURL: URL.createObjectURL(file),
        fileObject: file
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
      event.target.value = '';
    }, 1000);
  };

  const handleRemoveFile = (fileId) => {
    const fileToRemove = uploadedFiles.find(file => file.id === fileId);
    if (fileToRemove && fileToRemove.previewURL) {
      URL.revokeObjectURL(fileToRemove.previewURL);
    }
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentStatus = (docName) => {
    const uploadedDoc = uploadedFiles.find(file => 
      file.name.toLowerCase().includes(docName.toLowerCase().split(' ')[0])
    );
    return uploadedDoc ? 'uploaded' : 'pending';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFeedbackRating(rating);
    setFormData(prev => ({ ...prev, rating: rating }));
  };

  const handleClaimAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = value ? parseInt(value).toLocaleString() : '';
    setFormData(prev => ({ ...prev, claimAmount: formattedValue }));
  };

  // Function to download a document - WORKING VERSION
  const handleDownloadDocument = (documentId) => {
    const document = storedCourtDocuments.find(doc => doc.id === documentId);
    if (!document) {
      alert('Document not found');
      return;
    }
    
    // Create a simple text file with document information
    const textContent = `
COURT DOCUMENT
==============
Case Number: ${document.caseNumber}
Case Title: ${document.caseTitle}
Document Type: ${document.documentType}
Judge: ${document.judgeName}
Court Location: ${document.courtLocation}
Upload Date: ${document.uploadDate}
File Size: ${document.fileSize}
Access Level: ${document.accessLevel}
Case Year: ${document.caseYear}

DESCRIPTION:
${document.description}

DOCUMENT CONTENT:
${document.fileContent}

KEYWORDS: ${document.keywords.join(', ')}

Generated: ${new Date().toLocaleString()}
Document ID: ${document.id}
`;

    // Try multiple download methods
    try {
      // Method 1: Create blob and download
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.caseNumber}_${document.documentType}.txt`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback method: Create data URL
      try {
        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute("href", dataStr);
        downloadLink.setAttribute("download", `${document.caseNumber}_${document.documentType}.txt`);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (fallbackError) {
        console.error('Fallback download error:', fallbackError);
        alert('Could not download file. Please try again or check your browser settings.');
        return;
      }
    }
    
    // Add to submitted requests
    const newRequest = {
      id: Date.now(),
      service: 'Search Document',
      documentId: documentId,
      documentName: `${document.caseNumber}_${document.documentType}.txt`,
      caseNumber: document.caseNumber,
      requestedAt: new Date().toLocaleString(),
      status: 'Downloaded',
      referenceId: `DOC-DOWNLOAD-${Date.now().toString().slice(-6)}`,
      action: 'download',
      processingTime: 'Immediate'
    };
    
    setSubmittedRequests(prev => [newRequest, ...prev]);
    
    // Show success message
    setTimeout(() => {
      alert(`✅ Document downloaded!\n\nFile: ${document.caseNumber}_${document.documentType}.txt\nReference: ${newRequest.referenceId}\n\nCheck your Downloads folder.`);
    }, 200);
  };

  // Updated handleRequestAccess to handle both access request and download
  const handleRequestAccess = (documentId) => {
    const document = storedCourtDocuments.find(doc => doc.id === documentId);
    if (!document) return;
    
    if (document.accessLevel === 'public') {
      // For public documents, directly download
      handleDownloadDocument(documentId);
    } else {
      // For restricted documents, request access
      const newRequest = {
        id: Date.now(),
        service: 'Search Document',
        documentId: documentId,
        documentName: document.fileName,
        caseNumber: document.caseNumber,
        requestedAt: new Date().toLocaleString(),
        status: 'Pending Approval',
        referenceId: `DOC-REQ-${Date.now().toString().slice(-6)}`,
        formData: { ...formData },
        processingTime: '1-2 business days',
        action: 'access_request'
      };
      
      setSubmittedRequests(prev => [newRequest, ...prev]);
      
      alert(`Access request submitted for ${document.fileName}\n\nReference ID: ${newRequest.referenceId}\n\nYour request will be reviewed within 1-2 business days.`);
    }
  };

  // Search function for document search
  const handleSearchDocuments = () => {
    if (!formData.searchCaseNumber && !formData.searchKeywords) {
      alert('Please enter either a case number or keywords to search');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let results = storedCourtDocuments;
      
      // Filter by case number if provided
      if (formData.searchCaseNumber) {
        results = results.filter(doc => 
          doc.caseNumber.toLowerCase().includes(formData.searchCaseNumber.toLowerCase())
        );
      }
      
      // Filter by document type if provided
      if (formData.searchDocumentType) {
        results = results.filter(doc => 
          doc.documentType === formData.searchDocumentType
        );
      }
      
      // Filter by case year if provided
      if (formData.searchCaseYear) {
        results = results.filter(doc => 
          doc.caseYear === parseInt(formData.searchCaseYear)
        );
      }
      
      // Filter by keywords if provided
      if (formData.searchKeywords) {
        const keywords = formData.searchKeywords.toLowerCase().split(',').map(k => k.trim());
        results = results.filter(doc => 
          keywords.some(keyword => 
            doc.keywords.some(k => k.toLowerCase().includes(keyword)) ||
            doc.caseTitle.toLowerCase().includes(keyword) ||
            doc.description.toLowerCase().includes(keyword)
          )
        );
      }
      
      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length === 0) {
        alert('No documents found matching your search criteria.');
      } else {
        // Auto-advance to step 2
        setStep(2);
      }
    }, 1000);
  };

  // New function to view appointment details
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    if (step === 1) {
      setStep(2);
    }
  };

  // New function to filter appointments by date
  const filterAppointmentsByDate = (date) => {
    if (!date) return mockAppointments;
    return mockAppointments.filter(apt => apt.scheduledDate === date);
  };

  const handleSubmitApplication = async () => {
    if (service.name === 'Arbitration Fee') {
      if (!formData.courtCauseType) { alert('Please select the type of court case.'); return; }
      if (!formData.claimAmount)    { alert('Please enter the claim amount.');         return; }
      if (!formData.caseTitle)      { alert('Please enter the case title.');            return; }
    }

    if (service.name === 'Search Document') {
      const selectedDocs = searchResults.filter(doc => formData[`selectDoc_${doc.id}`]);
      if (selectedDocs.length === 0) { alert('Please select at least one document.'); return; }
      selectedDocs.forEach(doc => handleRequestAccess(doc.id));
      setSearchResults([]); setFormData({}); setStep(1);
      return;
    }

    if (service.name !== 'Arbitration Fee' && config.showDocumentUpload && uploadedFiles.length === 0) {
      alert('Please upload at least one document before submitting.'); return;
    }
    if (service.name === 'Daily Appointment' && (!formData.appointmentDate || !formData.appointmentTime)) {
      alert('Please select both date and time for the appointment.'); return;
    }
    if (service.name === 'Complaint Form' && !formData.complaintDescription) {
      alert('Please describe your complaint in detail.'); return;
    }
    if (service.name === 'FeedBack' && feedbackRating === 0) {
      alert('Please provide a rating for the service.'); return;
    }

    // Build FormData — map camelCase UI fields to snake_case backend fields
    const payload = new FormData();
    payload.append('service_name', service.name);

    // Common fields
    if (formData.caseNumber)    payload.append('case_number',    formData.caseNumber);
    if (formData.caseTitle)     payload.append('case_title',     formData.caseTitle);
    if (formData.description)   payload.append('description',    formData.description);
    if (formData.submissionType) payload.append('submission_type', formData.submissionType);

    // Arbitration Fee
    if (service.name === 'Arbitration Fee') {
      payload.append('court_cause_type', formData.courtCauseType || '');
      payload.append('claim_amount',     (formData.claimAmount || '0').replace(/,/g, ''));
      payload.append('calculated_fee',   String(paymentAmount));
    }

    // Daily Appointment
    if (service.name === 'Daily Appointment') {
      payload.append('appointment_date',  formData.appointmentDate  || '');
      payload.append('appointment_time',  formData.appointmentTime  || '');
      payload.append('purpose',           formData.purpose          || '');
      payload.append('department',        formData.department       || '');
      // Map appointmentNotes → additional_notes
      payload.append('additional_notes',  formData.appointmentNotes || formData.additionalNotes || '');
    }

    // Complaint Form
    if (service.name === 'Complaint Form') {
      payload.append('complaint_type',  formData.complaintType  || '');
      // Use complaintDescription as both subject and description (no separate subject field)
      const desc = formData.complaintDescription || '';
      payload.append('subject',         desc.substring(0, 255) || 'Complaint');
      payload.append('description',     desc);
      payload.append('against_whom',    formData.againstWhom    || '');
      payload.append('incident_date',   formData.incidentDate   || '');
    }

    // Feedback
    if (service.name === 'FeedBack') {
      payload.append('service_rated', formData.serviceRated || 'General');
      payload.append('rating',        String(feedbackRating));
      payload.append('comment',       formData.comment      || '');
      payload.append('suggestions',   formData.suggestions  || '');
    }

    // Uploaded files
    uploadedFiles.forEach((f) => {
      if (f.fileObject) payload.append('documents[]', f.fileObject);
    });

    try {
      const result = await submitServiceRequest(service.name, payload);

      const refId = `${service.name.slice(0, 3).toUpperCase()}-${String(result.id).slice(-8)}`;
      setSubmittedRequests((prev) => [
        {
          id: result.id,
          service: service.name,
          submittedAt: result.created_at || new Date().toLocaleString(),
          status: result.status || 'submitted',
          referenceId: refId,
          processingTime: config.processingTime,
        },
        ...prev,
      ]);

      setUploadedFiles([]);
      setFormData({});
      setFeedbackRating(0);
      setPaymentAmount(0);
      setStep(1);

      if (onSubmitted) onSubmitted(); // refresh dashboard stats

      alert(`✅ ${service.name} submitted!\nReference ID: ${refId}`);
    } catch (error) {
      console.error('Submission error:', error);
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : 'Submission failed. Please make sure you are logged in and try again.';
      alert(msg);
    }
  };

  // Handle continue button for search document
  const handleContinue = () => {
    if (service.name === 'Search Document' && step === 1) {
      // In step 1, we need to perform search first
      if (!formData.searchCaseNumber && !formData.searchKeywords) {
        alert('Please enter search criteria first');
        return;
      }
      handleSearchDocuments();
    } else {
      setStep(step + 1);
    }
  };

  const renderDocumentSidebar = () => (
    <div className="documents-sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <div className="section-icon">📂</div>
          <h3>Uploaded Documents</h3>
        </div>
        {uploadedFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📎</div>
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="uploaded-files-sidebar">
            {uploadedFiles.map(file => (
              <div key={file.id} className="file-item-sidebar">
                <div className="file-icon">
                  {file.type.includes('pdf') ? '📄' : 
                   file.type.includes('image') ? '🖼️' : 
                   file.type.includes('word') ? '📝' : '📎'}
                </div>
                <div className="file-info-sidebar">
                  <strong className="file-name">{file.name}</strong>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">{file.uploadedAt.split(',')[0]}</span>
                  </div>
                </div>
                <button 
                  className="btn-icon remove-btn" 
                  onClick={() => handleRemoveFile(file.id)}
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <div className="section-icon">✅</div>
          <h3>Submitted Requests</h3>
        </div>
        {submittedRequests.filter(req => req.service === service.name).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No requests submitted yet</p>
          </div>
        ) : (
          <div className="submitted-requests">
            {submittedRequests
              .filter(req => req.service === service.name)
              .slice(0, 5) // Show only latest 5
              .map(request => (
                <div key={request.id} className="request-item">
                  <div className="request-header">
                    <span className="request-ref">{request.referenceId}</span>
                    <span className={`request-status ${request.status.toLowerCase().replace(' ', '-')}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-meta">
                    <span>{request.submittedAt || request.requestedAt}</span>
                    <span className="request-action">
                      {request.action === 'download' ? '📥 Downloaded' : '📋 Requested'}
                    </span>
                  </div>
                  {request.documentName && (
                    <div className="request-preview">
                      <span className="file-preview-item">📄 {request.documentName}</span>
                    </div>
                  )}
                  {request.caseNumber && (
                    <div className="request-case">
                      <span>Case: {request.caseNumber}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep1Content = () => {
    if (service.name === 'Daily Appointment') {
      const filteredAppointments = filterAppointmentsByDate(formData.viewDate);
      
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Daily Appointments</h2>
            <p className="step-description">View court appointments for the selected date</p>
          </div>
          
          <div className="section-card">
            <div className="appointments-header">
              <h3>Court Appointments Schedule</h3>
              <div className="date-filter">
                <label className="form-label">View Date:</label>
                <input 
                  className="form-input" 
                  type="date" 
                  name="viewDate" 
                  value={formData.viewDate || new Date().toISOString().split('T')[0]}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="appointments-summary">
              <div className="summary-card">
                <div className="summary-icon">📅</div>
                <div className="summary-content">
                  <span className="summary-count">{filteredAppointments.length}</span>
                  <span className="summary-label">Total Appointments</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⚖️</div>
                <div className="summary-content">
                  <span className="summary-count">
                    {filteredAppointments.filter(a => a.status === 'Scheduled').length}
                  </span>
                  <span className="summary-label">Scheduled</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div className="summary-content">
                  <span className="summary-count">
                    {filteredAppointments.filter(a => a.status === 'Completed').length}
                  </span>
                  <span className="summary-label">Completed</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🔄</div>
                <div className="summary-content">
                  <span className="summary-count">
                    {filteredAppointments.filter(a => a.status === 'In Progress').length}
                  </span>
                  <span className="summary-label">In Progress</span>
                </div>
              </div>
            </div>
            
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h4>No appointments scheduled</h4>
                <p>No court appointments found for the selected date.</p>
              </div>
            ) : (
              <div className="appointments-list">
                <div className="list-header">
                  <div className="header-cell time-column">Time</div>
                  <div className="header-cell case-column">Case</div>
                  <div className="header-cell room-column">Court Room</div>
                  <div className="header-cell judge-column">Judge</div>
                  <div className="header-cell status-column">Status</div>
                  <div className="header-cell action-column">Action</div>
                </div>
                
                <div className="list-body">
                  {filteredAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-row">
                      <div className="cell time-column">
                        <div className="appointment-time">{appointment.scheduledTime}</div>
                        <div className="appointment-duration">{appointment.duration}</div>
                      </div>
                      <div className="cell case-column">
                        <div className="case-number">{appointment.caseNumber}</div>
                        <div className="case-title">{appointment.caseTitle}</div>
                        <div className="case-purpose">Purpose: {appointment.purpose}</div>
                      </div>
                      <div className="cell room-column">
                        <div className="court-room">{appointment.courtRoom}</div>
                      </div>
                      <div className="cell judge-column">
                        <div className="judge-name">{appointment.judge}</div>
                      </div>
                      <div className="cell status-column">
                        <span className={`status-badge status-${appointment.status.toLowerCase().replace(' ', '-')}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="cell action-column">
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="section-card">
            <h3>Court Schedule Information</h3>
            <div className="schedule-info">
              <div className="info-item">
                <div className="info-icon">🕘</div>
                <div className="info-content">
                  <strong>Court Hours</strong>
                  <p>Monday - Friday: 8:30 AM - 5:00 PM</p>
                  <p>Saturday: 9:00 AM - 1:00 PM (Emergency only)</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">📍</div>
                <div className="info-content">
                  <strong>Court Locations</strong>
                  <p>Main Court Building - 123 Justice Avenue</p>
                  <p>Branch Courts - Various locations across the city</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">📞</div>
                <div className="info-content">
                  <strong>Contact Information</strong>
                  <p>Schedule Office: +251-11-123-4567</p>
                  <p>Email: schedule@courts.gov.et</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (service.name === 'Arbitration Fee') {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Case Information</h2>
            <p className="step-description">Enter case details and amount for fee calculation</p>
          </div>
          
          <div className="section-card">
            <h3>Case Details</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Case Title *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="caseTitle" 
                  value={formData.caseTitle || ''}
                  onChange={handleInputChange}
                  placeholder="Enter case title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Court Cause Type *</label>
                <select 
                  className="form-select" 
                  name="courtCauseType" 
                  value={formData.courtCauseType || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select cause type</option>
                  {Object.keys(courtCauseTypes).map(causeType => (
                    <option key={causeType} value={causeType}>{causeType}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Claim Amount (ETB) *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="claimAmount" 
                  value={formData.claimAmount || ''}
                  onChange={handleClaimAmountChange}
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Calculated Court Fee</label>
                <div className={`amount-display ${paymentAmount > 0 ? 'has-amount' : ''}`}>
                  {paymentAmount > 0 ? `ETB ${paymentAmount.toLocaleString()}` : 'Enter amount to calculate'}
                </div>
              </div>
            </div>
            
            {formData.courtCauseType && (
              <div className="case-type-info">
                <h4>Selected: {formData.courtCauseType}</h4>
                <p>{courtCauseTypes[formData.courtCauseType].description}</p>
              </div>
            )}
            
            {paymentAmount > 0 && (
              <div className="fee-breakdown">
                <h4>Fee Breakdown</h4>
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Case Type:</span>
                    <span className="breakdown-value">{formData.courtCauseType || 'Not selected'}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Claim Amount:</span>
                    <span className="breakdown-value">
                      {formData.claimAmount ? `ETB ${parseFloat(formData.claimAmount.replace(/,/g, '')).toLocaleString()}` : 'Not entered'}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Court Fee:</span>
                    <span className="breakdown-value fee-amount">ETB {paymentAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="section-card">
            <h3>Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Plaintiff/Applicant Name *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="plaintiffName" 
                  value={formData.plaintiffName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Defendant/Respondent Name *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="defendantName" 
                  value={formData.defendantName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Case Description</label>
                <textarea 
                  className="form-textarea" 
                  name="caseDescription" 
                  value={formData.caseDescription || ''}
                  onChange={handleInputChange}
                  rows="3" 
                  placeholder="Brief description of the case"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (service.name === 'Search Document') {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Search Court Documents</h2>
            <p className="step-description">Enter search criteria to find court documents</p>
          </div>
          
          <div className="section-card">
            <h3>Search Criteria</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Case Number</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="searchCaseNumber" 
                  value={formData.searchCaseNumber || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., ETB-2024-001"
                />
                <small className="form-hint">Enter full or partial case number</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select 
                  className="form-select" 
                  name="searchDocumentType" 
                  value={formData.searchDocumentType || ''}
                  onChange={handleInputChange}
                >
                  <option value="">All document types</option>
                  <option value="judgment">Judgment</option>
                  <option value="order">Court Order</option>
                  <option value="filing">Case Filing</option>
                  <option value="evidence">Evidence</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Case Year</label>
                <input 
                  className="form-input" 
                  type="number" 
                  name="searchCaseYear" 
                  value={formData.searchCaseYear || ''}
                  onChange={handleInputChange}
                  placeholder="YYYY"
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div className="form-group full-width">
                <label className="form-label">Search Keywords</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="searchKeywords" 
                  value={formData.searchKeywords || ''}
                  onChange={handleInputChange}
                  placeholder="Enter keywords separated by commas (e.g., contract, civil, property)"
                />
                <small className="form-hint">Search in document titles, descriptions, and keywords</small>
              </div>
            </div>
            
            <div className="search-actions">
              <button 
                className="btn-primary" 
                onClick={handleSearchDocuments}
                disabled={isSearching || (!formData.searchCaseNumber && !formData.searchKeywords)}
              >
                {isSearching ? (
                  <>
                    <div className="spinner-small"></div>
                    Searching...
                  </>
                ) : (
                  'Search Documents'
                )}
              </button>
            </div>
          </div>
          
          <div className="section-card">
            <h3>Search Tips</h3>
            <div className="tips-list">
              <div className="tip-item">
                <div className="tip-icon">🔍</div>
                <div className="tip-content">
                  <strong>Use Case Number</strong>
                  <p>Enter exact case numbers like "ETB-2024-001" for precise results</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📁</div>
                <div className="tip-content">
                  <strong>Filter by Document Type</strong>
                  <p>Select specific document types to narrow your search</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">🔑</div>
                <div className="tip-content">
                  <strong>Use Keywords</strong>
                  <p>Search by case type, judge name, or relevant terms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Service Requirements</h2>
          <p className="step-description">Review what's needed to complete this service</p>
        </div>
        
        <div className="requirements-grid">
          {config.showDocumentUpload && (
            <div className="requirement-card">
              <div className="card-header">
                <div className="card-icon">📋</div>
                <h3>Required Documents</h3>
              </div>
              <div className="documents-list">
                {requiredDocuments.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="document-check">
                      <div className={`check-circle ${getDocumentStatus(doc.name)}`}>
                        {getDocumentStatus(doc.name) === 'uploaded' ? '✓' : ''}
                      </div>
                    </div>
                    <div className="document-details">
                      <div className="document-name">
                        <span>{doc.name}</span>
                        {doc.required && <span className="badge required">Required</span>}
                      </div>
                      <p className="document-description">{doc.description}</p>
                    </div>
                    <div className="document-type">
                      <span className={`type-tag ${doc.required ? 'mandatory' : 'optional'}`}>
                        {doc.required ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="requirement-card">
            <div className="card-header">
              <div className="card-icon">⏱️</div>
              <h3>Processing Time</h3>
            </div>
            <div className="processing-info">
              <div className="time-display">{config.processingTime}</div>
              <p className="time-note">Your request will be processed according to court procedures</p>
            </div>
          </div>
          
          <div className="requirement-card">
            <div className="card-header">
              <div className="card-icon">📝</div>
              <h3>Service Process</h3>
            </div>
            <div className="process-list">
              {steps.map(step => (
                <div key={step.number} className="process-step-item">
                  <div className="step-indicator">{step.number}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2Content = () => {
    if (service.name === 'Daily Appointment' && selectedAppointment) {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Appointment Details</h2>
            <p className="step-description">Detailed information about the court appointment</p>
            <button 
              className="btn-secondary btn-back"
              onClick={() => {
                setSelectedAppointment(null);
                setStep(1);
              }}
            >
              ← Back to Appointments List
            </button>
          </div>
          
          <div className="appointment-details-container">
            <div className="section-card">
              <div className="appointment-header">
                <div className="appointment-badge">
                  <span className="badge-icon">⚖️</span>
                  <span className="badge-text">{selectedAppointment.purpose}</span>
                </div>
                <div className="appointment-status">
                  <span className={`status-large status-${selectedAppointment.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
              
              <div className="appointment-info-grid">
                <div className="info-card">
                  <h4>Case Information</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Case Number:</span>
                      <span className="info-value">{selectedAppointment.caseNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Case Title:</span>
                      <span className="info-value">{selectedAppointment.caseTitle}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Purpose:</span>
                      <span className="info-value">{selectedAppointment.purpose}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-card">
                  <h4>Schedule Details</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{selectedAppointment.scheduledDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Time:</span>
                      <span className="info-value">{selectedAppointment.scheduledTime}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration:</span>
                      <span className="info-value">{selectedAppointment.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-card">
                  <h4>Court Information</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Court Room:</span>
                      <span className="info-value">{selectedAppointment.courtRoom}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Presiding Judge:</span>
                      <span className="info-value">{selectedAppointment.judge}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-card">
                  <h4>Parties Involved</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Parties:</span>
                      <span className="info-value">
                        {selectedAppointment.parties.join(', ')}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Representing Lawyer:</span>
                      <span className="info-value">{selectedAppointment.lawyer}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="notes-section">
                <h4>Notes & Additional Information</h4>
                <div className="notes-content">
                  <p>{selectedAppointment.notes}</p>
                </div>
              </div>
            </div>
            
            <div className="section-card">
              <h3>Related Information</h3>
              <div className="related-links">
                <button className="related-link">
                  <span className="link-icon">📄</span>
                  <span className="link-text">View Case Documents</span>
                </button>
                <button className="related-link">
                  <span className="link-icon">📍</span>
                  <span className="link-text">Court Location Map</span>
                </button>
                <button className="related-link">
                  <span className="link-icon">📋</span>
                  <span className="link-text">Courtroom Procedures</span>
                </button>
                <button className="related-link">
                  <span className="link-icon">📞</span>
                  <span className="link-text">Contact Court Clerk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (service.name === 'Search Document') {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Search Results</h2>
            <p className="step-description">
              Found {searchResults.length} document{searchResults.length !== 1 ? 's' : ''} matching your criteria
            </p>
          </div>
          
          <div className="section-card">
            <div className="results-header">
              <h3>Documents Found</h3>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setSearchResults([]);
                  setStep(1);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                New Search
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="empty-results">
                <div className="empty-icon">🔍</div>
                <h4>No documents found</h4>
                <p>Try different search criteria or broaden your search</p>
                <button 
                  className="btn-secondary" 
                  onClick={() => setStep(1)}
                >
                  Back to Search
                </button>
              </div>
            ) : (
              <div className="search-results-list">
                {searchResults.map(doc => (
                  <div key={doc.id} className="document-result-card">
                    <div className="document-header">
                      <div className="doc-icon">
                        {doc.documentType === 'judgment' ? '⚖️' :
                         doc.documentType === 'order' ? '📜' :
                         doc.documentType === 'filing' ? '📁' :
                         doc.documentType === 'evidence' ? '🖼️' :
                         doc.documentType === 'certificate' ? '📃' : '📄'}
                      </div>
                      <div className="doc-title-section">
                        <h4>{doc.caseTitle}</h4>
                        <div className="doc-meta">
                          <span className="case-number">Case: {doc.caseNumber}</span>
                          <span className="doc-type">{doc.documentType}</span>
                          <span className="doc-size">{doc.fileSize}</span>
                          <span className="doc-year">Year: {doc.caseYear}</span>
                        </div>
                      </div>
                      <div className="access-badge">
                        <span className={`access-level ${doc.accessLevel}`}>
                          {doc.accessLevel === 'public' ? 'Public Access' : 'Restricted Access'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="document-details">
                      <p className="doc-description">{doc.description}</p>
                      
                      <div className="doc-info-grid">
                        <div className="info-item">
                          <span className="info-label">Court Location:</span>
                          <span className="info-value">{doc.courtLocation}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Presiding Judge:</span>
                          <span className="info-value">{doc.judgeName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Upload Date:</span>
                          <span className="info-value">{doc.uploadDate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">File Name:</span>
                          <span className="info-value">{doc.fileName}</span>
                        </div>
                      </div>
                      
                      <div className="keywords-section">
                        <span className="keywords-label">Keywords:</span>
                        <div className="keywords-list">
                          {doc.keywords.map((keyword, index) => (
                            <span key={index} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="document-actions">
                      <label className="checkbox-container select-doc">
                        <input 
                          type="checkbox" 
                          name={`selectDoc_${doc.id}`}
                          checked={!!formData[`selectDoc_${doc.id}`]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [`selectDoc_${doc.id}`]: e.target.checked
                          }))}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">Select for access request</span>
                      </label>
                      
                      <div className="action-buttons">
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            // Show preview in alert
                            alert(`PREVIEW: ${doc.fileName}\n\nCase: ${doc.caseNumber}\nTitle: ${doc.caseTitle}\nDescription: ${doc.description}\n\nThis is a preview of the document content.`);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          Preview
                        </button>
                        <button 
                          className={`btn-primary ${doc.accessLevel === 'public' ? '' : 'btn-restricted'}`}
                          onClick={() => handleRequestAccess(doc.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          {doc.accessLevel === 'public' ? 'Download' : 'Request Access'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="selection-summary">
              <div className="summary-content">
                <span className="selected-count">
                  {Object.keys(formData).filter(key => key.startsWith('selectDoc_') && formData[key]).length} document(s) selected
                </span>
                <button 
                  className="btn-submit"
                  onClick={() => setStep(3)}
                  disabled={Object.keys(formData).filter(key => key.startsWith('selectDoc_') && formData[key]).length === 0}
                >
                  Continue with Selected Documents
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (service.name === 'Arbitration Fee') {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Payment Information</h2>
            <p className="step-description">Complete payment details for court fee</p>
          </div>
          
          <div className="section-card">
            <div className="payment-summary-header">
              <h3>Payment Summary</h3>
              <div className="payment-amount-display">
                <span className="amount-label">Total Amount Due:</span>
                <span className="total-amount">ETB {(paymentAmount + 50).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="payment-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Court Cause Fee:</span>
                <span className="breakdown-value">ETB {paymentAmount.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Processing Fee:</span>
                <span className="breakdown-value">ETB 50</span>
              </div>
              <div className="breakdown-total">
                <span className="total-label">Total:</span>
                <span className="total-value">ETB {(paymentAmount + 50).toLocaleString()}</span>
              </div>
            </div>
            
            <h3>Payment Method</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select 
                  className="form-select" 
                  name="paymentMethod" 
                  value={formData.paymentMethod || ''}
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile">Mobile Banking</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash at Court</option>
                </select>
              </div>
              
              {formData.paymentMethod === 'bank' && (
                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    name="accountNumber" 
                    value={formData.accountNumber || ''}
                    onChange={handleInputChange} 
                    placeholder="Enter account number" 
                  />
                </div>
              )}
              
              {formData.paymentMethod === 'mobile' && (
                <div className="form-group">
                  <label className="form-label">Mobile Money Number</label>
                  <input 
                    className="form-input" 
                    type="tel" 
                    name="mobileNumber" 
                    value={formData.mobileNumber || ''}
                    onChange={handleInputChange} 
                    placeholder="Enter mobile number" 
                  />
                </div>
              )}
              
              {formData.paymentMethod === 'card' && (
                <div className="form-group">
                  <label className="form-label">Card Last 4 Digits</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    name="cardLastDigits" 
                    value={formData.cardLastDigits || ''}
                    onChange={handleInputChange} 
                    placeholder="Last 4 digits" 
                    maxLength="4"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="section-card">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="contactName" 
                  value={formData.contactName || ''}
                  onChange={handleInputChange} 
                  placeholder="Enter your full name" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  className="form-input" 
                  type="email" 
                  name="contactEmail" 
                  value={formData.contactEmail || ''}
                  onChange={handleInputChange} 
                  placeholder="Enter your email" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  className="form-input" 
                  type="tel" 
                  name="contactPhone" 
                  value={formData.contactPhone || ''}
                  onChange={handleInputChange} 
                  placeholder="Enter your phone number" 
                  required
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 2 content for other services
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>{service.name} Details</h2>
          <p className="step-description">Complete the required information</p>
        </div>
        
        {config.showDocumentUpload && (
          <div className="upload-section">
            <div className="section-card">
              <div className="section-header">
                <h3>Upload Documents</h3>
                <p className="section-subtitle">Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)</p>
              </div>
              
              <div className="upload-area" onClick={handleFileSelect}>
                <div className="upload-box">
                  <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="upload-title">Drop files here or click to browse</p>
                  <p className="upload-subtitle">Select one or multiple files</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="files-grid">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="file-card">
                        <div className="file-icon">
                          {file.type.includes('pdf') ? '📄' : 
                           file.type.includes('image') ? '🖼️' : 
                           file.type.includes('word') ? '📝' : '📎'}
                        </div>
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-details">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.uploadedAt}</span>
                          </div>
                        </div>
                        <button 
                          className="btn-icon remove-btn"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of step 2 for other services */}
        {config.showAppointment && service.name === 'Daily Appointment' && (
          <div className="form-section">
            <div className="section-card">
              <h3>Schedule Appointment</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Select Date *</label>
                  <input 
                    className="form-input" 
                    type="date" 
                    name="appointmentDate" 
                    onChange={handleInputChange} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Select Time *</label>
                  <select className="form-select" name="appointmentTime" onChange={handleInputChange} required>
                    <option value="">Select time slot</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Purpose of Visit *</label>
                  <select className="form-select" name="purpose" onChange={handleInputChange} required>
                    <option value="">Select purpose</option>
                    <option value="case_inquiry">Case Inquiry</option>
                    <option value="document_submission">Document Submission</option>
                    <option value="hearing">Case Hearing</option>
                    <option value="consultation">Legal Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Case Number (if applicable)</label>
                  <input className="form-input" type="text" name="appointmentCaseNumber" onChange={handleInputChange} placeholder="Enter case number" />
                </div>
              </div>
            </div>
          </div>
        )}

        {config.showComplaintForm && service.name === 'Complaint Form' && (
          <div className="form-section">
            <div className="section-card">
              <h3>Complaint Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Complaint Type *</label>
                  <select className="form-select" name="complaintType" onChange={handleInputChange} required>
                    <option value="">Select type</option>
                    <option value="procedure">Court Procedure</option>
                    <option value="staff">Staff Behavior</option>
                    <option value="facility">Facility Issue</option>
                    <option value="delay">Service Delay</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Incident</label>
                  <input className="form-input" type="date" name="incidentDate" onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Description *</label>
                  <textarea 
                    className="form-textarea" 
                    name="complaintDescription" 
                    onChange={handleInputChange} 
                    rows="4" 
                    placeholder="Describe your complaint in detail including date, time, people involved, and what happened"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Case Number (if related)</label>
                  <input className="form-input" type="text" name="complaintCaseNumber" onChange={handleInputChange} placeholder="Enter case number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department/Office</label>
                  <input className="form-input" type="text" name="department" onChange={handleInputChange} placeholder="Enter department/office name" />
                </div>
              </div>
            </div>
          </div>
        )}

        {config.showFeedback && service.name === 'FeedBack' && (
          <div className="form-section">
            <div className="section-card">
              <h3>Your Feedback</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service to Review *</label>
                  <select className="form-select" name="serviceRated" onChange={handleInputChange} required>
                    <option value="">Select service</option>
                    {Object.keys(serviceConfigs).map(serviceName => (
                      <option key={serviceName} value={serviceName}>{serviceName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating *</label>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        className={`star-btn ${star <= feedbackRating ? 'active' : ''}`}
                        onClick={() => handleRatingClick(star)}
                        type="button"
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-text">
                      {feedbackRating > 0 ? `${feedbackRating} star${feedbackRating > 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Comments</label>
                  <textarea 
                    className="form-textarea" 
                    name="comment" 
                    onChange={handleInputChange} 
                    rows="4" 
                    placeholder="Share your experience, suggestions, or any issues you encountered"
                  ></textarea>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Suggestions for Improvement</label>
                  <textarea
                    className="form-textarea"
                    name="suggestions"
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any suggestions to improve our services?"
                  ></textarea>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Would you recommend this service to others?</label>
                  <div className="recommendation-buttons">
                    <button 
                      type="button"
                      className={`recommend-btn ${formData.recommend === 'yes' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, recommend: 'yes' }))}
                    >
                      Yes
                    </button>
                    <button 
                      type="button"
                      className={`recommend-btn ${formData.recommend === 'no' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, recommend: 'no' }))}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {config.showLocation && service.name === 'Daily Appointment' && (
          <div className="form-section">
            <div className="section-card">
              <h3>Location Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Court Location *</label>
                  <select className="form-select" name="courtLocation" onChange={handleInputChange} required>
                    <option value="">Select court location</option>
                    <option value="main">Main Court Building</option>
                    <option value="branch1">North Branch Court</option>
                    <option value="branch2">South Branch Court</option>
                    <option value="branch3">East Branch Court</option>
                    <option value="branch4">West Branch Court</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department/Section</label>
                  <input className="form-input" type="text" name="department" onChange={handleInputChange} placeholder="Enter department/section" />
                </div>
              </div>
            </div>
          </div>
        )}

        {config.showContact && service.name === 'Complaint Form' && (
          <div className="form-section">
            <div className="section-card">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" name="fullName" onChange={handleInputChange} required placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" name="email" onChange={handleInputChange} required placeholder="Enter your email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" type="tel" name="phone" onChange={handleInputChange} required placeholder="Enter your phone number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Contact Method</label>
                  <select className="form-select" name="contactMethod" onChange={handleInputChange}>
                    <option value="">Select method</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="uploading-overlay">
            <div className="uploading-content">
              <div className="spinner"></div>
              <p>Uploading files...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3Content = () => {
    if (service.name === 'Daily Appointment') {
      // This would be for scheduling a new appointment
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Schedule New Appointment</h2>
            <p className="step-description">Book a new court appointment</p>
          </div>
          
          <div className="section-card">
            <h3>Appointment Booking</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input 
                  className="form-input" 
                  type="date" 
                  name="appointmentDate" 
                  onChange={handleInputChange} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time *</label>
                <select className="form-select" name="appointmentTime" onChange={handleInputChange} required>
                  <option value="">Select time slot</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Purpose of Visit *</label>
                <select className="form-select" name="purpose" onChange={handleInputChange} required>
                  <option value="">Select purpose</option>
                  <option value="case_inquiry">Case Inquiry</option>
                  <option value="document_submission">Document Submission</option>
                  <option value="hearing">Case Hearing</option>
                  <option value="consultation">Legal Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label className="form-label">Case Number (if applicable)</label>
                <input className="form-input" type="text" name="appointmentCaseNumber" onChange={handleInputChange} placeholder="Enter case number" />
              </div>
            </div>
          </div>
          
          <div className="section-card">
            <h3>Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  name="appointmentName" 
                  value={formData.appointmentName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  className="form-input" 
                  type="email" 
                  name="appointmentEmail" 
                  value={formData.appointmentEmail || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  className="form-input" 
                  type="tel" 
                  name="appointmentPhone" 
                  value={formData.appointmentPhone || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Additional Notes</label>
                <textarea 
                  className="form-textarea" 
                  name="appointmentNotes" 
                  value={formData.appointmentNotes || ''}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional information for the court staff"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="section-card">
            <h3>Court Location</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Select Court Location *</label>
                <select 
                  className="form-select" 
                  name="appointmentCourtLocation" 
                  value={formData.appointmentCourtLocation || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select court location</option>
                  <option value="main">Main Court Building - 123 Justice Avenue</option>
                  <option value="north">North Branch Court - 456 North Street</option>
                  <option value="south">South Branch Court - 789 South Road</option>
                  <option value="east">East Branch Court - 101 East Avenue</option>
                  <option value="west">West Branch Court - 202 West Boulevard</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (service.name === 'Search Document') {
      const selectedDocs = searchResults.filter(doc => formData[`selectDoc_${doc.id}`]);
      
      return (
        <div className="step-content">
          <div className="step-header">
            <h2>Request Document Access</h2>
            <p className="step-description">Review and submit your document access requests</p>
          </div>
          
          <div className="section-card">
            <div className="request-summary-header">
              <h3>Access Request Summary</h3>
              <div className="request-count">
                <span className="count-label">Documents Selected:</span>
                <span className="count-value">{selectedDocs.length}</span>
              </div>
            </div>
            
            <div className="selected-documents-list">
              <h4>Selected Documents</h4>
              {selectedDocs.map(doc => (
                <div key={doc.id} className="selected-doc-item">
                  <div className="selected-doc-icon">
                    {doc.documentType === 'judgment' ? '⚖️' :
                     doc.documentType === 'order' ? '📜' :
                     doc.documentType === 'filing' ? '📁' :
                     doc.documentType === 'evidence' ? '🖼️' :
                     doc.documentType === 'certificate' ? '📃' : '📄'}
                  </div>
                  <div className="selected-doc-details">
                    <div className="selected-doc-title">
                      <strong>{doc.fileName}</strong>
                      <span className={`access-badge-small ${doc.accessLevel}`}>
                        {doc.accessLevel === 'public' ? 'Public' : 'Restricted'}
                      </span>
                    </div>
                    <div className="selected-doc-info">
                      <span>Case: {doc.caseNumber}</span>
                      <span>Type: {doc.documentType}</span>
                      <span>Size: {doc.fileSize}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="access-requirements">
              <h4>Access Requirements</h4>
              <div className="requirements-list">
                <div className="requirement-item">
                  <div className="req-icon">✅</div>
                  <div className="req-content">
                    <strong>Public Documents</strong>
                    <p>Available for immediate download after request</p>
                  </div>
                </div>
                <div className="requirement-item">
                  <div className="req-icon">⏳</div>
                  <div className="req-content">
                    <strong>Restricted Documents</strong>
                    <p>Require court approval within 1-2 business days</p>
                  </div>
                </div>
                <div className="requirement-item">
                  <div className="req-icon">📋</div>
                  <div className="req-content">
                    <strong>Authorization Required</strong>
                    <p>May require additional authorization for sensitive cases</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-section">
              <h4>Contact Information for Access Requests</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    name="requesterName" 
                    value={formData.requesterName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship to Case *</label>
                  <select 
                    className="form-select" 
                    name="relationship" 
                    value={formData.relationship || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="party">Party to the case</option>
                    <option value="lawyer">Legal representative</option>
                    <option value="researcher">Researcher</option>
                    <option value="public">Member of public</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    className="form-input" 
                    type="email" 
                    name="requesterEmail" 
                    value={formData.requesterEmail || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    className="form-input" 
                    type="tel" 
                    name="requesterPhone" 
                    value={formData.requesterPhone || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Purpose of Access *</label>
                  <textarea 
                    className="form-textarea" 
                    name="accessPurpose" 
                    value={formData.accessPurpose || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Explain why you need access to these documents"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="confirmation-box">
            <label className="checkbox-container">
              <input type="checkbox" id="confirmAccess" required />
              <span className="checkmark"></span>
              <span className="checkbox-label">
                I confirm that I have a legitimate need to access these documents and will use them only for lawful purposes
              </span>
            </label>
          </div>
          
          <div className="notice-card">
            <div className="notice-header">
              <div className="notice-icon">⚠️</div>
              <h4>Important Notice</h4>
            </div>
            <p className="notice-text">
              By submitting this request, you acknowledge that unauthorized access to court documents is prohibited by law. 
              Restricted documents require court approval and may be denied if proper authorization is not provided. 
              You will receive email notifications about the status of your access requests.
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Review & Submit</h2>
          <p className="step-description">Verify all information before submission</p>
        </div>

        {/* FeedBack: show the rating form on the review step too so it's always accessible */}
        {service.name === 'FeedBack' && (
          <div className="form-section" style={{ marginBottom: '24px' }}>
            <div className="section-card">
              <h3>Your Feedback</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service to Review *</label>
                  <select className="form-select" name="serviceRated" onChange={handleInputChange} required>
                    <option value="">Select service</option>
                    {Object.keys(serviceConfigs).map(sn => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating *</label>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className={`star-btn ${star <= feedbackRating ? 'active' : ''}`}
                        onClick={() => handleRatingClick(star)}
                        type="button"
                      >★</button>
                    ))}
                    <span className="rating-text">
                      {feedbackRating > 0 ? `${feedbackRating} star${feedbackRating > 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-textarea"
                    name="comment"
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Share your experience…"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Suggestions</label>
                  <textarea
                    className="form-textarea"
                    name="suggestions"
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Any suggestions to improve our services?"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="review-card">
          <div className="review-header">
            <h3>{service.name} Summary</h3>
            <span className="reference-id">
              Ref: {service.name.slice(0, 3).toUpperCase()}-{Date.now().toString().slice(-8)}
            </span>
          </div>
          
          <div className="review-sections">
            <div className="review-section">
              <h4>Service Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Service</span>
                  <span className="info-value">{service.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Request Date</span>
                  <span className="info-value">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Processing Time</span>
                  <span className="info-value">{config.processingTime}</span>
                </div>
                {service.name === 'Arbitration Fee' && (
                  <>
                    <div className="info-item">
                      <span className="info-label">Case Type</span>
                      <span className="info-value">{formData.courtCauseType || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Claim Amount</span>
                      <span className="info-value">
                        {formData.claimAmount ? `ETB ${parseFloat(formData.claimAmount.replace(/,/g, '')).toLocaleString()}` : 'Not specified'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Court Fee</span>
                      <span className="info-value">ETB {paymentAmount.toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Amount</span>
                      <span className="info-value">ETB {(paymentAmount + 50).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {service.name !== 'Arbitration Fee' && config.showDocumentUpload && uploadedFiles.length > 0 && (
              <div className="review-section">
                <h4>Uploaded Documents ({uploadedFiles.length})</h4>
                <div className="files-preview">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="file-review-item">
                      <div className="file-icon">📄</div>
                      <div className="file-review-info">
                        <span className="file-review-name">{file.name}</span>
                        <span className="file-review-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(formData).length > 0 && (
              <div className="review-section">
                <h4>Entered Details</h4>
                <div className="details-grid">
                  {Object.entries(formData)
                    .filter(([key]) => !key.startsWith('selectDoc_') && !key.includes('password'))
                    .map(([key, value]) => (
                      <div key={key} className="detail-item">
                        <span className="detail-label">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                            .replace(/^./, str => str.toUpperCase())
                            .replace('Search ', '')
                          }
                        </span>
                        <span className="detail-value">{value || 'Not specified'}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="confirmation-box">
            <label className="checkbox-container">
              <input type="checkbox" id="confirm" required />
              <span className="checkmark"></span>
              <span className="checkbox-label">
                I confirm that all information provided is accurate and complete
              </span>
            </label>
          </div>
        </div>

        <div className="notice-card">
          <div className="notice-header">
            <div className="notice-icon">⚠️</div>
            <h4>Important Notice</h4>
          </div>
          <p className="notice-text">
            By submitting this request, you acknowledge that all information provided is truthful and accurate. 
            {service.name === 'Arbitration Fee' && ' Court fee payment is required for case filing and is non-refundable once processed.'}
            {service.name === 'Complaint Form' && ' Your complaint will be reviewed within the specified processing time.'}
            {service.name === 'Daily Appointment' && ' Appointment confirmation will be sent via email/SMS.'}
            False information may result in legal consequences.
          </p>
        </div>
      </div>
    );
  };

  const renderServiceSpecificContent = () => {
    switch(step) {
      case 1: return renderStep1Content();
      case 2: return renderStep2Content();
      case 3: return renderStep3Content();
      default: return renderStep1Content();
    }
  };

  // Render action bar with fixed continue button logic
  const renderActionBar = () => (
    <div className="action-bar">
      <div className="action-left">
        {step > 1 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Previous
          </button>
        )}
      </div>
      <div className="action-right">
        {step < steps.length ? (
          <button 
            className="btn-primary" 
            onClick={handleContinue}
            disabled={
              (service.name === 'Arbitration Fee' && step === 1 && (!formData.courtCauseType || !formData.claimAmount || !formData.caseTitle))
            }
          >
            {service.name === 'Search Document' && step === 1 ? 'Search Documents' : 'Continue'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ) : (
          <button className="btn-submit" onClick={handleSubmitApplication}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            {service.name === 'Search Document' ? 'Submit Access Requests' : 'Submit Request'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="service-details-container">
      <div className="service-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Services
        </button>
        
        <div className="service-title-section">
          <div className="service-badge">{service.name.charAt(0)}</div>
          <div>
            <h1 className="service-title">{service.name}</h1>
            <p className="service-subtitle">
              {service.description || `Complete your ${service.name.toLowerCase()} request`}
            </p>
          </div>
        </div>
      </div>

      <div className="service-process-wrapper">
        <div className="process-header">
          <div className="progress-steps">
            {steps.map(s => (
              <div key={s.number} className={`progress-step ${step === s.number ? 'active' : ''} ${step > s.number ? 'completed' : ''}`}>
                <div className="step-circle">
                  {step > s.number ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    <span>{s.number}</span>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-description">{s.description}</div>
                </div>
                {s.number < steps.length && (
                  <div className="step-connector"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="process-layout">
          <div className="main-content">
            <div className="content-wrapper">
              {renderServiceSpecificContent()}
              
              {renderActionBar()}
            </div>
          </div>

          <div className="sidebar">
            {renderDocumentSidebar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;