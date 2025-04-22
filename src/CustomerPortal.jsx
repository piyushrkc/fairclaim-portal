// src/CustomerPortal.jsx
import React, { useState } from 'react';
import { Info, Upload, Trash2, Check, Clock, AlertTriangle} from 'lucide-react';
import { createClaim } from './services/claimsService';

function CustomerPortal() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    policyNumber: '',
    insuranceCompany: '',
    claimAmount: '',
    rejectionDate: '',
    rejectionReason: '',
    additionalDetails: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/jpeg') || 
      file.type.startsWith('image/jpg')
    );
    
    if (validFiles.length < newFiles.length) {
      alert('Only PDF and JPEG files are allowed');
    }
    
    setDocuments(prev => [...prev, ...validFiles]);
  };
  
  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert claim amount to number
      const claimData = {
        ...formData,
        claimAmount: parseFloat(formData.claimAmount)
      };
      
      // Submit the claim to Firebase
      const result = await createClaim(claimData, documents);
      
      // Set the ticket/claim number for confirmation
      setTicketNumber(result.id);
      setIsSubmitted(true);
    } catch (error) {
        console.error('Error submitting claim:', error);
        alert('Submission failed: ' + error.message); // 🔥 adds immediate feedback
        setError('There was an error submitting your claim. Please try again.');
      } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Submitted Successfully!</h2>
            <p className="text-lg text-gray-600 mb-6">Your claim has been received and will be processed soon.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-lg font-medium text-gray-900">Your Ticket Number</p>
              <p className="text-2xl font-bold text-blue-600">{ticketNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Please save this ticket number for future reference.</p>
            </div>
            <p className="text-gray-600 mb-8">
              We have sent a confirmation email to {formData.email} with your ticket details.
              Our team will review your claim and contact you within 2-3 business days.
            </p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3"
              onClick={() => window.location.reload()}
            >
              Submit Another Claim
            </button>
          </div>
        </div>
      </div>
    );
  } 
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Rejected Claim Assistance</h1>
{/* <img src="/api/placeholder/120/40" alt="Fair Claim Solutions Logo" className="h-10" /> */}          
        </div>
          <p className="text-blue-100 mt-2">Let our experts help you get your rejected health insurance claim approved</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
            {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
            </div>
        )}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please provide accurate information about your rejected claim. Our team will review and contact you within 48 hours.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                id="policyNumber"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="insuranceCompany" className="block text-sm font-medium text-gray-700">Insurance Company</label>
              <input
                type="text"
                id="insuranceCompany"
                name="insuranceCompany"
                value={formData.insuranceCompany}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="claimAmount" className="block text-sm font-medium text-gray-700">Claim Amount (₹)</label>
              <input
                type="number"
                id="claimAmount"
                name="claimAmount"
                value={formData.claimAmount}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="rejectionDate" className="block text-sm font-medium text-gray-700">Rejection Date</label>
              <input
                type="date"
                id="rejectionDate"
                name="rejectionDate"
                value={formData.rejectionDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Rejection Reason</label>
              <select
                id="rejectionReason"
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select reason</option>
                <option value="Insufficient Documentation">Insufficient Documentation</option>
                <option value="Pre-existing Condition">Pre-existing Condition</option>
                <option value="Policy Exclusion">Policy Exclusion</option>
                <option value="Treatment Not Covered">Treatment Not Covered</option>
                <option value="Claim Filed Late">Claim Filed Late</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700">Additional Details</label>
              <textarea
                id="additionalDetails"
                name="additionalDetails"
                value={formData.additionalDetails}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Document Upload Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">Drag and drop files here or click to browse</p>
              <p className="text-xs text-gray-500 mb-4">Supported formats: PDF, JPEG (Max 10MB per file)</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 font-medium rounded-md py-2 px-4 cursor-pointer"
              >
                Select Files
              </label>
            </div>
            
            {/* Document List */}
            {documents.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                  {documents.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-3 px-4 bg-white hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {file.type === 'application/pdf' ? (
                            <div className="h-8 w-8 bg-red-100 rounded-md flex items-center justify-center">
                              <span className="text-xs font-medium text-red-800">PDF</span>
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-800">IMG</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting ? (
                <>
                  <Clock className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Submitting...
                </>
              ) : (
                'Submit Claim for Review'
              )}
            </button>
          </div>
          
          {/* Terms and Privacy */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By submitting this form, you agree to our{' '}
              <button type="button" className="text-blue-600 hover:underline">Terms of Service</button>
              and{' '}
                <button type="button" className="text-blue-600 hover:underline">Privacy Policy</button>            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerPortal;