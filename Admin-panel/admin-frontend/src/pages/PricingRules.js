import React, { useEffect, useState } from 'react';
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

const PricingRules = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    allowDepositPerVariant: false,
    depositModesAllowed: ['fixed'],
    maxDepositMonths: 1
  });

  const fetchPricingRules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminConfigAPI.getPricingRules();
      const data = extractPayload(response);
      setFormData({
        allowDepositPerVariant: Boolean(data.allowDepositPerVariant),
        depositModesAllowed:
          Array.isArray(data.depositModesAllowed) && data.depositModesAllowed.length > 0
            ? data.depositModesAllowed
            : ['fixed'],
        maxDepositMonths: Number.isFinite(Number(data.maxDepositMonths)) ? Number(data.maxDepositMonths) : 1
      });
    } catch (apiError) {
      setError(resolveApiError(apiError, 'Failed to load pricing rules'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const toggleDepositMode = (mode) => {
    const hasMode = formData.depositModesAllowed.includes(mode);
    const nextModes = hasMode
      ? formData.depositModesAllowed.filter((item) => item !== mode)
      : [...formData.depositModesAllowed, mode];

    setFormData({
      ...formData,
      depositModesAllowed: nextModes.length > 0 ? nextModes : ['fixed']
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const payload = {
        allowDepositPerVariant: formData.allowDepositPerVariant,
        depositModesAllowed: formData.depositModesAllowed,
        maxDepositMonths: Number(formData.maxDepositMonths) || 0
      };
      await adminConfigAPI.updatePricingRules(payload);
      await fetchPricingRules();
      alert('Pricing rules updated successfully');
    } catch (apiError) {
      setError(resolveApiError(apiError, 'Failed to update pricing rules'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading pricing rules..." className="py-8" />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Rules</h1>
        <p className="mt-1 text-sm text-gray-600">Configure deposit behavior for room variant pricing.</p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.allowDepositPerVariant}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  allowDepositPerVariant: event.target.checked
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-800">Allow deposit per variant</span>
          </label>

          <div>
            <p className="text-sm font-medium text-gray-700">Deposit Modes Allowed</p>
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.depositModesAllowed.includes('fixed')}
                  onChange={() => toggleDepositMode('fixed')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800">fixed</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.depositModesAllowed.includes('months_rent')}
                  onChange={() => toggleDepositMode('months_rent')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800">months_rent</span>
              </label>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700">Max Deposit Months</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.maxDepositMonths}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  maxDepositMonths: Number(event.target.value)
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Rules'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricingRules;
