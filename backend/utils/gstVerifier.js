// backend/utils/gstVerifier.js
// This file implements a MOCK GST verification service for development purposes.

export const verifyGst = async (gstin) => {
  console.log(`[MOCK SERVICE] Attempting GST Verification for: ${gstin}`);
  
  // 1. Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 500)); 

  // Basic structural validation (Check for 15 alphanumeric characters)
  if (!/^[0-9A-Z]{15}$/.test(gstin)) {
    throw new Error("Invalid GSTIN format. Must be 15 digits/letters.");
  }

  // --- MOCK BUSINESS LOGIC ---

  // MOCK RULE 1: Failed Verification (Simulate inactive or invalid)
  if (gstin.startsWith('00')) {
    return { 
        verified: false, 
        message: "GSTIN starts with '00' - Mock Failure: Business Inactive." 
    };
  }

  // MOCK RULE 2: Successful Verification - Premium Business
  if (gstin.startsWith('99')) {
    return { 
        verified: true,
        legalName: `PREMIUM MOCK RETAIL CORP ${gstin.substring(4)}`,
        state: 'Maharashtra',
        message: "Successfully verified (MOCK PREMIUM)"
    };
  }

  // MOCK RULE 3: Default Successful Verification
  return { 
      verified: true,
      legalName: `Standard Mock Retailer ${gstin}`,
      state: 'Karnataka',
      message: "Successfully verified (MOCK DEFAULT)"
  };
};