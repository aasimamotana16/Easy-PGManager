import React, { useEffect, useMemo, useState } from 'react';
import { adminConfigAPI } from '../services/api';
import PageLoader from '../components/PageLoader';

const extractPayload = (response) => {
  if (response?.data?.data && typeof response.data.data === 'object') {
    return response.data.data;
  }
  return response?.data || {};
};

const resolveApiError = (apiError, fallbackMessage) => {
  const statusCode = apiError?.response?.status;
  const backendMessage = apiError?.response?.data?.message || apiError?.response?.data?.error;
  if (statusCode && backendMessage) return `${fallbackMessage} (${statusCode}): ${backendMessage}`;
  if (backendMessage) return `${fallbackMessage}: ${backendMessage}`;
  if (statusCode) return `${fallbackMessage} (HTTP ${statusCode})`;
  return fallbackMessage;
};

const AgreementSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fixedClauses: [''],
    jurisdiction: '',
    platformDisclaimer: '',
    esignConsentText: ''
  });

  const fixedClausesText = useMemo(
    () => (Array.isArray(formData.fixedClauses) ? formData.fixedClauses.join('\n') : ''),
    [formData.fixedClauses]
  );

  const fetchAgreementSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminConfigAPI.getAgreementSettings();
      const data = extractPayload(response);
      setFormData({
        fixedClauses: Array.isArray(data.fixedClauses) && data.fixedClauses.length > 0 ? data.fixedClauses : [''],
        jurisdiction: data.jurisdiction || '',
        platformDisclaimer: data.platformDisclaimer || '',
        esignConsentText: data.esignConsentText || ''
      });
    } catch (apiError) {
      setError(resolveApiError(apiError, 'Failed to load agreement settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreementSettings();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const cleanedFixedClauses = fixedClausesText
        .split('\n')
        .map((clause) => clause.trim())
        .filter(Boolean);

      const payload = {
        fixedClauses: cleanedFixedClauses,
        jurisdiction: formData.jurisdiction.trim(),
        platformDisclaimer: formData.platformDisclaimer.trim(),
        esignConsentText: formData.esignConsentText.trim()
      };

      await adminConfigAPI.updateAgreementSettings(payload);
      await fetchAgreementSettings();
      alert('Agreement settings updated successfully');
    } catch (apiError) {
      setError(resolveApiError(apiError, 'Failed to update agreement settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading agreement settings..." className="py-8" />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Agreement Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure default legal text used in generated agreements.</p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fixed Clauses (one per line)</label>
            <textarea
              rows={8}
              value={fixedClausesText}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  fixedClauses: event.target.value.split('\n')
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jurisdiction</label>
            <input
              type="text"
              value={formData.jurisdiction}
              onChange={(event) => setFormData({ ...formData, jurisdiction: event.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Platform Disclaimer</label>
            <textarea
              rows={4}
              value={formData.platformDisclaimer}
              onChange={(event) => setFormData({ ...formData, platformDisclaimer: event.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">eSign Consent Text</label>
            <textarea
              rows={4}
              value={formData.esignConsentText}
              onChange={(event) => setFormData({ ...formData, esignConsentText: event.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgreementSettings;
