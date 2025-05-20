import React from 'react';
import type { Referral } from '../../../services/referral/types';

interface ReferralCardProps {
  referral: Referral;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ referral }) => {
  return (
    <div className="referral-card bg-white shadow rounded p-4">
      <h3 className="text-lg font-bold">Referral Code</h3>
      <p className="text-sm">{referral.code}</p>
      <p className="mt-2 text-sm">Usage Count: {referral.usageCount}</p>
    </div>
  );
};

export default ReferralCard;