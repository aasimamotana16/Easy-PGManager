import React, { useState, useEffect } from 'react';
import CRUDTable from '../components/CRUDTable';
import { pgsAPI, ownersAPI } from '../services/api';

const emptyRoomPrice = () => ({
  variantLabel: '',
  rentAmount: '',
  securityDeposit: ''
});

const emptyInventory = () => ({
  fanCount: 0,
  lightCount: 0,
  bedCount: 0,
  cupboardCount: 0,
  mattressCount: 0
});

const parseCountValue = (value) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) return 0;
  return Math.floor(parsedValue);
};

const normalizeRoomPrices = (pg) => {
  const sourceRoomPrices = Array.isArray(pg?.roomPrices)
    ? pg.roomPrices
    : Array.isArray(pg?.roomPricing)
      ? pg.roomPricing
      : [];

  if (sourceRoomPrices.length === 0) {
    return [emptyRoomPrice()];
  }

  const normalizedValues = sourceRoomPrices
    .map((entry) => {
      const variantLabel = (entry?.variantLabel || entry?.type || entry?.label || '').toString();
      const rentAmount = Number(entry?.rentAmount ?? entry?.rent ?? entry?.price);
      const securityDeposit = Number(entry?.securityDeposit ?? entry?.deposit);

      return {
        variantLabel,
        rentAmount: Number.isFinite(rentAmount) && rentAmount >= 0 ? String(rentAmount) : '',
        securityDeposit: Number.isFinite(securityDeposit) && securityDeposit >= 0 ? String(securityDeposit) : ''
      };
    })
    .filter(
      (entry) => entry.variantLabel.trim() || entry.rentAmount !== '' || entry.securityDeposit !== ''
    );

  return normalizedValues.length > 0 ? normalizedValues : [emptyRoomPrice()];
};

const PGModal = ({ pg, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'boys',
    roomType: 'any',
    totalRooms: 1,
    availableRooms: 1,
    roomPrices: [emptyRoomPrice()],
    inventory: emptyInventory(),
    amenities: [],
    images: [],
    description: '',
    status: 'active'
  });
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await ownersAPI.getOwners({ limit: 100 });
        setOwners(response.data.owners || []);
      } catch (error) {
        console.error('Failed to fetch owners:', error);
      }
    };
    fetchOwners();
  }, []);

  useEffect(() => {
    if (!pg) return;

    setFormData({
      name: pg.name || '',
      owner: pg.owner?._id || pg.owner || '',
      address: pg.address || '',
      city: pg.city || '',
      state: pg.state || '',
      pincode: pg.pincode || '',
      type: pg.type || 'boys',
      roomType: pg.roomType || 'any',
      totalRooms: parseCountValue(pg.totalRooms || 1),
      availableRooms: parseCountValue(pg.availableRooms || 0),
      roomPrices: normalizeRoomPrices(pg),
      inventory: {
        fanCount: parseCountValue(pg.inventory?.fanCount),
        lightCount: parseCountValue(pg.inventory?.lightCount),
        bedCount: parseCountValue(pg.inventory?.bedCount),
        cupboardCount: parseCountValue(pg.inventory?.cupboardCount),
        mattressCount: parseCountValue(pg.inventory?.mattressCount)
      },
      amenities: Array.isArray(pg.amenities) ? pg.amenities : [],
      images: Array.isArray(pg.images) ? pg.images : [],
      description: pg.description || '',
      status: pg.status || 'active'
    });
  }, [pg]);

  const handleRoomPriceChange = (index, fieldName, value) => {
    const nextRoomPrices = [...formData.roomPrices];
    nextRoomPrices[index] = {
      ...nextRoomPrices[index],
      [fieldName]: value
    };

    setFormData({ ...formData, roomPrices: nextRoomPrices });
  };

  const addRoomPrice = () => {
    setFormData({
      ...formData,
      roomPrices: [...formData.roomPrices, emptyRoomPrice()]
    });
  };

  const removeRoomPrice = (index) => {
    const nextRoomPrices = formData.roomPrices.filter((_, roomIndex) => roomIndex !== index);
    setFormData({
      ...formData,
      roomPrices: nextRoomPrices.length > 0 ? nextRoomPrices : [emptyRoomPrice()]
    });
  };

  const handleInventoryChange = (fieldName, value) => {
    setFormData({
      ...formData,
      inventory: {
        ...formData.inventory,
        [fieldName]: parseCountValue(value)
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        totalRooms: parseCountValue(formData.totalRooms),
        availableRooms: parseCountValue(formData.availableRooms)
      };

      payload.amenities = payload.amenities.filter((amenity) => amenity.trim());
      payload.images = payload.images.filter((image) => image.trim());

      payload.roomPrices = payload.roomPrices
        .map((entry, index) => {
          const variantLabel = entry.variantLabel.trim();
          const rentAmount = Number(entry.rentAmount);
          const securityDeposit = Number(entry.securityDeposit);

          if (!variantLabel || !Number.isFinite(rentAmount) || rentAmount < 0) return null;

          return {
            variantLabel,
            rentAmount,
            securityDeposit:
              Number.isFinite(securityDeposit) && securityDeposit >= 0 ? securityDeposit : 0,
            displayOrder: index
          };
        })
        .filter(Boolean);

      payload.inventory = {
        fanCount: parseCountValue(payload.inventory?.fanCount),
        lightCount: parseCountValue(payload.inventory?.lightCount),
        bedCount: parseCountValue(payload.inventory?.bedCount),
        cupboardCount: parseCountValue(payload.inventory?.cupboardCount),
        mattressCount: parseCountValue(payload.inventory?.mattressCount)
      };

      if (pg) {
        await pgsAPI.updatePG(pg._id, payload);
      } else {
        await pgsAPI.createPG(payload);
      }

      onSave();
    } catch (error) {
      console.error('Error saving PG:', error);
      alert(error.response?.data?.message || 'Error saving PG');
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    setFormData({ ...formData, amenities: [...formData.amenities, ''] });
  };

  const updateAmenity = (index, value) => {
    const nextAmenities = [...formData.amenities];
    nextAmenities[index] = value;
    setFormData({ ...formData, amenities: nextAmenities });
  };

  const removeAmenity = (index) => {
    const nextAmenities = formData.amenities.filter((_, amenityIndex) => amenityIndex !== index);
    setFormData({ ...formData, amenities: nextAmenities });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">{pg ? 'Edit Property' : 'Add New Property'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">PG Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Owner</label>
              <select
                required
                value={formData.owner}
                onChange={(event) => setFormData({ ...formData, owner: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Room Variants</label>
              <button
                type="button"
                onClick={addRoomPrice}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {formData.roomPrices.map((entry, index) => (
                <div key={`room-price-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-12">
                  <input
                    type="text"
                    placeholder="Variant label (e.g. Single AC)"
                    value={entry.variantLabel}
                    onChange={(event) => handleRoomPriceChange(index, 'variantLabel', event.target.value)}
                    className="col-span-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 md:col-span-5"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Rent amount"
                    value={entry.rentAmount}
                    onChange={(event) => handleRoomPriceChange(index, 'rentAmount', event.target.value)}
                    className="col-span-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 md:col-span-3"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Security deposit"
                    value={entry.securityDeposit}
                    onChange={(event) => handleRoomPriceChange(index, 'securityDeposit', event.target.value)}
                    className="col-span-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 md:col-span-3"
                  />
                  <button
                    type="button"
                    onClick={() => removeRoomPrice(index)}
                    className="col-span-1 rounded-md border border-red-200 px-2 py-2 text-sm text-red-600 hover:bg-red-50 md:col-span-1"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(event) => setFormData({ ...formData, state: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(event) => setFormData({ ...formData, pincode: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="co-living">Co-living</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Room Type</label>
              <select
                value={formData.roomType}
                onChange={(event) => setFormData({ ...formData, roomType: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="any">Any</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Rooms</label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalRooms}
                onChange={(event) =>
                  setFormData({ ...formData, totalRooms: parseCountValue(event.target.value) })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Available Rooms</label>
              <input
                type="number"
                required
                min="0"
                value={formData.availableRooms}
                onChange={(event) =>
                  setFormData({ ...formData, availableRooms: parseCountValue(event.target.value) })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Inventory Listings</label>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-cols-5">
              <div>
                <label className="block text-xs text-gray-600">Fans</label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory.fanCount}
                  onChange={(event) => handleInventoryChange('fanCount', event.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Lights</label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory.lightCount}
                  onChange={(event) => handleInventoryChange('lightCount', event.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Beds</label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory.bedCount}
                  onChange={(event) => handleInventoryChange('bedCount', event.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Cupboards</label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory.cupboardCount}
                  onChange={(event) => handleInventoryChange('cupboardCount', event.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Mattresses</label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory.mattressCount}
                  onChange={(event) => handleInventoryChange('mattressCount', event.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Amenities</label>
              <button
                type="button"
                onClick={addAmenity}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Amenity
              </button>
            </div>
            {formData.amenities.map((amenity, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={amenity}
                  onChange={(event) => updateAmenity(index, event.target.value)}
                  placeholder="Enter amenity"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PGs = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPg, setSelectedPg] = useState(null);
  const [approvingPgId, setApprovingPgId] = useState(null);
  const swal = window.Swal;

  const showError = async (title, text) => {
    if (swal) {
      await swal.fire({ icon: 'error', title, text });
      return;
    }
    alert(text || title);
  };

  const showSuccess = async (title, text) => {
    if (swal) {
      await swal.fire({ icon: 'success', title, text, timer: 1500, showConfirmButton: false });
      return;
    }
    if (text) alert(text);
  };

  const showConfirm = async (title, text, confirmButtonText) => {
    if (swal) {
      const result = await swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: 'No'
      });
      return result.isConfirmed;
    }
    return window.confirm(text || title);
  };

  const fetchPgs = async (page = 1, searchValue = '') => {
    try {
      setLoading(true);
      const response = await pgsAPI.getPGs({ page, limit: 10, search: searchValue });
      setPgs(response.data.pgs || []);
      setPagination(response.data.pagination || null);
      setError(null);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to fetch PGs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPgs(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAdd = () => {
    setSelectedPg(null);
    setShowModal(true);
  };

  const handleEdit = (pg) => {
    setSelectedPg(pg);
    setShowModal(true);
  };

  const handleDelete = async (pg) => {
    const isConfirmed = await showConfirm('Delete PG?', `Are you sure you want to delete ${pg.name}?`, 'Delete');
    if (!isConfirmed) return;

    try {
      await pgsAPI.deletePG(pg._id);
      await showSuccess('Deleted', `${pg.name} has been deleted`);
      fetchPgs(currentPage, searchTerm);
    } catch (apiError) {
      await showError('Delete failed', apiError.response?.data?.message || 'Failed to delete PG');
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchPgs(currentPage, searchTerm);
  };

  const handleApprovalAction = async (pg, action) => {
    if (!action) return;

    const isConfirmAction = action === 'confirm';
    const confirmed = await showConfirm(
      isConfirmAction ? 'Confirm PG?' : 'Cancel PG?',
      isConfirmAction
        ? `Confirm ${pg.name}. This will make it active in EasyPG Manager.`
        : `Cancel ${pg.name}. This will reject this PG.`,
      isConfirmAction ? 'Confirm' : 'Cancel PG'
    );
    if (!confirmed) return;

    try {
      setApprovingPgId(pg._id);
      try {
        await pgsAPI.approvePG(pg._id, action);
      } catch (primaryError) {
        if (primaryError.response?.status === 404 || primaryError.response?.status === 405) {
          await pgsAPI.updatePG(pg._id, { status: isConfirmAction ? 'active' : 'inactive' });
        } else {
          throw primaryError;
        }
      }

      await showSuccess(
        isConfirmAction ? 'PG Confirmed' : 'PG Cancelled',
        isConfirmAction
          ? `${pg.name} is now successfully saved in EasyPG Manager.`
          : `${pg.name} has been cancelled.`
      );
      fetchPgs(currentPage, searchTerm);
    } catch (apiError) {
      await showError('Approval failed', apiError.response?.data?.message || 'Failed to update approval status');
    } finally {
      setApprovingPgId(null);
    }
  };

  const resolveApprovalStatus = (approvalStatus, status) => {
    if (approvalStatus === 'pending' || approvalStatus === 'confirmed' || approvalStatus === 'cancelled') {
      return approvalStatus;
    }
    if (status === 'maintenance') return 'pending';
    if (status === 'active') return 'confirmed';
    if (status === 'inactive') return 'cancelled';
    return 'pending';
  };

  const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) return 'N/A';
    return `Rs ${numericValue.toLocaleString('en-IN')}`;
  };

  const resolveRoomPrices = (pg) => {
    if (Array.isArray(pg?.roomPrices)) return pg.roomPrices;
    if (Array.isArray(pg?.roomPricing)) return pg.roomPricing;
    return [];
  };

  const renderPriceRange = (pg) => {
    const roomPrices = resolveRoomPrices(pg);
    const rentValues = roomPrices
      .map((entry) => Number(entry?.rentAmount ?? entry?.rent ?? entry?.price))
      .filter((value) => Number.isFinite(value) && value >= 0);

    if (rentValues.length === 0) {
      return 'N/A';
    }

    const minPrice = Math.min(...rentValues);
    const maxPrice = Math.max(...rentValues);

    if (minPrice === maxPrice) {
      return formatCurrency(minPrice);
    }

    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'owner',
      label: 'Owner',
      render: (owner) => owner?.name || 'N/A'
    },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            type === 'boys'
              ? 'bg-blue-100 text-blue-800'
              : type === 'girls'
                ? 'bg-pink-100 text-pink-800'
                : 'bg-purple-100 text-purple-800'
          }`}
        >
          {type}
        </span>
      )
    },
    {
      key: 'roomType',
      label: 'Room Type',
      render: (roomType) => {
        if (!roomType) return 'N/A';
        return roomType.charAt(0).toUpperCase() + roomType.slice(1);
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            status === 'active'
              ? 'bg-green-100 text-green-800'
              : status === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      )
    },
    {
      key: 'approvalStatus',
      label: 'Approval',
      render: (approvalStatus, pg) => {
        const effectiveApprovalStatus = resolveApprovalStatus(approvalStatus, pg.status);

        if (effectiveApprovalStatus !== 'pending') {
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                effectiveApprovalStatus === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {effectiveApprovalStatus}
            </span>
          );
        }

        return (
          <select
            key={`${pg._id}-${effectiveApprovalStatus}`}
            defaultValue=""
            disabled={approvingPgId === pg._id}
            onChange={(event) => {
              handleApprovalAction(pg, event.target.value);
              event.target.value = '';
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{approvingPgId === pg._id ? 'Updating...' : 'Select'}</option>
            <option value="confirm">Confirm</option>
            <option value="cancel">Cancel</option>
          </select>
        );
      }
    },
    {
      key: 'roomPrices',
      label: 'Price Range',
      render: (_, pg) => renderPriceRange(pg)
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <CRUDTable
        data={pgs}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={setSearchTerm}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search PGs..."
        addButtonText="Add PG"
        title="PGs Management"
      />

      {showModal && (
        <PGModal
          pg={selectedPg}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default PGs;

