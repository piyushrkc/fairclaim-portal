import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { sendEmail } from './services/sendEmail'; // adjust the path if needed
import { 
  Search, Filter, MoreVertical, Download, Eye, FileText, 
  CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, 
  ArrowUpRight, Calendar, User, CreditCard, MapPin, ChevronLeft,
  Paperclip, Send, Plus, Edit, Trash2
} from 'lucide-react';
// Imports - keep these consistent
import {
    getClaims,
    getClaimById,
    updateClaimStatus,
    updateClaimAssignee,
    updateClaimResolution,
    addNote,
    uploadDocuments,
    requestDocument,
    getClaimLogs
  } from './services/claimsService';
import { getAssignees } from './services/assigneesService';

function AdminDashboard({ onLogout }) {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [activityLogs, setActivityLogs] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [claimCounters, setClaimCounters] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    pending: 0,
    resolved: 0
  });
  
// Fetch claims data
useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        
        // Use Firebase service instead of REST API
        const data = await getClaims();
        setClaims(data);
        setFilteredClaims(data);
        
        // Update counters
        const counters = {
          total: data.length,
          new: data.filter(claim => claim.status === 'new').length,
          in_progress: data.filter(claim => claim.status === 'in_progress').length,
          pending: data.filter(claim => claim.status === 'pending').length,
          resolved: data.filter(claim => claim.status === 'resolved').length
        };
        setClaimCounters(counters);
      } catch (error) {
        console.error('Error fetching claims:', error);
        // Handle error state here
      } finally {
        setLoading(false);
      }
    };
    
    fetchClaims();
  }, []);
  
  // Fetch assignees
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        // Use Firebase service instead of REST API
        const data = await getAssignees();
        setAssigneeOptions(data);
      } catch (error) {
        console.error('Error fetching assignees:', error);
        // Handle error state here
      }
    };
    
    fetchAssignees();
  }, []);
  
  // Fetch activity logs when a claim is selected
  useEffect(() => {
    if (selectedClaim) {
      const fetchActivityLogs = async () => {
        try {
          // Use Firebase service instead of REST API
          const logs = await getClaimLogs(selectedClaim.id);
          setActivityLogs(logs);
        } catch (error) {
          console.error('Error fetching activity logs:', error);
          // Handle error state here
        }
      };
      
      fetchActivityLogs();
    }
  }, [selectedClaim]);
  
  // Filter and search handling
  useEffect(() => {
    let filtered = [...claims];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.id.toLowerCase().includes(term) ||
        claim.name.toLowerCase().includes(term) ||
        claim.email.toLowerCase().includes(term) ||
        claim.policyNumber.toLowerCase().includes(term)
      );
    }
    
    setFilteredClaims(filtered);
  }, [claims, statusFilter, searchTerm]);
  
  const handleViewClaim = (claim) => {
    setSelectedClaim(claim);
  };
  
  const handleCloseDetails = () => {
    setSelectedClaim(null);
    setActiveTab('details');
  };
  
  const handleUpdateClaimStatus = async (newStatus) => {
    try {
      const updatedClaim = await updateClaimStatus(
        selectedClaim.id,
        newStatus,
        selectedClaim.assignedTo || 'Admin'
      );
  
      const updatedClaims = claims.map(claim =>
        claim.id === selectedClaim.id ? updatedClaim : claim
      );
  
      setClaims(updatedClaims);
      setSelectedClaim(updatedClaim); // ✅ FIX: update selected claim with new status
  
      const counters = {
        total: updatedClaims.length,
        new: updatedClaims.filter(c => c.status === 'new').length,
        in_progress: updatedClaims.filter(c => c.status === 'in_progress').length,
        pending: updatedClaims.filter(c => c.status === 'pending').length,
        resolved: updatedClaims.filter(c => c.status === 'resolved').length
      };
      setClaimCounters(counters);
  
      const logs = await getClaimLogs(selectedClaim.id);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };
  
  const handleUpdateClaimAssignee = async (assignee) => {
    try {
      // Use Firebase service instead of REST API
      const updatedClaim = await updateClaimAssignee(selectedClaim.id, assignee);
      
      // Update claims list
      const updatedClaims = claims.map(claim => {
        if (claim.id === selectedClaim.id) {
          return updatedClaim;
        }
        return claim;
      });
      
      setClaims(updatedClaims);
      setSelectedClaim(updatedClaim);
      
      // Refresh activity logs
      const logs = await getClaimLogs(selectedClaim.id);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error updating claim assignee:', error);
      // Handle error state here
    }
  };
  
  const handleUpdateClaimResolution = async (resolution) => {
    try {
      // Use Firebase service instead of REST API
      const updatedClaim = await updateClaimResolution(selectedClaim.id, resolution);
      
      // Update claims list
      const updatedClaims = claims.map(claim => {
        if (claim.id === selectedClaim.id) {
          return updatedClaim;
        }
        return claim;
      });
      
      setClaims(updatedClaims);
      setSelectedClaim(updatedClaim);
      
      // Refresh activity logs
      const logs = await getClaimLogs(selectedClaim.id);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error updating claim resolution:', error);
      // Handle error state here
    }
  };
  
  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    
    try {
      // Use Firebase service instead of REST API
      await addNote(
        selectedClaim.id, 
        noteText, 
        selectedClaim.assignedTo || 'Admin'
      );
      
      // Refresh activity logs
      const logs = await getClaimLogs(selectedClaim.id);
      setActivityLogs(logs);
      
      setNoteText('');
    } catch (error) {
      console.error('Error adding note:', error);
      // Handle error state here
    }
  };
  
  const handleFileUpload = async (files) => {
    try {
      // Use Firebase service instead of REST API
      const updatedClaim = await uploadDocuments(selectedClaim.id, files);
      
      // Update claims list
      const updatedClaims = claims.map(claim => {
        if (claim.id === selectedClaim.id) {
          return updatedClaim;
        }
        return claim;
      });
      
      setClaims(updatedClaims);
      setSelectedClaim(updatedClaim);
      
      // Refresh activity logs
      const logs = await getClaimLogs(selectedClaim.id);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error uploading documents:', error);
      // Handle error state here
    }
  };
  
  const handleRequestDocument = async () => {
    try {
      await requestDocument(
        selectedClaim.id, 
        selectedClaim.assignedTo || 'Admin'
      );
      const logs = await getClaimLogs(selectedClaim.id);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error requesting document:', error);
      // Handle error state here
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatDateTime = (dateTimeString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const statusLabels = {
    new: 'New',
    in_progress: 'In Progress',
    pending: 'Pending',
    resolved: 'Resolved'
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      pending: { color: 'bg-purple-100 text-purple-800', label: 'Pending' },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', label: 'High' },
      medium: { color: 'bg-orange-100 text-orange-800', label: 'Medium' },
      low: { color: 'bg-green-100 text-green-800', label: 'Low' }
    };
    
    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', label: priority };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
  const ResolutionBadge = ({ resolution }) => {
    const resolutionConfig = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      partially_approved: { color: 'bg-blue-100 text-blue-800', label: 'Partially Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = resolutionConfig[resolution] || { color: 'bg-gray-100 text-gray-800', label: resolution };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Fair Claim Solutions</h1>
            <span className="ml-4 px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-medium">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
              <span className="sr-only">Notifications</span>
              <div className="relative">
                <AlertTriangle className="h-6 w-6" />
                <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  3
                </span>
              </div>
            </button>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium">
                AV
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:underline ml-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedClaim ? (
          <div>
            <button
              onClick={handleCloseDetails}
              className="mb-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to All Claims
            </button>
            
            <div className="bg-white shadow rounded-lg">
              {/* Claim Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedClaim.id}</h2>
                      <StatusBadge status={selectedClaim.status} />
                      {selectedClaim.resolution && (
                        <ResolutionBadge resolution={selectedClaim.resolution} />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Submitted on {formatDateTime(selectedClaim.submittedAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => {
                        // Export claim details to PDF/Excel
                        // In real implementation, this would call an API endpoint
                        alert('Export feature would be implemented here');
                      }}
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Export
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => setEmailModalOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      Contact Customer
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'details'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Claim Details
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'documents'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('documents')}
                  >
                    Documents
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'activity'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('activity')}
                  >
                    Activity Log
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Information */}
                    <div className="col-span-2">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedClaim.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedClaim.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedClaim.phone}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Claim Information */}
                      <div className="bg-gray-50 rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Policy Number</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedClaim.policyNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Insurance Company</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedClaim.insuranceCompany}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Claim Amount</p>
                            <p className="mt-1 text-sm text-gray-900">₹ {selectedClaim.claimAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Rejection Date</p>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedClaim.rejectionDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedClaim.rejectionReason}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Priority</p>
                            <div className="mt-1">
                              <PriorityBadge priority={selectedClaim.priority} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-500">Additional Details</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedClaim.additionalDetails}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Claim Management */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Management</h3>
                        
                        {/* Assignee Selection */}
                        <div className="mb-6">
                          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                            Assigned To
                          </label>
                          <select
                            id="assignee"
                            value={selectedClaim.assignedTo || ''}
                            onChange={(e) => handleUpdateClaimAssignee(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Unassigned</option>
                            {assigneeOptions.map(option => (
                              <option key={option.id} value={option.name}>{option.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Status Buttons */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update Status
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleUpdateClaimStatus('in_progress')}
                              disabled={selectedClaim.status === 'in_progress' || selectedClaim.status === 'resolved'}
                              className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                                selectedClaim.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300 cursor-default'
                                  : selectedClaim.status === 'resolved'
                                  ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                                  : 'text-yellow-700 bg-white border-yellow-300 hover:bg-yellow-50'
                              }`}
                            >
                              <Clock className="h-4 w-4 mr-1.5" />
                              In Progress
                            </button>
                            <button
                              onClick={() => handleUpdateClaimStatus('pending')}
                              disabled={selectedClaim.status === 'pending' || selectedClaim.status === 'resolved'}
                              className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                                selectedClaim.status === 'pending'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300 cursor-default'
                                  : selectedClaim.status === 'resolved'
                                  ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                                  : 'text-purple-700 bg-white border-purple-300 hover:bg-purple-50'
                              }`}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1.5" />
                              Pending
                            </button>
                            <button
                                onClick={() => handleUpdateClaimStatus('resolved')}
                                disabled={selectedClaim.status?.toLowerCase() === 'resolved'}
                                className={`col-span-2 inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                                    selectedClaim.status?.toLowerCase() === 'resolved'
                                    ? 'bg-green-100 text-green-800 border-green-300 cursor-default'
                                    : 'text-green-700 bg-white border-green-300 hover:bg-green-50'
                                }`}
                                >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Mark as Resolved
                                </button>
                          </div>
                        </div>
                        
                        {/* Resolution Options (only if status is resolved) */}
                        {selectedClaim.status?.toLowerCase().trim() === 'resolved' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolution
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                            {/* Approved */}
                            <button
                                onClick={() => handleUpdateClaimResolution('approved')}
                                className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                                selectedClaim.resolution === 'approved'
                                    ? 'bg-green-100 text-green-800 border-green-300 cursor-default'
                                    : 'text-green-700 bg-white border-green-300 hover:bg-green-50'
                                }`}
                            >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Approved
                            </button>

                            {/* Partially Approved */}
                            <button
                                onClick={() => handleUpdateClaimResolution('partially_approved')}
                                className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                                selectedClaim.resolution === 'partially_approved'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-default'
                                    : 'text-blue-700 bg-white border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                <ArrowUpRight className="h-4 w-4 mr-1.5" />
                                Partially Approved
                            </button>

                            {/* Rejected */}
                            <button
                                onClick={() => handleUpdateClaimResolution('rejected')}
                                className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                                selectedClaim.resolution === 'rejected'
                                    ? 'bg-red-100 text-red-800 border-red-300 cursor-default'
                                    : 'text-red-700 bg-white border-red-300 hover:bg-red-50'
                                }`}
                            >
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Rejected
                            </button>
                            </div>
                        </div>
                        )}                        
                        {/* Add Note */}
                        <div>
                          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                            Add Note
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="note"
                              name="note"
                              rows={3}
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="Add notes about this claim..."
                            />
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={handleAddNote}
                              disabled={!noteText.trim()}
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                !noteText.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              <Send className="h-4 w-4 mr-1.5" />
                              Add Note
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'documents' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Customer Documents</h3>
                      <button 
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={handleRequestDocument}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Request Document
                      </button>
                    </div>
                    
                    {selectedClaim.documents && selectedClaim.documents.length > 0 ? (
                      <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {selectedClaim.documents.map((document, index) => (
                            <li key={index}>
                              <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 flex items-center">
                                  <div className="flex-shrink-0">
                                    {document.type === 'application/pdf' ? (
                                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-red-600" />
                                      </div>
                                    ) : document.type.startsWith('image/') ? (
                                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <img src="/api/placeholder/24/24" alt="Document preview" className="rounded" />
                                      </div>
                                    ) : (
                                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-gray-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-blue-600 truncate">{document.name}</p>
                                      <p className="mt-1 flex items-center text-sm text-gray-500">
                                        <span>{formatFileSize(document.size)}</span>
                                      </p>
                                    </div>
                                    <div className="hidden md:block">
                                      <div>
                                        <p className="text-sm text-gray-900">
                                          Uploaded on {formatDateTime(document.uploadedAt || selectedClaim.submittedAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                <button 
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                                    onClick={() => {
                                        // Open document in a new tab using the Firebase storage URL
                                        window.open(document.url, '_blank');
                                    }}
                                    >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                    </button>
                                    <button 
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                                    onClick={() => {
                                        // Download document from Firebase storage URL
                                        window.open(document.url, '_self');
                                    }}
                                    >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                    </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white shadow rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No documents have been uploaded for this claim yet.
                        </p>
                      </div>
                    )}
                    
                    {/* Upload new document section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                        <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Drag and drop files here or click to browse</p>
                        <p className="text-xs text-gray-500 mb-4">Supported formats: PDF, JPEG (Max 10MB per file)</p>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <label
                          htmlFor="file-upload"
                          className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 font-medium rounded-md py-2 px-4 cursor-pointer"
                        >
                          Select Files
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h3>
                    
                    {activityLogs.length > 0 ? (
                      <div className="flow-root">
                        <ul className="-mb-8">
                          {activityLogs.map((log, index) => (
                            <li key={log.id}>
                              <div className="relative pb-8">
                                {index !== activityLogs.length - 1 && (
                                  <span
                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                  />
                                )}
                                <div className="relative flex space-x-3">
                                  <div>
                                    {log.action === 'Claim submitted' && (
                                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                      </div>
                                    )}
                                    {log.action === 'Claim assigned' && (
                                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center ring-8 ring-white">
                                        <User className="h-4 w-4 text-purple-600" />
                                      </div>
                                    )}
                                    {log.action === 'Status updated' && (
                                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center ring-8 ring-white">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                      </div>
                                    )}
                                    {log.action === 'Note added' && (
                                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                        <MessageSquare className="h-4 w-4 text-gray-600" />
                                      </div>
                                    )}
                                    {log.action === 'Document requested' && (
                                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
                                        <Paperclip className="h-4 w-4 text-red-600" />
                                      </div>
                                    )}
                                    {log.action === 'Document received' && (
                                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                                        <FileText className="h-4 w-4 text-green-600" />
                                      </div>
                                    )}
                                    {log.action === 'Claim resolved' && (
                                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        {log.action}{' '}
                                        <span className="font-medium text-gray-900">
                                          by {log.user}
                                        </span>
                                      </p>
                                      <p className="mt-1 text-sm text-gray-900">
                                        {log.details}
                                      </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                      <time dateTime={log.timestamp}>
                                        {formatDateTime(log.timestamp)}
                                      </time>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white shadow rounded-lg">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          There's no activity recorded for this claim yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white shadow rounded-lg px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Claims</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{claimCounters.total}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">New Claims</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{claimCounters.new}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{claimCounters.in_progress}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
                    <AlertTriangle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{claimCounters.pending}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{claimCounters.resolved}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filters and Search */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search by ID, name, email, or policy number"
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="status-filter" className="sr-only">
                      Status
                    </label>
                    <div className="relative inline-flex">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="status-filter"
                        name="status-filter"
                        className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Claims</option>
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Claims Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Insurance Claims
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                  Showing {filteredClaims.length} of {claims.length} claims
                </span>
              </div>
              
              {loading ? (
                <div className="px-4 py-12 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-500">Loading claims...</p>
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No claims match your current filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Claim ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Insurance Company
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Claim Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <button onClick={() => handleViewClaim(claim)} className="hover:underline">
                                {claim.id}
                            </button>
                            </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-500">
                                {claim.name
                                    ? claim.name
                                        .split(' ')
                                        .map(n => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase()
                                    : 'NA'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{claim.name}</div>
                                <div className="text-sm text-gray-500">{claim.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {claim.insuranceCompany}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹ {claim.claimAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(claim.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={claim.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <PriorityBadge priority={claim.priority} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {claim.assignedTo || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewClaim(claim)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                // In real implementation, this would open a dropdown menu with more options
                                // For simplicity, we'll just use the view function
                                handleViewClaim(claim);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

{/* Email Modal */}
<Dialog open={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen px-4">
    <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
    <div className="relative bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
      <Dialog.Title className="text-lg font-medium text-gray-900">Send Email to Customer</Dialog.Title>
      <textarea
        rows="6"
        value={emailBody}
        onChange={(e) => setEmailBody(e.target.value)}
        placeholder="Type your message here..."
        className="mt-4 w-full p-2 border border-gray-300 rounded-md"
      />
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={() => setEmailModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        <button
          onClick={async () => {
            try {
              await sendEmail(
                selectedClaim.email,
                `Update on your claim ${selectedClaim.id}`,
                `<p>${emailBody}</p>`
              );
              await addNote(selectedClaim.id, `Email sent to customer: "${emailBody}"`, 'Admin');
              setEmailStatus('Email sent successfully');
              setEmailModalOpen(false);
              setEmailBody('');
              const logs = await getClaimLogs(selectedClaim.id);
              setActivityLogs(logs);
            } catch (err) {
              setEmailStatus('Failed to send email');
              console.error(err);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</Dialog>

</main>
</div>
);
}

export default AdminDashboard;