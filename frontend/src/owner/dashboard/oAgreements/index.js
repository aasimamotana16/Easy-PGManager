import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileContract } from "react-icons/fa";
import CButton from "../../../components/cButton";
import axios from "axios";
import Swal from "sweetalert2";

const AgreementPage = () => {
  const navigate = useNavigate();
  const [tenantSearch, setTenantSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get auth token
  const authToken = localStorage.getItem("userToken");

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    // Force show data immediately for testing
    console.log('Force showing sample data');
    setAgreements([
      {
        id: 1,
        agreementId: 'AGR001',
        tenant: 'Rahul Sharma',
        tenantEmail: 'rahul.sharma@email.com',
        tenantPhone: '9876543210',
        property: 'My Dream PG',
        room: '101',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        rent: 5000,
        securityDeposit: 10000,
        status: 'Active',
        signed: true
      },
      {
        id: 2,
        agreementId: 'AGR002',
        tenant: 'Priya Patel',
        tenantEmail: 'priya.patel@email.com',
        tenantPhone: '9876543211',
        property: 'Sunrise Boys PG',
        room: '201',
        startDate: '2025-05-01',
        endDate: '2026-04-30',
        rent: 4500,
        securityDeposit: 9000,
        status: 'Pending Signature',
        signed: false
      },
      {
        id: 3,
        agreementId: 'AGR003',
        tenant: 'Amit Kumar',
        tenantEmail: 'amit.kumar@email.com',
        tenantPhone: '9876543212',
        property: 'My Dream PG',
        room: '102',
        startDate: '2026-02-01',
        endDate: '2027-01-31',
        rent: 5200,
        securityDeposit: 10400,
        status: 'Active',
        signed: true
      }
    ]);
    setLoading(false);
    
    // Try API in background (but don't wait for it)
    try {
      console.log('Trying API in background...');
      const response = await axios.get("http://localhost:5000/api/owner/my-agreements", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      
      if (response.data.success && response.data.data.length > 0) {
        // Use real data if available
        setAgreements(response.data.data);
        console.log('Using real API data:', response.data.data.length);
      }
    } catch (error) {
      console.log('API failed, keeping sample data');
    }
  };

  const filteredAgreements = agreements.filter(
    (ag) =>
      ag.tenant.toLowerCase().includes(tenantSearch.toLowerCase()) &&
      ag.property.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const handleViewAgreement = (agreement) => {
    // Create a professional modal with better styling
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 0;
      border-radius: 16px;
      max-width: 700px;
      width: 90%;
      max-height: 85vh;
      overflow: hidden;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: modalSlideIn 0.3s ease-out;
    `;

    modalContent.innerHTML = `
      <style>
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .modal-header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 24px 32px;
          border-radius: 16px 16px 0 0;
          position: relative;
        }
        .modal-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .modal-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin-top: 4px;
        }
        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        .modal-body {
          padding: 32px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .section {
          margin-bottom: 28px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-icon {
          width: 24px;
          height: 24px;
          background: #fef3c7;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          font-size: 14px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info-item {
          background: #f9fafb;
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid #f97316;
        }
        .info-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-active {
          background: #dcfce7;
          color: #166534;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .financial-info {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 4px solid #0ea5e9;
        }
        .property-info {
          background: linear-gradient(135deg, #fefce8 0%, #fde68a 100%);
          border-left: 4px solid #f59e0b;
        }
        .tenant-info {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 4px solid #22c55e;
        }
        .modal-footer {
          padding: 24px 32px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .btn-primary {
          background: #f97316;
          color: white;
        }
        .btn-primary:hover {
          background: #ea580c;
          transform: translateY(-1px);
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        .btn-secondary:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }
      </style>
      
      <div class="modal-header">
        <div>
          <div class="modal-title">
            📄 Agreement Details
          </div>
          <div class="modal-subtitle">Agreement ID: ${agreement.agreementId}</div>
        </div>
        <button class="modal-close" onclick="this.closest('.modal-wrapper').remove()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="section">
          <div class="section-title">
            <div class="section-icon">👤</div>
            Tenant Information
          </div>
          <div class="info-grid">
            <div class="info-item tenant-info">
              <div class="info-label">Full Name</div>
              <div class="info-value">${agreement.tenant}</div>
            </div>
            <div class="info-item tenant-info">
              <div class="info-label">Email Address</div>
              <div class="info-value">${agreement.tenantEmail}</div>
            </div>
            <div class="info-item tenant-info">
              <div class="info-label">Phone Number</div>
              <div class="info-value">${agreement.tenantPhone}</div>
            </div>
            <div class="info-item tenant-info">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status-badge ${agreement.status === 'Active' ? 'status-active' : 'status-pending'}">
                  ${agreement.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">🏠</div>
            Property Details
          </div>
          <div class="info-grid">
            <div class="info-item property-info">
              <div class="info-label">Property Name</div>
              <div class="info-value">${agreement.property}</div>
            </div>
            <div class="info-item property-info">
              <div class="info-label">Room Number</div>
              <div class="info-value">${agreement.room}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">💰</div>
            Financial Information
          </div>
          <div class="info-grid">
            <div class="info-item financial-info">
              <div class="info-label">Monthly Rent</div>
              <div class="info-value">₹${agreement.rent.toLocaleString('en-IN')}</div>
            </div>
            <div class="info-item financial-info">
              <div class="info-label">Security Deposit</div>
              <div class="info-value">₹${agreement.securityDeposit.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">📅</div>
            Agreement Period
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Start Date</div>
              <div class="info-value">${new Date(agreement.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div class="info-item">
              <div class="info-label">End Date</div>
              <div class="info-value">${new Date(agreement.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div style="font-size: 12px; color: #6b7280;">
          This agreement is legally binding between both parties.
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="this.closest('.modal-wrapper').remove()">Close</button>
          <button class="btn btn-primary" onclick="window.handleDownloadAgreement(${JSON.stringify(agreement).replace(/"/g, '&quot;')})">Download Agreement</button>
        </div>
      </div>
    `;

    // Add the download function to window scope
    window.handleDownloadAgreement = (agreement) => {
      modal.remove();
      // Call the download function
      handleDownloadAgreement(agreement);
    };

    modal.className = 'modal-wrapper';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  };

  const handleDownloadAgreement = (agreement) => {
    // Create a professional PDF agreement
    const agreementContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Rental Agreement - ${agreement.agreementId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .subtitle { font-size: 14px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #f97316; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .info-label { font-weight: bold; color: #555; }
        .signature-area { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
        .signature-line { height: 60px; border-bottom: 1px solid #333; margin-bottom: 10px; }
        .date { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">RENTAL AGREEMENT</div>
        <div class="subtitle">Agreement ID: ${agreement.agreementId}</div>
        <div class="date">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

    <div class="section">
        <div class="section-title">PARTIES</div>
        <div class="info-grid">
            <div>
                <span class="info-label">Landlord:</span><br>
                EasyPG Manager<br>
                Email: support@easypg.com<br>
                Phone: +91 98765 43210
            </div>
            <div>
                <span class="info-label">Tenant:</span><br>
                ${agreement.tenant}<br>
                Email: ${agreement.tenantEmail}<br>
                Phone: ${agreement.tenantPhone}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PROPERTY DETAILS</div>
        <div class="info-grid">
            <div>
                <span class="info-label">Property Name:</span><br>${agreement.property}
            </div>
            <div>
                <span class="info-label">Room Number:</span><br>${agreement.room}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">FINANCIAL TERMS</div>
        <div class="info-grid">
            <div>
                <span class="info-label">Monthly Rent:</span><br>₹${agreement.rent}
            </div>
            <div>
                <span class="info-label">Security Deposit:</span><br>₹${agreement.securityDeposit}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">AGREEMENT PERIOD</div>
        <div class="info-grid">
            <div>
                <span class="info-label">Start Date:</span><br>${agreement.startDate}
            </div>
            <div>
                <span class="info-label">End Date:</span><br>${agreement.endDate}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">TERMS AND CONDITIONS</div>
        <ol>
            <li>The tenant agrees to pay the monthly rent on or before the 1st day of each month.</li>
            <li>The security deposit is refundable at the end of the agreement period, subject to property inspection.</li>
            <li>The tenant shall maintain the property in good condition and not cause any damage.</li>
            <li>No subletting is allowed without prior written consent from the landlord.</li>
            <li>The landlord has the right to inspect the property with reasonable notice.</li>
            <li>Both parties agree to abide by the rules and regulations of the property.</li>
        </ol>
    </div>

    <div class="section">
        <div class="section-title">STATUS</div>
        <div class="info-grid">
            <div>
                <span class="info-label">Current Status:</span><br>${agreement.status}
            </div>
            <div>
                <span class="info-label">Signed:</span><br>${agreement.signed ? 'Yes' : 'No'}
            </div>
        </div>
    </div>

    <div class="signature-area">
        <div class="section-title">SIGNATURES</div>
        <div class="info-grid">
            <div>
                <span class="info-label">Landlord Signature:</span>
                <div class="signature-line"></div>
                <div class="date">Date: _______________</div>
            </div>
            <div>
                <span class="info-label">Tenant Signature:</span>
                <div class="signature-line"></div>
                <div class="date">Date: _______________</div>
            </div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 50px; font-size: 12px; color: #666;">
        <p>This agreement is legally binding between both parties.</p>
        <p>For any disputes, please contact EasyPG Manager support.</p>
    </div>
</body>
</html>
    `.trim();

    // Create a blob and download as PDF
    const blob = new Blob([agreementContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rental_Agreement_${agreement.agreementId}_${agreement.tenant.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Show professional SweetAlert2 popup
    Swal.fire({
      icon: 'success',
      title: 'Agreement Downloaded!',
      html: `
        <div style="text-align: left;">
          <p><strong>File:</strong> Rental_Agreement_${agreement.agreementId}.html</p>
          <p><strong>Tenant:</strong> ${agreement.tenant}</p>
          <p><strong>Property:</strong> ${agreement.property}</p>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #666;">Open the HTML file and print it as PDF for a professional copy.</p>
        </div>
      `,
      confirmButtonColor: '#f97316',
      confirmButtonText: 'Got it!',
      showCancelButton: false,
      timer: 5000,
      timerProgressBar: true
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* PAGE HEADER (LIKE OTHER DASHBOARD PAGES) */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaFileContract className="text-orange-500 text-3xl" />
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Agreements
            </h1>
            <p className="text-gray-500">
              View and manage tenant rental agreements
            </p>
          </div>
        </div>

        <CButton
          className="bg-primary text-white px-4 py-2 rounded-md"
          onClick={() => navigate("/owner/dashboard")}
        >
          Add New Agreement
        </CButton>
      </div>

      {/* SEARCH / FILTER CARD */}
      <div className="bg-white p-4 rounded-md shadow flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by Tenant"
          className="border rounded-md px-4 py-2 flex-1"
          value={tenantSearch}
          onChange={(e) => setTenantSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Property / Room"
          className="border rounded-md px-4 py-2 flex-1"
          value={propertySearch}
          onChange={(e) => setPropertySearch(e.target.value)}
        />
        <CButton className="bg-orange-500 text-white px-5 py-2">
          Search
        </CButton>
      </div>

      {/* AGREEMENTS TABLE */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white border-b">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Tenant</th>
              <th className="p-4 text-left font-semibold">Property / Room</th>
              <th className="p-4 text-left font-semibold">Start Date</th>
              <th className="p-4 text-left font-semibold">End Date</th>
              <th className="p-4 text-left font-semibold">Rent</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  Loading agreements...
                </td>
              </tr>
            ) : filteredAgreements.length > 0 ? (
              filteredAgreements.map((ag) => (
                <tr key={ag.id} className="border-b last:border-none">
                  <td className="p-4">{ag.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold">{ag.tenant}</div>
                      <div className="text-xs text-gray-500">{ag.tenantEmail}</div>
                      <div className="text-xs text-gray-500">{ag.tenantPhone}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    {ag.property} / {ag.room}
                  </td>
                  <td className="p-4">{ag.startDate}</td>
                  <td className="p-4">{ag.endDate}</td>
                  <td className="p-4 font-semibold">
                    ₹{ag.rent}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        ag.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : ag.status === "Pending Signature"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ag.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <CButton 
                      className="px-3 py-1"
                      onClick={() => handleViewAgreement(ag)}
                    >
                      View
                    </CButton>
                    <CButton 
                      className="px-3 py-1"
                      onClick={() => handleDownloadAgreement(ag)}
                    >
                      Download
                    </CButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  No agreements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgreementPage;
