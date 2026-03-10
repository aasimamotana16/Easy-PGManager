const express = require('express');
const AdminConfig = require('../models/AdminConfig');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const agreementSettingsDefaults = {
  fixedClauses: [],
  jurisdiction: '',
  platformDisclaimer: '',
  esignConsentText: ''
};

const pricingRulesDefaults = {
  allowDepositPerVariant: false,
  depositModesAllowed: ['fixed'],
  maxDepositMonths: 1
};

const getConfig = async (key, defaults) => {
  const config = await AdminConfig.findOne({ key }).lean();
  if (!config || typeof config.value !== 'object' || config.value === null) {
    return { ...defaults };
  }
  return { ...defaults, ...config.value };
};

const saveConfig = async (key, value) => {
  await AdminConfig.findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return value;
};

router.get('/agreement-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await getConfig('agreementSettings', agreementSettingsDefaults);
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load agreement settings' });
  }
});

router.put('/agreement-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const payload = {
      fixedClauses: Array.isArray(body.fixedClauses) ? body.fixedClauses.filter(Boolean) : [],
      jurisdiction: (body.jurisdiction || '').toString(),
      platformDisclaimer: (body.platformDisclaimer || '').toString(),
      esignConsentText: (body.esignConsentText || '').toString()
    };

    const savedSettings = await saveConfig('agreementSettings', payload);
    return res.json(savedSettings);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update agreement settings' });
  }
});

router.get('/pricing-rules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rules = await getConfig('pricingRules', pricingRulesDefaults);
    return res.json(rules);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load pricing rules' });
  }
});

router.put('/pricing-rules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const depositModesAllowed = Array.isArray(body.depositModesAllowed)
      ? body.depositModesAllowed.filter((mode) => mode === 'fixed' || mode === 'months_rent')
      : [];

    const payload = {
      allowDepositPerVariant: Boolean(body.allowDepositPerVariant),
      depositModesAllowed: depositModesAllowed.length > 0 ? depositModesAllowed : ['fixed'],
      maxDepositMonths: Number.isFinite(Number(body.maxDepositMonths))
        ? Math.max(0, Math.floor(Number(body.maxDepositMonths)))
        : 1
    };

    const savedRules = await saveConfig('pricingRules', payload);
    return res.json(savedRules);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update pricing rules' });
  }
});

module.exports = router;
