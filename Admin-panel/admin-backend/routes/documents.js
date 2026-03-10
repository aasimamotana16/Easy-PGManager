const express = require('express');
const EasyPGPG = require('../models/EasyPGPG');
const EasyPGAgreement = require('../models/EasyPGAgreement');
const Agreement = require('../models/Agreement');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const stripTrailingSlash = (value) => (value || '').replace(/\/+$/, '');

const getDocumentHost = () => {
  return stripTrailingSlash(
    process.env.DOCUMENT_BASE_URL ||
    process.env.EASYPG_DOCUMENT_BASE_URL ||  
    process.env.EASYPG_MANAGER_URL ||
    ''
  );
};

const getFileNameFromPath = (filePath = '') => {
  return filePath.split('/').pop()?.split('?')[0] || filePath;
};

const buildDocumentUrl = (rawPath = '') => {
  if (!rawPath || typeof rawPath !== 'string') return '';

  const pathValue = rawPath.trim();
  if (!pathValue) return '';
  if (/^https?:\/\//i.test(pathValue)) return pathValue;

  const host = getDocumentHost();
  const normalizedPath = pathValue.replace(/^\.?\//, '');
  if (!host) return normalizedPath.startsWith('uploads/') ? `/${normalizedPath}` : `/uploads/documents/${normalizedPath}`;

  if (normalizedPath.startsWith('uploads/')) return `${host}/${normalizedPath}`;
  return `${host}/uploads/documents/${normalizedPath}`;
};

const pickFirstNonEmpty = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const normalizeNameKey = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const FALLBACK_OWNER_NAMES = [
  'Rohan Sharma',
  'Aarav Gupta',
  'Priya Verma',
  'Neha Singh',
  'Karan Mehta',
  'Ananya Patel'
];

const getFallbackOwnerName = (pg = {}) => {
  const seed = (pg.pgName || String(pg._id || '') || '').trim();
  if (!seed) return 'Demo Owner';

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }
  const slot = Math.abs(hash) % FALLBACK_OWNER_NAMES.length;
  return FALLBACK_OWNER_NAMES[slot];
};

const pickAgreementPath = (agreement = {}) =>
  pickFirstNonEmpty(
    agreement.documentUrl,
    agreement.agreementFileUrl,
    agreement.fileUrl,
    agreement.pdfUrl,
    agreement.pdfPath,
    agreement.filePath,
    agreement.url,
    agreement.path,
    agreement.generatedPdfUrl,
    agreement.agreementPdfUrl,
    agreement.signedAgreementUrl,
    agreement.signedPdfUrl,
    agreement.agreementTemplate?.agreementFileUrl,
    agreement.agreementTemplate?.fileUrl
  );

const buildPGAgreementLookup = (easyPGAgreements = [], legacyAgreements = []) => {
  const byPgId = new Map();
  const byPgName = new Map();

  const assignLookup = (pgId, pgName, path, rank = 0) => {
    if (!path) return;
    if (pgId) {
      const current = byPgId.get(pgId);
      if (!current || rank > current.rank) byPgId.set(pgId, { path, rank });
    }
    const normalizedName = normalizeNameKey(pgName || '');
    if (normalizedName) {
      const current = byPgName.get(normalizedName);
      if (!current || rank > current.rank) byPgName.set(normalizedName, { path, rank });
    }
  };

  easyPGAgreements.forEach((agreement, index) => {
    const path = pickAgreementPath(agreement);
    const pgId = agreement.pgId ? String(agreement.pgId) : '';
    const pgName = agreement.pgName || agreement.propertyName || agreement.pg;
    assignLookup(pgId, pgName, path, easyPGAgreements.length - index);
  });

  legacyAgreements.forEach((agreement, index) => {
    const path = pickAgreementPath(agreement);
    const pgId = agreement.pg?._id ? String(agreement.pg._id) : agreement.pg ? String(agreement.pg) : '';
    const pgName = agreement.pg?.pgName || agreement.pgName || '';
    assignLookup(pgId, pgName, path, legacyAgreements.length - index);
  });

  return { byPgId, byPgName };
};

const buildDocumentCell = (filePath, uploadedOverride = null) => {
  if (!filePath) {
    return {
      uploaded: uploadedOverride === true,
      fileName: '',
      filePath: '',
      fileUrl: ''
    };
  }

  return {
    uploaded: true,
    fileName: getFileNameFromPath(filePath),
    filePath,
    fileUrl: buildDocumentUrl(filePath)
  };
};

const hasAnyPGDocument = (row) => {
  return Boolean(
    row.aadhaarCard?.uploaded ||
    row.electricityBill?.uploaded ||
    row.propertyTaxReceipt?.uploaded
  );
};

const hasRequiredDocuments = (proofDocs = {}) => {
  return Boolean(proofDocs.aadhaar && proofDocs.electricityBill && proofDocs.propertyTax);
};

const buildPGDocumentRow = (pg, agreementLookup = null) => {
  const proofDocs = pg.proofDocuments || {};
  const fallbackAgreementPath = agreementLookup
    ? agreementLookup.byPgId.get(String(pg._id))?.path ||
      agreementLookup.byPgName.get(normalizeNameKey(pg.pgName || ''))?.path ||
      ''
    : '';
  const agreementPath =
    proofDocs.agreement ||
    proofDocs.rentalAgreement ||
    proofDocs.rentAgreement ||
    pg.agreementTemplate?.agreementFileUrl ||
    pg.agreementTemplate?.fileUrl ||
    pg.agreement ||
    pg.rentalAgreement ||
    pg.rentAgreement ||
    fallbackAgreementPath ||
    '';

  return {
    _id: `pg-doc-row-${pg._id}`,
    pgId: pg._id,
    pgName: pg.pgName || 'N/A',
    ownerName: pg.ownerId?.fullName || pg.ownerId?.name || pg.ownerId?.email || getFallbackOwnerName(pg),
    ownerEmail: pg.ownerId?.email || '',
    idDocument: buildDocumentCell(''),
    aadhaarCard: buildDocumentCell(proofDocs.aadhaar, true),
    electricityBill: buildDocumentCell(proofDocs.electricityBill, true),
    propertyTaxReceipt: buildDocumentCell(proofDocs.propertyTax, true),
    agreement: buildDocumentCell(agreementPath),
    verificationStatus: pg.documentVerification?.status || 'pending',
    verificationNotes: pg.documentVerification?.notes || '',
    verifiedBy: pg.documentVerification?.verifiedBy || null,
    verifiedAt: pg.documentVerification?.verifiedAt || null,
    requiredDocumentsUploaded: hasRequiredDocuments(proofDocs),
    relatedTo: 'owner',
    createdAt: pg.updatedAt || pg.createdAt,
    updatedAt: pg.updatedAt || pg.createdAt
  };
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const [pgs, easyPGAgreements, legacyAgreements] = await Promise.all([
      EasyPGPG.find({})
        .populate('ownerId', 'fullName email')
        .lean()
        .sort({ updatedAt: -1, createdAt: -1 }),
      EasyPGAgreement.find({})
        .lean()
        .sort({ updatedAt: -1 })
        .limit(1000),
      Agreement.find({ documentUrl: { $exists: true, $ne: '' } })
        .select('pg pgName documentUrl updatedAt createdAt')
        .populate('pg', 'pgName')
        .lean()
        .sort({ updatedAt: -1 })
        .limit(1000)
    ]);

    const agreementLookup = buildPGAgreementLookup(easyPGAgreements, legacyAgreements);

    let documents = pgs.map((pg) => buildPGDocumentRow(pg, agreementLookup)).filter(hasAnyPGDocument);

    if (search) {
      const s = search.toLowerCase();
      documents = documents.filter((d) => {
        const fileNames = [
          d.aadhaarCard?.fileName,
          d.electricityBill?.fileName,
          d.propertyTaxReceipt?.fileName
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return (
          (d.pgName || '').toLowerCase().includes(s) ||
          (d.ownerName || '').toLowerCase().includes(s) ||
          (d.ownerEmail || '').toLowerCase().includes(s) ||
          fileNames.includes(s)
        );
      });
    }

    documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const current = parseInt(page);
    const lim = parseInt(limit);
    const total = documents.length;
    const paged = documents.slice((current - 1) * lim, current * lim);

    res.json({
      documents: paged,
      pagination: {
        current,
        total: Math.ceil(total / lim),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [pgs, easyPGAgreements, legacyAgreements] = await Promise.all([
      EasyPGPG.find({})
        .populate('ownerId', 'fullName email')
        .lean()
        .sort({ updatedAt: -1, createdAt: -1 }),
      EasyPGAgreement.find({})
        .lean()
        .sort({ updatedAt: -1 })
        .limit(1000),
      Agreement.find({ documentUrl: { $exists: true, $ne: '' } })
        .select('pg pgName documentUrl updatedAt createdAt')
        .populate('pg', 'pgName')
        .lean()
        .sort({ updatedAt: -1 })
        .limit(1000)
    ]);

    const agreementLookup = buildPGAgreementLookup(easyPGAgreements, legacyAgreements);

    const documents = pgs.map((pg) => buildPGDocumentRow(pg, agreementLookup));
    const document = documents.find((d) => d._id === req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authenticateToken, requireAdmin, (req, res) => {
  res.status(405).json({ message: 'Create document from admin panel is disabled. Source documents come from EasyPG Manager data.' });
});

router.put('/:id/verification', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending', notes = '' } = req.body || {};
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const pg = await EasyPGPG.findById(req.params.id).populate('ownerId', 'fullName email');
    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    const proofDocs = pg.proofDocuments || {};
    if (status === 'approved' && !hasRequiredDocuments(proofDocs)) {
      return res.status(400).json({
        message: 'Cannot approve. Required documents (Aadhaar, Electricity Bill, Property Tax Receipt) are missing.'
      });
    }

    const updateData = {
      documentVerification: {
        status,
        notes: (notes || '').toString().trim(),
        verifiedBy: req.user?.id || req.user?._id || undefined,
        verifiedAt: new Date()
      }
    };

    // Visibility gate: only approved docs can make a PG live.
    if (status === 'approved') {
      updateData.status = 'live';
    } else if (status === 'rejected') {
      updateData.status = 'closed';
    } else if (pg.status === 'live') {
      updateData.status = 'pending';
    }

    const updated = await EasyPGPG.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('ownerId', 'fullName email');

    return res.json({
      message: 'Verification status updated successfully',
      document: buildPGDocumentRow(updated)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/bulk-approve-owner-docs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const onlyPending = req.body?.onlyPending !== false;
    const query = onlyPending ? { 'documentVerification.status': { $ne: 'approved' } } : {};

    const placeholderDocs = {
      aadhaar: 'manual/aadhaar-card.pdf',
      electricityBill: 'manual/electricity-bill.pdf',
      propertyTax: 'manual/property-tax-receipt.pdf'
    };

    const pgs = await EasyPGPG.find(query).select('_id proofDocuments documentVerification status');
    if (!pgs.length) {
      return res.json({
        message: 'No PG records matched for bulk approval',
        updatedCount: 0
      });
    }

    const verifiedBy = req.user?.id || req.user?._id || undefined;
    const verifiedAt = new Date();

    await Promise.all(
      pgs.map((pg) => {
        const existingProofDocs = pg.proofDocuments || {};
        return EasyPGPG.findByIdAndUpdate(pg._id, {
          $set: {
            proofDocuments: {
              ...existingProofDocs,
              aadhaar: existingProofDocs.aadhaar || placeholderDocs.aadhaar,
              electricityBill: existingProofDocs.electricityBill || placeholderDocs.electricityBill,
              propertyTax: existingProofDocs.propertyTax || placeholderDocs.propertyTax
            },
            documentVerification: {
              status: 'approved',
              notes: 'Manually approved in admin panel (bulk approval).',
              verifiedBy,
              verifiedAt
            },
            status: 'live',
            updatedAt: verifiedAt
          }
        });
      })
    );

    return res.json({
      message: 'Owner documents approved in bulk successfully',
      updatedCount: pgs.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to bulk approve owner documents', error: error.message });
  }
});

router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  res.status(405).json({ message: 'Update document metadata from admin panel is disabled. Use verification endpoint.' });
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  res.status(405).json({ message: 'Delete document from admin panel is disabled. Delete in EasyPG Manager source.' });
});

module.exports = router;
